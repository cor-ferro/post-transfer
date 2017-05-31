import mongoose from 'mongoose';

const postDestinationSchema = mongoose.Schema({
	type: {
		type: String, enum: ['facebook'],
	},
	enabled: Boolean,
	params: Object,
});

const PostDestination = mongoose.model('PostDestination', postDestinationSchema);

export default PostDestination;
