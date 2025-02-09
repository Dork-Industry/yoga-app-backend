//Import the mongoose module
var mongoose = require('mongoose');
mongoose.set('debug', true);

//Set up default mongoose connection
var mongoDB = process.env.DATABASE;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

//Get the default connection
var db = mongoose.connection;

db.on('connected', () => {
	console.log('connected to mongodb');
});

db.on('disconnected', () => {
	console.log('connection disconnected');
});

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
