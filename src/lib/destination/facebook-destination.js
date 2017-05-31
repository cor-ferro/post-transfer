import request from 'request';
import fs from 'fs';
import Promise from 'bluebird';
import Destination from './destination';
import { debugDest } from '../debug';
import { promisesSome } from '../utils';
import { ENV } from '../../config';
import log from '../logger';

import { POST_FILE_TYPE_IMAGE } from '../../models/Post';

const PROTOCOL = 'https://';
const HOST = 'graph.facebook.com';

function filterImageResource(resource) {
	return typeof resource.localPath === 'string' && resource.type === POST_FILE_TYPE_IMAGE;
}

class FacebookDestination extends Destination {
	constructor(params = {}) {
		super();

		this.params = {};

		this.setParams(params);
	}

	readPage() {
		const pageUrl = this.createPageUrl([]);
		const requestParams = this.createRequestParams({
			method: 'GET',
			uri: pageUrl,
		});

		console.log(requestParams);

		request(requestParams, (error, response, body) => {
			console.log(body);
		});
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
				return this.createPageAlbum(imageResources, { name: modelPost.title });
			} else if (imageResources.length === 1) {
				debugDest('createPageEntity page photo');
				return this.createPagePhoto(imageResources[0], { caption: modelPost.title });
			} else if (imageResources.length === 0 && !modelPost.isEmptyTitle()) {
				debugDest('createPageEntity page post');
				return this.createPagePost(modelPost);
			}
		} catch (err) {
			log.objectError(err);
		}

		return Promise.resolve();
	}

	async createPagePost(modelPost) {
		try {
			debugDest('facebook createPagePost');

			if (ENV === 'dev') {
				console.log('falsy create post');
				return Promise.resolve({});
			}

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

			return new Promise((resolve, reject) => {
				request.post(requestParams, (error, response, body) => {
					if (error) {
						log.objectError(error);
						reject();
					} else {
						debugDest(body);
						resolve(JSON.parse(body));
					}
				});
			});
		} catch (err) {
			log.objectError(err);
		}

		return Promise.resolve();
	}

	createPagePhoto(resource, postOptions = {}) {
		return new Promise((resolve, reject) => {
			if (!resource) {
				resolve();
				return;
			}

			const requestParams = this.createRequestParams({
				uri: this.createPageUrl(['photos']),
				qs: postOptions,
				formData: {
					file: fs.createReadStream(resource.localPath),
				},
			});

			request.post(requestParams, (error, response, body) => {
				if (error) {
					reject(error);
				} else {
					resolve(JSON.parse(body));
				}
			});
		});
	}

	async createPageAlbum(imageResources, { name, message }) {
		try {
			const albumRequestParams = this.createRequestParams({
				uri: this.createPageUrl(['albums']),
				qs: { message, name },
			});

			const album = await Destination.execPostRequest(albumRequestParams);

			const photoPromises = imageResources.map(resource => this.createAlbumPhoto(album, resource));

			await promisesSome(photoPromises);

			return album;
		} catch (err) {
			log.objectError(err);
			return {};
		}
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

	createUrl(...urlParts) {
		const url = urlParts.join('/');
		return `${PROTOCOL}${HOST}/${url}`;
	}

	setParams(params) {
		console.assert(params.token);
		this.params = params;
	}
}

export default FacebookDestination;
