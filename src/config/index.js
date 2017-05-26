import path from 'path';
import de from 'deep-extend';
import devConfig from './dev';
import testConfig from './test';
import productionConfig from './production';

const ENV = process.env.ENV || 'dev';
let envConfig = {};

switch (ENV) {
case 'dev':
	envConfig = devConfig;
	break;
case 'test':
	envConfig = testConfig;
	break;
case 'production':
	envConfig = productionConfig;
	break;
default:
	envConfig = {};
}

const config = de({}, envConfig, {
	appDir: path.resolve(path.join(__dirname, '..')),
	filesStorage: '/tmp/post-transfer',
});

export default config;
