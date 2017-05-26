import request from 'request';
import fs from 'fs';
import Promise from 'bluebird';
import de from 'deep-extend';
import Destination from './destination';
import { debugDest } from '../debug';

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
			console.log('this.createPagePost');
			return this.createPagePost(modelPost);
		} else {
			console.log('only pages');
			throw new Error('support only pages');
		}
	}

	async createPagePost(modelPost) {
		console.log('createPagePost');
		const imageResourcePromises = modelPost.resources
			.filter(filterImageResource)
			.slice(0, 1) // @todo: В фейсбук грузим одну фотку, решить проблему
			.map(resource => this.createPagePhoto(resource, { no_story: true }));

		const imageResourcePromisesSize = imageResourcePromises.length - 1;
		let uploadedPhotos = [];

		if (imageResourcePromises.length > 0) {
			uploadedPhotos = await Promise.some(imageResourcePromises, imageResourcePromisesSize || 1);
		}

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
					console.log(error);
					reject();
				} else {
					console.log(body);
					resolve(JSON.parse(body));
				}
			});
		});
	}

	createPagePhoto(resource, postOptions = {}) {
		return new Promise((resolve, reject) => {
			if (!resource) {
				resolve();
				return;
			}

			// стаб, удалить при релизе
			// resolve({
			// 	id: '790076047833100',
			// 	post_id: '789603997880305_790076047833100',
			// });

			const requestParams = this.createRequestParams({
				uri: this.createPageUrl(['photos']),
				qs: postOptions,
				formData: {
					file: fs.createReadStream(resource.localPath),
				},
			});

			request.post(requestParams, (error, response, body) => {
				if (error) {
					console.log(error);
					reject();
				} else {
					console.log(body);
					resolve(JSON.parse(body));
				}
			});
		});
	}

	createRequestParams(options = {}) {
		console.assert(this.params.token);
		const requestParams = Object.assign({}, options, {
			qs: Object.assign({}, options.qs, {
				access_token: this.params.token,
			}),
		});

		return requestParams;
	}

	createPageUrl(params = []) {
		console.assert(this.params.pageId);

		const urlPath = [this.params.pageId].concat(params).join('/');
		return `${PROTOCOL}${HOST}/${urlPath}`;
	}

	setParams(params) {
		this.params = params;
	}
}

export default FacebookDestination;
