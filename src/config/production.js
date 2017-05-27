const prattRssMapping = {
	item: '//item',
	fields: {
		title: 'title',
		description: 'description',
		guid: 'guid',
		pubDate: 'pubDate',
	},
};

export default {
	intervals: {
		grab: 60000 * 1,
		send: 60000 * 0.5,
	},
	unpublished: {
		countByAttempt: 5,
	},
	db: {
		mongo: {
			path: 'mongodb://localhost:42398/post-transfer',
		},
		redis: {
			queue: {
				id: 5,
				port: 32671,
				host: '127.0.0.1',
			},
		},
	},
	postSources: [
		{
			address: 'https://api.pratt.top/rss/special/vk.rss?group=-25813425&limit=5',
			dataType: 'rss',
			mapping: prattRssMapping,
		},
	],
	postDestinations: [
		{
			id: '5924bd8ad06e3171d10facab',
			type: 'facebook',
			enabled: true,
			params: {
				pageId: '789603997880305',
				token: 'EAAD3ytDhZAEsBABEAVbvguoLCKBZAKWKyJ203BtZBAbiO9Sfvq9hZCXrPfzyQSb3OaC640xefTcBaoegx7PeWbNGwVzyTIVkD0XarbL42FOQaA5ENaP5QT0kHxCbLO4qyZAv9xCw59xIWir5dl6qjUvrZAFAvZCZBzuQdk4KlnijKoUIQEFdz7jr',
			},
		},
	],
};
