import PostGrabber from './lib/grabber/post-grabber';
import PrattRssReader from './lib/reader/pratt-rss-reader';

const postGrabber = new PostGrabber();
const reader = new PrattRssReader();

postGrabber.setReader(reader);
postGrabber
	.grab()
	.then((data) => {
		console.log(data);
	});
