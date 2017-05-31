export function promisesSome(promises = []) {
	return Promise
		.all(promises.map(promise => promise.reflect()))
		.filter(promise => promise.isFulfilled())
		.map(promise => promise.value());
}

export default {};
