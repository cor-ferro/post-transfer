import path from 'path';
import fs from 'fs';
import request from 'request';
import mongoose, { Schema } from 'mongoose';
import Promise from 'bluebird';
import fse from 'fs-extra';
import config from '../config';
import { debugFileResources } from '../lib/debug';

let Post;

export const POST_FILE_TYPE_IMAGE = 'image';
export const POST_FILE_TYPE_VIDEO = 'video';

const postSchema = mongoose.Schema({
	title: String,
	description: String,
	guid: String,
	pubDate: Date,
	grab: {
		at: Date,
	},
	source: Object,
	destinations: [{
		_id: Schema.Types.ObjectId,
		isPublished: { type: Boolean, default: false },
		isFailed: Boolean,
		failedReason: String,
	}],
	resources: [
		{
			type: { type: String, enum: [POST_FILE_TYPE_IMAGE, POST_FILE_TYPE_VIDEO] },
			url: String,
			localPath: String,
		},
	],
});

postSchema.index({ guid: 1 });
postSchema.index({ 'grab.at': 1 });

if (!postSchema.options.toObject) postSchema.options.toObject = {};
postSchema.options.toObject.transform = function (doc, ret) {
	delete ret._id;
	return ret;
};

postSchema.static('createFromGrab', (grabbedPost) => {
	const model = new Post();

	const resources = grabbedPost.resources.map((resource) => {
		return {
			type: resource.type,
			url: resource.url,
			localPath: null,
		};
	});

	model.set('title', grabbedPost.title);
	model.set('description', grabbedPost.description);
	model.set('guid', grabbedPost.guid);
	model.set('pubDate', grabbedPost.pubDate);
	model.set('resources', resources);
	model.set('grab.at', new Date());

	return model;
});

postSchema.static('findUnPublished', ({ limit }) => {
	const query = Post
		.find({
			'destinations.isPublished': false,
			'destinations.isFailed': false,
		})
		.sort({ 'grab.at': -1 })
		.limit(limit || 10);

	return query.exec();
});

postSchema.methods.getUnpublishedDestinations = function getUnpublishedDestinations() {
	return this.destinations.filter((destination) => {
		const isNotPublished = destination.isPublished === false;
		const isNotFailed = destination.isFailed === false;

		return isNotPublished && isNotFailed;
	});
};

postSchema.methods.getPostDirPath = function getPostDirPath() {
	const postId = this.get('_id').toString();
	return path.join(config.filesStorage, postId);
};

postSchema.methods.isAllDestinationsPublished = function isAllDestinationsPublished() {
	return this.destinations.every(destination => destination.isPublished === true);
};

postSchema.methods.downloadResources = async function downloadResources() {
	const postDirPath = this.getPostDirPath();

	await fse.ensureDir(postDirPath);

	const resourcesPromises = this.resources
		.filter((resource => resource.type === POST_FILE_TYPE_IMAGE && !resource.localPath))
		.map((resource) => {
			return new Promise((resolve, reject) => {
				const fileName = path.basename(resource.url);
				const localPath = path.join(postDirPath, fileName);

				request
					.get(resource.url, { timeout: 3000 })
					.on('response', () => {
						resource.set('localPath', localPath);
						resolve();
					})
					.on('error', () => resolve({ path: null, resource }))
					.pipe(fs.createWriteStream(localPath));
			});
		});

	await Promise.all(resourcesPromises);
};

postSchema.methods.tryReleaseResources = async function tryReleaseResources() {
	return Promise.resolve(this.isAllDestinationsPublished())
		.then((isAllPublished) => {
			return isAllPublished ? this.releaseResources() : Promise.resolve();
		});
};

postSchema.methods.releaseResources = async function releaseResources() {
	const postDirPath = this.getPostDirPath();

	debugFileResources(`release ${this.get('_id')}`);

	await fse.remove(postDirPath);

	this.descriptionFiles.forEach((descriptionFile, descriptionFileIndex) => {
		this.set(`descriptionFiles.${descriptionFileIndex}.localPath`, null);
	});
};

postSchema.methods.setSource = function setSource(source) {
	this.set('source', source);
};

postSchema.methods.setDestinations = function setDestinations(destinations = []) {
	this.set('destinations', destinations.map((destination) => {
		return {
			_id: destination.get('_id'),
			isPublished: false,
			isFailed: false,
		};
	}));
};

Post = mongoose.model('Post', postSchema);

export default Post;
