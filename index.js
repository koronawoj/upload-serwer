const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const morgan = require('morgan');
const router = require('./router');

mongoose.connect('mongodb://localhost:27017/upload-database', {useNewUrlParser: true});

const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json({type: 'application/json'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));
app.use(express.static('./public'));
router(app);

const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on:', port);
