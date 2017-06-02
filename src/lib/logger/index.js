import fs from 'fs';
import path from 'path';
import { debugError } from '../debug';

const LOG_TYPE_INFO = 'info';
const LOG_TYPE_WARN = 'warn';
const LOG_TYPE_ERROR = 'error';

let logStream = null;
let logStreamCreateDate = null;

function getFormattedTime() {
	const date = new Date();

	let mseconds = date.getMilliseconds().toString();
	let seconds = date.getSeconds().toString();
	let minutes = date.getMinutes().toString();
	let hours = date.getHours().toString();

	mseconds = '0'.repeat(3 - mseconds.length) + mseconds;
	seconds = '0'.repeat(2 - seconds.length) + seconds;
	minutes = '0'.repeat(2 - minutes.length) + minutes;
	hours = '0'.repeat(2 - hours.length) + hours;

	return `${hours}:${minutes}:${seconds} ${mseconds}`;
}

function createLogStream() {
	const currentDate = new Date();
	const fileNameDate = currentDate.getDate();
	const fileNameMonth = currentDate.getDate() + 1;
	const fileNameYear = currentDate.getFullYear();

	const appDir = path.resolve(path.join(__dirname, '..', '..', '..'));
	const logFileName = `log_${fileNameDate}_${fileNameMonth}_${fileNameYear}.txt`;
	const logFilePath = `${appDir}/logs/${logFileName}`;

	try {
		fs.mkdirSync(`${appDir}/logs`);
	} catch (err) {
		// folder exists or no permissions
	}

	if (logStream) {
		console.log('close exist stream');
		logStream.end();
	}

	logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
	logStreamCreateDate = new Date();

	console.log(`create log on ${logFilePath}`);

	logStream.on('error', (error) => {
		console.log('stream log error', error);
	});
}

function log(type, message) {
	const currentDate = new Date();

	// пересоздаем стрем на новый день
	if (currentDate.getDate() !== logStreamCreateDate.getDate()) {
		createLogStream();
	}

	logStream.write(`[${type}] [${getFormattedTime()}] ${message}\n`);
}

function exitHandler(options, err) {
	if (options.cleanup) console.log('clean');
	if (err) {
		log(LOG_TYPE_ERROR, err.message);
		log(LOG_TYPE_ERROR, err.stack);
		console.log(err.stack);
	}
	if (options.exit) {
		console.log('close log stream');
		logStream.end();
		process.exit();
	}
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

createLogStream();

export default {
	info(message) {
		log(LOG_TYPE_INFO, message);
	},
	warn(message) {
		log(LOG_TYPE_WARN, message);
	},
	error(message) {
		debugError('error: ', message);
		log(LOG_TYPE_ERROR, message);
	},
	objectError(error) {
		if (!error) {
			this.warn('log not object error');
			this.warn(error);
			return;
		}

		if (error instanceof Error) {
			this.error(error.message);
			this.error(error.stack);
		} else {
			this.error(error);
		}
	},
};
