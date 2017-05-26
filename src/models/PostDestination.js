import mongoose from 'mongoose';
// import Promise from 'bluebird';

const postDestinationSchema = mongoose.Schema({
	type: {
		type: String, enum: ['facebook'],
	},
	enabled: Boolean,
	params: Object,
});

const PostDestination = mongoose.model('PostDestination', postDestinationSchema);

export default PostDestination;
