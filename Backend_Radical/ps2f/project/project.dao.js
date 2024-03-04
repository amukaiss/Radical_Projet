const { db, Schema, dbHelper } = require('../db');
const dataTables = require('mongoose-datatables');
const collection_name = 'project';
const schema = new Schema(
    {
        _id: String,
        id_user: String,
        title: String,
        date_add: Date,
        date_upd: Date,
        date_del: Date,
        modify: Boolean
    },
    { strict: false }
);

schema.plugin(dataTables);
const model = db.model(collection_name, schema, `${collection_name}s`);

module.exports = {
    getById: async function (req) {
        let { _id } = req;
        let query = model.findById(_id);
        let result = await query.exec();
        return result;
    },

    getByIdUser: async function (req) {
        let { id_user } = req;
        let query = model.find({ id_user });
        let result = await query.exec();
        return result;
    },

    getSet: async function (req) {
        const { find, start, nbByPage, sort, search } = req;

        let search_obj = {
            value: search,
            fields: ['title']
        };

        const result = await model.dataTables({
            limit: nbByPage,
            skip: start,
            sort: sort,
            find: find,
            search: search_obj
        });

        return result;
    },

    checkProjectByIdUser: async function (req) {
        const { title, id_user } = req;
        let search_obj = {
            title: title,
            id_user: id_user
        };

        const result = await model.find(search_obj);
        return result;
    },

    save: async function (req) {
        let { title, id_user } = req;
        let _id = dbHelper.generateIdTechnique();

        let document = new model({
            _id: _id,
            id_user: id_user,
            title: title,
            date_add: new Date(),
            date_upd: new Date(),
            date_del: new Date(),
            modify: false
        });

        let result = await document.save();
        return result;
    },

    modify: async function (req) {
        let { find, upd } = req;

        let mod = {
            $set: { date_upd: new Date(), modify: true, ...upd.$set }
        };
        if (upd.$push) {
            mod.$push = upd.$push;
        }

        const query = model.findOneAndUpdate(find, mod, { new: true });
        const result = await query.exec();
        return result;
    },

    delete: async function (req) {
        let { _id } = req;
        let query = model.findByIdAndRemove(_id);
        let result = await query.exec();
        return result;
    },
    countByCustomCondition: async function (req) {
        let query = model.count(req);
        let result = await query.exec();
        return result;
    }
};
