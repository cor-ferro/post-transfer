export default class Grabber {
	constructor() {
		this.source = [];
	}

	setSource(source = {}) {
		this.source = source;
	}

	async grab() {
		const sourceData = await this.source.read();

		return {
			items: sourceData,
		};

		// sourcesData.forEach((sourceData, sourceIndex) => {
		// 	output.push({
		// 		source: this.sources[sourceIndex],
		// 		items: sourceData,
		// 	});
		// });

		// return output;
	}
}
