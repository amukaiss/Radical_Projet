const express = require('express');
const https = require('https');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const route = require('./route');

const port = 8088;
const httpsPort = 444;

// configure https
const options = {
    key: fs.readFileSync(path.join(__dirname, './fileConfig/ssl.key')),
    cert: fs.readFileSync(path.join(__dirname, './fileConfig/ssl.cert'))
};

const app = express();
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());

app.use('/', route);

app.use(cors());

// app.use(
//     busboy({
//         highWaterMark: 2 * 1024 * 1024 // Set 2MiB buffer
//     })
// );
// Error handling middleware, we delegate the handling to the centralized error handler
// error that is handle by this middleware is known error
// app.use(async (err) => {
//     let errorSet = ['ERROR_SERVER'];
//     if (err.message.includes('INVALID') || err.message.includes('UNAUTHORIZED')) {
//         errorSet = [err.message];
//     }
// });

app.listen(port);
const server = https.createServer(options, app);

server.listen(httpsPort, function () {
    console.log(`Upload file server is running on port ${httpsPort}`);
});

app.get('*', function (req, res) {
    const protocol = req.protocol;
    const host = req.hostname;
    const url = req.originalUrl;
    const port = process.env.PORT || port;

    const fullUrl = `${protocol}://${host}:${port}${url}`;

    const responseString = `Full URL is: ${fullUrl}`;
    res.send(responseString);
});

module.exports = app;
