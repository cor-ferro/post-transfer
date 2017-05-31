import EventEmitter from 'events';
import fse from 'fs-extra';
import { debugApp, debugDb } from '../lib/debug';
import db from '../db';
import config from '../config';
import PostDestination from '../models/PostDestination';

class App extends EventEmitter {
	constructor() {
		super();

		this.grabEvents = new EventEmitter();
		this.dbEvents = new EventEmitter();
	}

	connectDb() {
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => {
				reject('connect db timeout');
			}, 5000);

			db.connect();
			db.connection.once('open', () => {
				clearTimeout(timeoutId);
				debugDb('connected');
				this.dbEvents.emit('open');
				resolve();
			});
		});
	}

	createFileStorage() {
		debugApp('create file storage');
		return fse.ensureDir(config.filesStorage)
			.then(() => {
				this.emit('createFileStorage');
			});
	}

	async createDestinationsInDb() {
		await PostDestination.remove({});

		debugApp('create destinations in db');

		const postDestinationsPromises = config.postDestinations.map((postDestination) => {
			const model = new PostDestination();

			console.assert(postDestination.id);

			model.set('_id', postDestination.id);
			model.set('type', postDestination.type);
			model.set('enabled', postDestination.enabled);
			model.set('params', postDestination.params);

			return model.save();
		});

		return Promise.all(postDestinationsPromises)
			.then(() => {
				this.emit('createDestinationsInDb');
			});
	}

	async run() {
		await this.connectDb();
		await this.createDestinationsInDb();
		await this.createFileStorage();

		this.emit('ready');
	}
}

export default App;
