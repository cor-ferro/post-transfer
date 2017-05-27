import createDebug from 'debug';

const debugGrab = createDebug('post.grab');
const debugApp = createDebug('post.app');
const debugDb = createDebug('post.db');
const debugSource = createDebug('post.source');
const debugDest = createDebug('post.destination');
const debugReader = createDebug('post.reader');
const debugInterval = createDebug('post.interval');
const debugFileResources = createDebug('post.file-resource');

export {
	debugApp,
	debugGrab,
	debugDb,
	debugSource,
	debugReader,
	debugDest,
	debugInterval,
	debugFileResources,
};
