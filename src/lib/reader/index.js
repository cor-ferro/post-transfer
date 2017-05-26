import RssReader from './rss-reader';
import JsonReader from './json-reader';

export const READER_TYPE_RSS = 'rss';
export const READER_TYPE_JSON = 'json';

export default {
	createFromConfig(sourceConfig) {
		let reader = null;
		switch (sourceConfig.dataType) {
		case READER_TYPE_RSS: reader = new RssReader(); break;
		case READER_TYPE_JSON: reader = new JsonReader(); break;
		default: throw new Error(`unknown reader data type: ${sourceConfig.dataType}`);
		}

		reader.setResource(sourceConfig.address);

		return reader;
	},
};
