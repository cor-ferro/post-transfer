import log from './logger';

const FAIL_PROMISE = Symbol('fail promise');

export function promisesSome(promises = []) {
	return Promise
		.all(promises.map(promise => promise.catch((error) => {
			log.objectError(error);
			return FAIL_PROMISE;
		})))
		.then(results => results.filter(value => value !== FAIL_PROMISE));
}

export default {};
