import createDebug from 'debug';

const debugGrab = createDebug('grab');
const debugApp = createDebug('app');
const debugDb = createDebug('db');
const debugSource = createDebug('source');
const debugDest = createDebug('destination');
const debugReader = createDebug('reader');
const debugInterval = createDebug('interval');

export {
	debugApp,
	debugGrab,
	debugDb,
	debugSource,
	debugReader,
	debugDest,
	debugInterval,
};
