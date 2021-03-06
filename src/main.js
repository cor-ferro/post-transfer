import app from './app';
import queueFactory from './lib/queue';
import config, { ENV } from './config';
import { debugApp, debugGrab, debugInterval } from './lib/debug';
import sourcesFactory from './lib/source';
import PostGrabber from './lib/grabber/post-grabber';
import PostModel from './models/Post';
import PostDestinationModel from './models/PostDestination';
import destinationsFactory from './lib/destination';
import { promisesSome } from './lib/utils';
import log from './lib/logger';

const queue = queueFactory.create();

let intervalGrabId = null;
let intervalSendId = null;

debugApp('start');

process.on('unhandledRejection', (reason) => {
	debugApp('unhandledRejection', reason);
});

async function grabPosts(dataPostSource) {
	const postSource = sourcesFactory.creteFromConfig(dataPostSource);
	const postGrabber = PostGrabber.create();
	postGrabber.setSource(postSource);

	return postGrabber.grab();
}

async function saveSourceDatasourceData(sourceData) {
	const destinations = await PostDestinationModel.find({ enabled: true });

	const guids = sourceData.items.map(sourcePost => String(sourcePost.guid));
	const existsModels = await PostModel.getByGuids(guids);

	const createPostPromises = [];

	guids.forEach((guid) => {
		const isModelExist = existsModels.find(model => model.guid === guid);

		if (!isModelExist) {
			const item = sourceData.items.find(sourcePost => sourcePost.guid === guid);
			const postModel = PostModel.createFromGrab(item);

			const promiseCreate = Promise.resolve()
				.then(() => postModel.setDestinations(destinations))
				.then(() => postModel.downloadResources())
				.then(() => postModel.save());

			createPostPromises.push(promiseCreate);
		}
	});

	return promisesSome(createPostPromises)
		.then((newModels) => {
			const newCount = newModels.length;
			const expectedCount = createPostPromises.length;

			debugApp(`create ${newCount}/${expectedCount} models`);

			if (expectedCount !== newCount) {
				log.warn(`'WARN. expected: save ${expectedCount}, received: ${newCount}`);
				debugApp(`'WARN. expected: save ${expectedCount}, received: ${newCount}`);
			}
		})
		.catch((error) => {
			log.objectError(error);
		});
}

async function sendUnpublishedPosts() {
	const destinations = await PostDestinationModel.find({ enabled: true });
	const unpublishedPosts = await PostModel.findUnPublished({
		limit: config.unpublished.countByAttempt,
	});

	const promises = [];

	if (unpublishedPosts.length === 0) {
		debugApp('no unpublished posts, skip.');
	} else {
		debugApp('send unpublished posts', unpublishedPosts.length);
	}

	unpublishedPosts.forEach((post) => {
		const unpublishedDestainations = post.getUnpublishedDestinations();

		unpublishedDestainations.forEach((postDestination) => {
			const destinationModel = destinationsFactory.getByModel(destinations, postDestination);

			if (!destinationModel) {
				log.warn('not found destination');
				debugApp('not found destination');
				postDestination.set('isFailed', true);
				postDestination.set('reason', 'not found destination');
				return post.save();
			}

			const destination = destinationsFactory.create(destinationModel);

			if (!destination) {
				log.warn(`unknown destination type ${destinationModel.type}`);
				debugApp(`unknown destination type ${destinationModel.type}`);
				postDestination.set('isFailed', true);
				postDestination.set('reason', `unknown destination type ${destinationModel.type}`);
				return post.save();
			}

			debugApp('create post');
			// const promise = Promise.resolve()
			const promise = destination
				.createPost(post)
				.then(() => {
					postDestination.set('isFailed', false);
					postDestination.set('isPublished', true);

					return post
						.tryReleaseResources()
						.then(() => post.save())
						.catch((error) => {
							log.objectError(error);
							return post.save();
						});
				})
				.catch((error) => {
					log.objectError(error);
					postDestination.set('failedReason', error.message);
					postDestination.set('isFailed', true);
					postDestination.set('isPublished', false);

					return post.save();
				});

			promises.push(promise);
		});
	});

	return promisesSome(promises);
}

async function intervalGrabPosts() {
	debugInterval('grab posts');

	const jobsPromises = config.postSources.map(postSource => queueFactory.createJob(queue, 'grabPosts', { postSource }));

	try {
		await Promise.all(jobsPromises);
	} catch (error) {
		log.objectError(error);
		return;
	}

	queue.process('grabPosts', 3, (localJob, done) => {
		grabPosts(localJob.data.postSource)
			.then(grabData => saveSourceDatasourceData(grabData))
			.then(() => done())
			.catch((error) => {
				log.objectError(error);
				done(error);
			});
	});
}

async function intervalSendPosts() {
	debugInterval('send posts');

	const job = queueFactory.buildJob(queue, 'sendPosts');

	job.removeOnComplete(true);

	await queueFactory.saveJob(job);

	queue.process('sendPosts', (localJob, done) => {
		sendUnpublishedPosts()
			.then(() => done())
			.catch((error) => {
				log.objectError(error);
				done(error);
			});
	});
}

// @todo: удалить перед релизом
app.once('ready', async () => {
	if (ENV === 'dev') {
		debugApp('dev env, clear posts');
		await PostModel.remove({});
	}

	app.emit('start');

	intervalGrabPosts();
});

app.on('start', () => {
	debugApp('start app');
	log.info('start app event');
	const intervalGrabMs = config.intervals.grab;
	const intervalSendMs = config.intervals.send;

	const SAFE_INTERVAL = 5000;
	const isTooLowerInterval = [
		intervalGrabMs,
		intervalSendMs,
	].some(interval => interval < SAFE_INTERVAL);

	if (isTooLowerInterval) {
		debugApp(`some interval, value is lower than ${SAFE_INTERVAL}. prevent start app.`);
		log.warn(`some interval, value is lower than ${SAFE_INTERVAL}. prevent start app.`);
		return;
	}

	intervalGrabId = setInterval(intervalGrabPosts, intervalGrabMs);
	intervalSendId = setInterval(intervalSendPosts, intervalSendMs);
});

app.on('stop', () => {
	debugApp('stop app');
	log.info('stop app event');
	clearInterval(intervalGrabId);
	clearInterval(intervalSendId);
});

queue.on('job complete', id => debugGrab('job complete', id));

app.run();
