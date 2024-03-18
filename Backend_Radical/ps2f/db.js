const mongoose = require('mongoose');
const dbHelper = require('./dbHelper.js');
const dbName = 'BD_Radical';
const baseUrl = dbHelper.dburl;
//const url = baseUrl + `/${dbName}?authSource=admin`;
const url = baseUrl + `/${dbName}`; // To use local
const urlenc = encodeURI(url);
try {
    let connection = mongoose.createConnection(urlenc, dbHelper.options);
    let db = connection.useDb(`${dbName}`);
    let Schema = mongoose.Schema;
    ObjectID = Schema.ObjectID;

    module.exports = {
        db: db,
        connect: connection,
        Schema: Schema,
        ObjectID: ObjectID,
        dbHelper: dbHelper
    };
} catch (error) {
    dbHelper.treatErrorConnection(error);
}
