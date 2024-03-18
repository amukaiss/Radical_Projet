const config = require('../fileConfig/config.json');
require('dotenv').config();
// The database is running on localhost thus does not need authentification ***
const { server, port } = config.dbLocal;
// const { username, password, server, port } = config.dbServer;
const { v4: uuidv4 } = require('uuid');
const randomstring = require('randomstring');

module.exports = {
    dburl: 'mongodb://' + server + ':' + port,
    // dburl: 'mongodb://' + username + ':' + password + '@' + server + ':' + port,
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    },

    generateIdTechnique: function () {
        // id technique is a uuidv4
        return uuidv4();
        x;
    },

    generateReference: function () {
        return randomstring.generate({
            //reference is a 10-characters [A-Z] string in uppercase.
            length: 10,
            charset: 'alphabetic',
            capitalization: 'uppercase'
        });
    },

    treatErrorConnection: function (error) {
        console.error(error.message);
    }
};
