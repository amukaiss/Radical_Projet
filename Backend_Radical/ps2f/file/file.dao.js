const { db, Schema } = require('../db');
const dataTables = require('mongoose-datatables');
const collection_name = 'file';
const schema = new Schema(
    {
        _id: String,
        id_project: String,
        id_user: String,
        type: String,
        size: Number,
        date_add: Date,
        date_upd: Date,
        date_del: Date,
        modify: Boolean,
        delete: Boolean
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

    getByIdProject: async function (req) {
        let { id_project } = req;
        let query = model.find({ id_project });
        let result = await query.exec();
        return result;
    },

    save: async function (req) {
        let document = new model({
            ...req,
            date_add: new Date(),
            date_upd: new Date(),
            date_del: new Date(),
            modify: false,
            delete: false
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

    deleteByIdProject: async function (req) {
        let { id_project } = req;
        let query = model.deleteMany({ id_project });
        let result = await query.exec();
        return result;
    },

    getStorageByIdProject: async function (req) {
        let query = model.find(req);
        let files = await query.exec();
        let sum = 0;
        for (let item of files) {
            sum += item.size;
        }
        let result = sum;
        return result;
    }
};
