import mongoose from 'mongoose';
import config from '../config';

export default {
	connect() {
		mongoose.connect(config.db.path);
	},
};
