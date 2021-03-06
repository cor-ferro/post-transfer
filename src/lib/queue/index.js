import kue from 'kue';
import config from '../../config';

const configDbRedisQueue = config.db.redis.queue;
const redisSettings = {
	prefix: 'q',
	db: configDbRedisQueue.id,
	port: configDbRedisQueue.port,
	host: configDbRedisQueue.host,
};

export default {
	create() {
		const queue = kue.createQueue({
			redis: redisSettings,
		});

		return queue;
	},
	buildJob(queue, name, params = {}) {
		const job = queue.create(name, params);

		return job;
	},
	saveJob(job) {
		return new Promise((resolve, reject) => {
			job.save((error) => {
				if (error) {
					reject(error);
				} else {
					resolve(job);
				}
			});
		});
	},
	createJob(queue, name, params = {}) {
		if (!queue) {
			throw new Error('Failed create job, queue is empty');
		}

		const job = queue.create(name, params);

		return this.saveJob(job);
	},
};
