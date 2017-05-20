import App from './lib/app';
import db from './db';

db.connect();

export default new App();
