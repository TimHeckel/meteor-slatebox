Meteor.startup(function() {
	Collaboration.remove({});
	console.log("restarting server");
});