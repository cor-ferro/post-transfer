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
	db: {
		path: 'mongodb://localhost:42398/post-transfer',
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
				token: 'EAACEdEose0cBAIZCg3x1KC8AL5CFNDAouDj3K1iGHqML9KtD4zQehI2vna36QfDVg7PstgHs8gSPhGRDJhRbZClZBOCntZBKoKB3DvO9pZBkHPjQ9Gzwa6fCLNimGmchOoJ91gt4o75P1OT1tEVVjQS4RDUuDWpIKpmx8sZB4VZCizWcieiOo4K4ZA6o04awFX4ZD',
			},
		},
	],
};
