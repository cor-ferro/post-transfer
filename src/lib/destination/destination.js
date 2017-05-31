import request from 'request';
import { debugDest } from '../debug';

class Destination {
	static execPostRequest(requestParams) {
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
