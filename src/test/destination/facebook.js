import should from 'should';
import sinon from 'sinon';
import request from 'request';
import destinationFactory from '../../lib/destination/index';

describe('facebook', () => {
	let facebookDest = null;
	let sandbox = null;

	before(() => {
		facebookDest = destinationFactory.create({
			type: 'facebook',
			params: {
				token: '123',
				pageId: 1,
			},
		});

		sandbox = sinon.sandbox.create();
		sandbox.stub(request, 'post');
	});

	after(() => {
		sandbox.restore();
	});

	it('createPost', () => {
		throw new Error();
	});

	it('createPageEntity', () => { throw new Error(); });
	it('createPagePost', () => { throw new Error(); });
	it('createPagePhoto', () => { throw new Error(); });
	it('createPageAlbum', () => { throw new Error(); });
	it('createAlbumPhoto', () => { throw new Error(); });
	it('createRequestParams', () => { throw new Error(); });
	it('createPageUrl', () => { throw new Error(); });
});
