import request from 'request';
import libxmljs from 'libxmljs';
import Reader from './reader';

export default class RssReader extends Reader {
	readXml() {
		return new Promise((resolve, reject) => {
			let xml = null;

			request(this.resource, (error, response, body) => {
				if (error) {
					reject(error);
				} else {
					xml = libxmljs.parseXml(body);

					resolve(xml);
				}
			});
		});
	}
}
