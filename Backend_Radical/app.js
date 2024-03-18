const https = require('https');
const path = require('path');
global.tmpDirectory = path.join(__dirname, 'tmp');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const rimraf = require('rimraf');
const fs = require('fs');

const port = 8080;
const httpsPort = 5050;

// configure https
const options = {
    key: fs.readFileSync(path.join(__dirname, './fileConfig/ssl.key')),
    cert: fs.readFileSync(path.join(__dirname, './fileConfig/ssl.cert'))
};

const app = express();

// Multer file upload setting
// app.use(
//     busboy({
//         highWaterMark: 2 * 1024 * 1024 // Set 2MiB buffer
//     })
// );

app.use(bodyParser.json({ limit: '5mb' }));
// app.use(cors({ credentials: true, origin: true }));
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Compress response
app.use(compression());

// Check if request structure is good
app.use(function (error, req, res, next) {
    res.status(442).json({ success: false, errorSet: ['BAD_REQUEST'] });
});

// create work directory
if (!fs.existsSync(tmpDirectory)) {
    fs.mkdirSync(tmpDirectory);
} else {
    rimraf.sync(tmpDirectory);
    fs.mkdirSync(tmpDirectory);
}

// Route
const route = require('./route');
app.use('/', route);

// Error handling middleware, we delegate the handling to the centralized error handler
// error that is handle by this middleware is known error
app.use(async (err, req, res, next) => {
    let errorSet = ['ERROR_SERVER'];
    if (err.message.includes('INVALID') || err.message.includes('UNAUTHORIZED')) {
        errorSet = [err.message];
    }
});

app.listen(port);
const server = https.createServer(options, app);
server.listen(httpsPort, function () {
    console.log(`The server is running on port ${httpsPort}`);
});

module.exports = app;
// app.use(express.static(path.join(__dirname, '/../ressources')));

// const http = require('http');
// const app = require('./app');

// const normalizePort = (val) => {
//     const port = parseInt(val, 10);

//     if (isNaN(port)) {
//         return val;
//     }
//     if (port >= 0) {
//         return port;
//     }
//     return false;
// };

// const port = normalizePort(process.env.PORT || '5000');
// app.set('port', port);

// const errorHandler = (error) => {
//     if (error.syscall !== 'listen') {
//         throw error;
//     }
//     const address = server.address();
//     const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
//     switch (error.code) {
//         case 'EACCES':
//             console.error(bind + ' requires elevated privileges.');
//             process.exit(1);
//             break;
//         case 'EADDRINUSE':
//             console.error(bind + ' is already in use.');
//             process.exit(1);
//             break;
//         default:
//             throw error;
//     }
// };

// const server = http.createServer(app);

// server.on('error', errorHandler);
// server.on('listening', () => {
//     const address = server.address();
//     const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
//     console.log('Listening on ' + bind);
// });

// server.listen(port);
