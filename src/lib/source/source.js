import { debugSource } from '../debug';

class Source {
	constructor() {
		this.reader = null;
	}

	setReader(reader) {
		this.reader = reader;
	}

	getReader() {
		return this.reader;
	}

	setParams(params = {}) {
		this.params = params;
	}

	async read() {
		debugSource('read');
		const reader = this.getReader();
		const rawData = await reader.read();
		const formattedData = reader.mapData(this.params.mapping, rawData);

		return formattedData;
	}
}

export default Source;
