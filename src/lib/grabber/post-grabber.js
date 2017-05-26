import Grabber from './grabber';

class PostGrabber extends Grabber {
	static create() {
		return new PostGrabber();
	}
}


export default PostGrabber;
