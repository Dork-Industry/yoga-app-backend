const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
require('./loader/db');
const index = require('./routes/index');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
	res.json({ message: 'API Working' });
});

app.use('/', index);

app.listen(3000, () => {
	console.log('Server running on port 3000');
});
