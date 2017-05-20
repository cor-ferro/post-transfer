import RssReader from './rss-reader';

export default class PrattRssReader extends RssReader {
	async read() {
		this.setResource('https://api.pratt.top/rss/special/vk.rss?group=-36775802&limit=2');

		const xmlDoc = await this.readXml();

		const xmlItems = xmlDoc.find('//item');
		const output = [];

		for (let i = 0; i < xmlItems.length; i += 1) {
			const xmlItem = xmlItems[i];
			const item = {
				title: xmlItem.get('title').text(),
				description: xmlItem.get('description').text(),
				guid: xmlItem.get('guid').text(),
				pubDate: xmlItem.get('pubDate').text(),
			};

			output.push(item);
		}

		return output;
	}
}

/*
	<title>
		<![CDATA[ ]]>
	</title>
	<description>
		<![CDATA[
		<img src="https://pp.userapi.com/c639917/v639917000/21c9b/q3gn11wIfXc.jpg" />
		]]>
	</description>
	<guid isPermaLink="false">MG9oOQi3</guid>
	<pubDate>Sat, 20 May 2017 20:35:02 GMT</pubDate>
*/
