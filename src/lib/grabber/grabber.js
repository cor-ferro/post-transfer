export default class Grabber {
	constructor() {
		this.reader = null;
	}

	setReader(reader) {
		this.reader = reader;
	}

	async grab() {
		const data = await this.reader.read();

		return data;
	}
}
