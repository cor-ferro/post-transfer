import mongoose from 'mongoose';
import Promise from 'bluebird';
import config from '../config';
import { debugDb } from '../lib/debug';

mongoose.Promise = Promise;

export default {
	connection: null,
	connect() {
		this.connection = mongoose.connect(config.db.path);

		this.connection = mongoose.connection;
		this.connection.on('error', (error) => {
			debugDb(error);
		});
	},
};
