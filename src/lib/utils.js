import log from './logger';

export function promisesSome(promises = []) {
	return Promise
		.all(promises.map((promise) => {
			if (!promise.reflect) {
				log.info('no promise.reflect');
				log.info(promise);
				console.log(promise);
				return Promise.resolve(promise);
			}

			return promise.reflect();
		}))
		.filter(promise => promise.isFulfilled())
		.map(promise => promise.value());
}

export default {};
