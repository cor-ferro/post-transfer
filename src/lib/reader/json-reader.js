import request from 'request';
import Reader from './reader';
import { debugReader } from '../debug';

export default class JsonReader extends Reader {
	read() {
		return new Promise((resolve, reject) => {
			let json = null;

			debugReader('json', this.resource);
			request(this.resource, (error, response, body) => {
				if (error) {
					reject(error);
				} else {
					json = JSON.parse(body);

					resolve(json);
				}
			});
		});
	}

	mapData(mapping, data) {
		debugReader('json map data not implemented');
		return data;
	}
}
