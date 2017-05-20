import de from 'deep-extend';

const ENV = process.env.ENV || 'dev';
let envConfig = {};

switch (ENV) {
case 'dev':
	envConfig = global.require('./dev.js');
	break;
case 'test':
	envConfig = global.require('./test.js');
	break;
case 'production':
	envConfig = global.require('./production.js');
	break;
default:
	envConfig = {};
}

const config = de({}, envConfig, {});

export default config;
