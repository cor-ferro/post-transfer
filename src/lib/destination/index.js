import FacebookDestination from './facebook-destination';

export default {
	create(destination) {
		switch (destination.type) {
		case 'facebook': return new FacebookDestination(destination.params);
		default: throw new Error(`unknown destination type: ${destination.type}`);
		}
	},
	getByModel(destinationsModels, destinationModel) {
		const destinationId = destinationModel.get('_id').toString();

		return destinationsModels.find((destination => destination.get('_id').toString() === destinationId));
	},
};
