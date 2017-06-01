import fs from 'fs';
import Destination from './destination';
import { debugDest } from '../debug';
import { promisesSome } from '../utils';
import log from '../logger';

import { POST_FILE_TYPE_IMAGE } from '../../models/Post';

function filterImageResource(resource) {
	return typeof resource.localPath === 'string' && resource.type === POST_FILE_TYPE_IMAGE;
}

class FacebookDestination extends Destination {
	constructor(params = {}) {
		super();

		this.host = 'graph.facebook.com';
		this.protocol = 'https://';
		this.params = {};

		this.setParams(params);
	}

	createPost(modelPost) {
		if (typeof this.params.pageId !== 'undefined') {
			return this.createPageEntity(modelPost);
		}

		debugDest('facebook support only pages');
		throw new Error('support only pages');
	}

	async createPageEntity(modelPost) {
		try {
			debugDest('facebook createPageEntity');

			const imageResources = modelPost.resources.filter(filterImageResource);

			if (imageResources.length > 1) {
				debugDest('createPageEntity page album');
				return await this.createPageAlbum(imageResources, { name: modelPost.title });
			} else if (imageResources.length === 1) {
				debugDest('createPageEntity page photo');
				return await this.createPagePhoto(imageResources[0], { caption: modelPost.title });
			} else if (imageResources.length === 0 && !modelPost.isEmptyTitle()) {
				debugDest('createPageEntity page post');
				return await this.createPagePost(modelPost);
			}
		} catch (error) {
			log.objectError(error);
			return Promise.reject(error);
		}

		return Promise.resolve();
	}

	async createPagePost(modelPost) {
		debugDest('facebook createPagePost');

		const imageResourcePromises = modelPost.resources
			.filter(filterImageResource)
			.slice(0, 1) // @todo: В фейсбук грузим одну фотку, решить проблему
			.map(resource => this.createPagePhoto(resource, { no_story: true }));

		const uploadedPhotos = await promisesSome(imageResourcePromises);

		const pageUrl = this.createPageUrl(['feed']);
		const urlOptions = {
			message: modelPost.title,
		};
		const form = {};

		uploadedPhotos.forEach((uploadedPhoto) => {
			form.object_attachment = uploadedPhoto.id;
		});

		const requestParams = this.createRequestParams({
			method: 'POST',
			uri: pageUrl,
			qs: urlOptions,
			form,
		});

		return Destination.execPostRequest(requestParams);
	}

	async createPagePhoto(resource, postOptions = {}) {
		if (!resource) {
			return Promise.reject(new Error('empty resource'));
		}

		const requestParams = this.createRequestParams({
			uri: this.createPageUrl(['photos']),
			qs: postOptions,
			formData: {
				file: fs.createReadStream(resource.localPath),
			},
		});

		const photo = await Destination.execPostRequest(requestParams);

		return photo;
	}

	async createPageAlbum(imageResources, { name, message }) {
		const albumRequestParams = this.createRequestParams({
			uri: this.createPageUrl(['albums']),
			qs: { message, name },
		});

		const album = await Destination.execPostRequest(albumRequestParams);

		const photoPromises = imageResources.map(resource => this.createAlbumPhoto(album, resource));

		const photos = await promisesSome(photoPromises);

		if (photos.length !== photoPromises) {
			log.warn(`Not all photos saved ${JSON.stringify(album)}`);
		}

		return album;
	}

	createAlbumPhoto(album, resource) {
		const photoAlbumRequestParams = this.createRequestParams({
			uri: this.createUrl(album.id, 'photos'),
			formData: {
				source: fs.createReadStream(resource.localPath),
			},
		});

		return Destination.execPostRequest(photoAlbumRequestParams);
	}

	createRequestParams(options = {}) {
		const requestParams = Object.assign({}, options, {
			qs: Object.assign({}, options.qs, {
				access_token: this.params.token,
			}),
		});

		return requestParams;
	}

	createPageUrl(params = []) {
		const urlPath = [this.params.pageId].concat(params).join('/');
		return this.createUrl(urlPath);
	}

	setParams(params) {
		console.assert(params.token);
		this.params = params;
	}
}

export default FacebookDestination;
