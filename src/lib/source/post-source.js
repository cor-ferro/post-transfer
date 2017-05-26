import Source from './source';
import readerFactory from '../reader';

class PostSource extends Source {
	constructor() {
		super();

		this.params = {};
	}


	static createFromConfig(configSource) {
		const postSource = new PostSource();

		const reader = readerFactory.createFromConfig(configSource);

		console.assert(reader, 'reader is undefined');

		postSource.setParams(configSource);
		postSource.setReader(reader);

		return postSource;
	}
}

export default PostSource;
