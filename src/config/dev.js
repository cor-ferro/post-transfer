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
		send: 60000 / 6,
	},
	unpublished: {
		countByAttempt: 3,
	},
	db: {
		mongo: {
			path: 'mongodb://localhost/post-transfer',
		},
		redis: {
			queue: {
				id: 5,
				port: 6379,
				host: '127.0.0.1',
			},
		},
	},
	postSources: [
		// {
		// 	address: 'https://api.pratt.top/rss/special/vk.rss?group=-36775802&limit=5',
		// 	dataType: 'rss',
		// 	mapping: prattRssMapping,
		// },
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
