global.Promise = require('bluebird');
console.log('override global Promise');
require('./main');
