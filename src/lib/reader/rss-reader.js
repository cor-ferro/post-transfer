import request from 'request';
import libxmljs from 'libxmljs';
import htmlparser from 'htmlparser2';
import Reader from './reader';
import { debugReader } from '../debug';

export default class RssReader extends Reader {
	read() {
		return new Promise((resolve, reject) => {
			let xml = null;

			debugReader('xml', this.resource);
			request(this.resource, (error, response, body) => {
				if (error) {
					reject(error);
				} else {
					xml = libxmljs.parseXml(body);

					resolve(xml);
				}
			});
		});
	}

	mapData(mapping, xmlData) {
		const xmlItems = xmlData.find(mapping.item);
		const output = [];

		for (let i = 0; i < xmlItems.length; i += 1) {
			const xmlItem = xmlItems[i];
			const item = {
				resources: [],
			};

			Object.keys(mapping.fields).forEach((fieldName) => {
				item[fieldName] = xmlItem.get(fieldName).text();
			});

			// console.log(item);
			// мега ужасный хук, исправить при следующем рефакторинге
			if (typeof item.description === 'string') {
				// const descriptionItems = htmlParser;

				const handler = new htmlparser.DomHandler();
				const parser = new htmlparser.Parser(handler);
				parser.write(item.description);
				parser.end();

				handler.dom
					.filter(node => node.name === 'img' && typeof node.attribs.src === 'string')
					.forEach((node) => {
						item.resources.push({
							type: 'image',
							url: node.attribs.src,
						});
					});
			}

			output.push(item);
		}

		return output;
	}
}
