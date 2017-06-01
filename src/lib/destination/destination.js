import request from 'request';
import { debugDest } from '../debug';
import { ENV } from '../../config';

class Destination {
	constructor() {
		this.protocol = 'https://';
		this.host = 'localhost';
	}

	createUrl(...urlParts) {
		const url = urlParts.join('/');
		return `${this.protocol}${this.host}/${url}`;
	}

	static execPostRequest(requestParams) {
		if (ENV === 'dev') {
			console.log('falsy exec request');
			return Promise.resolve({});
		}

		return new Promise((resolve, reject) => {
			request.post(requestParams, (error, response, body) => {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					debugDest(body);
					resolve(JSON.parse(body));
				}
			});
		});
	}
}

export default Destination;
