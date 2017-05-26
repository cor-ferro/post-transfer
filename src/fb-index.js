import FacebookDestination from './lib/destination/facebook-destination';

const fbDest = new FacebookDestination({
	token: 'EAACEdEose0cBAJbF4kEh2fOZAasukZABjoIhNnhZBsZCLzn5VO3knhNdP0qPvh8DLkvrgNrG1oFpI8vFepwjp1SMvAkvXunTZAYB9tCNZCPZAqvbG78SJwhuVkGi7rCybC7okUyozSNy7tYALDGZCNKDmOQzXFqmKMg6ZBJrZCa8LP6ixxtnlBarq0fgZCXVeQnRZBQZD',
	pageId: '789603997880305',
});

console.log('create post');

// fbDest.createPagePhoto({
// 	localPath: '/home/demitriy/Downloads/Iron-Man-tall-l.jpg',
// }, {
// 	no_story: true,
// });


fbDest.createPagePost({
	title: `post #${Date.now()}`,
	resources: [
		// {
		// 	type: 'image',
		// 	localPath: '/home/demitriy/Downloads/Iron-Man-tall-l.jpg',
		// },
	],
});

console.log('fbDest created');
