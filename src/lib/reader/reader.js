export default class Reader {
	constructor() {
		this.resource = '';
	}

	setResource(resource) {
		this.resource = resource;
	}

	getResource() {
		return this.resource;
	}

	mapData() {
		throw new Error('method should be overrided');
	}
}
