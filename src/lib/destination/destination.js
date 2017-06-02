import request from 'request';
import log from '../logger';
import { debugDest } from '../debug';
import { ENV } from '../../config';

class Destination {
	constructor(params) {
		this.params = {};
		this.protocol = 'https://';
		this.host = 'localhost';

		this.setParams(params);
	}

	createUrl(...urlParts) {
		const url = urlParts.join('/');
		return `${this.protocol}${this.host}/${url}`;
	}

	setParams(params) {
		this.params = params;
	}

	static execPostRequest(requestParams) {
		if (ENV === 'dev') {
			console.log('falsy exec request');
			return Promise.resolve({});
		}

		return new Promise((resolve, reject) => {
			request.post(requestParams, (error, response, body) => {
				if (error) {
					log.objectError(error);
					reject(error);
				} else {
					// facebook specefic log
					debugDest('X-Page-Usage', response.headers['x-page-usage']);
					debugDest(body);
					resolve(JSON.parse(body));
				}
			});
		});
	}
}

export default Destination;
