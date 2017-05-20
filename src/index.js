import app from './app';
import { debugApp, debugGrab } from './lib/debug';
import PostGrabber from './lib/grabber/post-grabber';
import PrattRssReader from './lib/reader/pratt-rss-reader';

debugApp('start');

const postGrabber = new PostGrabber();
const reader = new PrattRssReader();
reader.setResource('https://api.pratt.top/rss/special/vk.rss?group=-36775802&limit=2');

postGrabber.setReader(reader);
postGrabber
	.grab()
	.then((data) => {
		app.grabEvents.emit('end', {
			resource: reader.getResource(),
			data,
		});
	})
	.catch((e) => {
		debugGrab(e);
	});

app.grabEvents.on('end', (event) => {
	const { data } = event;

	debugGrab('data', data);
});
