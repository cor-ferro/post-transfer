import Promise from 'bluebird';
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
	const postPromises = sourceData.items.map(sourcePost => new Promise((resolve, reject) => {
		const postModel = PostModel.createFromGrab(sourcePost);

		return Promise.resolve()
			// исправить скачивание файлов
			// удалять файлы после отправки
			.then(() => postModel.downloadResources())
			.then(() => postModel.setDestinations(destinations))
			.then(() => {
				return PostModel
					.count({ guid: postModel.get('guid') })
					.exec()
					.then(count => (count === 0 ? postModel.save() : null));
			})
			.then(() => resolve())
			.catch(error => reject(error));
	}));

	return promisesSome(postPromises)
		.then(() => debugApp('all posts saved'))
		.catch(error => debugGrab(error));
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
				debugApp('not found destination');
				postDestination.set('isFailed', true);
				postDestination.set('reason', 'not found destination');
				return post.save();
			}

			const destination = destinationsFactory.create(destinationModel);

			if (!destination) {
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
						.catch(() => post.save());
				})
				.catch((error) => {
					debugApp(error.message);
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
	await Promise.all(jobsPromises);

	queue.process('grabPosts', 3, (localJob, done) => {
		grabPosts(localJob.data.postSource)
			.then(grabData => saveSourceDatasourceData(grabData))
			.then(() => done())
			.catch(done);
	});
}

async function intervalSendPosts() {
	debugInterval('send posts');

	await queueFactory.createJob(queue, 'sendPosts');
	queue.process('sendPosts', (localJob, done) => {
		sendUnpublishedPosts()
			.then(() => done())
			.catch(done);
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
	const intervalGrabMs = config.intervals.grab;
	const intervalSendMs = config.intervals.send;

	const SAFE_INTERVAL = 5000;
	const isTooLowerInterval = [
		intervalGrabMs,
		intervalSendMs,
	].some(interval => interval < SAFE_INTERVAL);

	if (isTooLowerInterval) {
		debugApp(`some interval, value is lower than ${SAFE_INTERVAL}. prevent start app.`);
		return;
	}

	intervalGrabId = setInterval(intervalGrabPosts, intervalGrabMs);
	intervalSendId = setInterval(intervalSendPosts, intervalSendMs);
});

app.on('stop', () => {
	debugApp('stop app');
	clearInterval(intervalGrabId);
	clearInterval(intervalSendId);
});

queue.on('job complete', id => debugGrab('job complete', id));

app.run();
