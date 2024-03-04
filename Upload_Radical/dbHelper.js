const config = require('./fileConfig/config.json');
const { server, port } = config.dbLocal;
// const { username, password, server, port } = config.dbServer;
require('dotenv').config();
// const username = process.env.DB_USERNAME;
// const password = process.env.DB_PASSWORD;
const { v4: uuidv4 } = require('uuid');
const randomstring = require('randomstring');

module.exports = {
    dburl: 'mongodb://' + server + ':' + port,
    // dburl: 'mongodb://' + username + ':' + password + '@' + server + ':' + port,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },

    generateIdFile: function () {
        return randomstring.generate({
            // id file is a 10-character [0-9 A-Z] string in uppercase.
            length: 10,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        });
    },

    generateIdTechnique: function () {
        // id technique is a uuidv4
        return uuidv4();
    },

    treatErrorConnection: function (error) {
        console.error(error.message);
    }
};
