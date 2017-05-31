import fs from 'fs';
import path from 'path';

const LOG_TYPE_INFO = 'info';
const LOG_TYPE_WARN = 'warn';
const LOG_TYPE_ERROR = 'error';

let logStream = null;

function exitHandler(options, err) {
	if (options.cleanup) console.log('clean');
	if (err) console.log(err.stack);
	if (options.exit) {
		console.log('close log stream');
		logStream.end();
		process.exit();
	}
}

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

	logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

	console.log(`create log on ${logFilePath}`);

	logStream.on('error', (error) => {
		console.log('stream log error', error);
	});
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGINT', exitHandler.bind(null, { exit: true }));
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

createLogStream();

export default {
	log(type, message) {
		console.log('getFormattedTime', getFormattedTime());
		logStream.write(`[${type}] [${getFormattedTime()}] ${message}\n`);
	},
	info(message) {
		this.log(LOG_TYPE_INFO, message);
	},
	warn(message) {
		this.log(LOG_TYPE_WARN, message);
	},
	error(message) {
		this.log(LOG_TYPE_ERROR, message);
	},
	objectError(error) {
		this.error(error.message);
		this.error(error.stack);
	},
};
