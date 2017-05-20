import EventEmitter from 'events';

class App extends EventEmitter {
	constructor() {
		super();

		this.grabEvents = new EventEmitter();
	}
}

export default App;
