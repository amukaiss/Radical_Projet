const path = require('path');
const { db, Schema, dbHelper } = require(path.join(__dirname, '../db'));
const dataTables = require('mongoose-datatables');
// bcrypt is a library to hash password
const bcrypt = require('bcryptjs');
// param for bcrypt
const saltRounds = 10; // The higher the number, the longer it takes
// name of collection to use in MongoDB
const collection_name = 'user';

const schema = new Schema(
    {
        _id: String,
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        date_add: Date
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

    getByUsername: async function (req) {
        let { username } = req;
        let query = model.findOne({ username });
        let result = await query.exec();
        return result;
    },

    getAll: async function () {
        let query = model.find();
        let result = await query.exec();
        return result;
    },

    save: async function (req) {
        await model.syncIndexes();
        let { username, password } = req;
        let _id = dbHelper.generateIdTechnique();

        // Crypting the password
        const salt = bcrypt.genSaltSync(saltRounds);
        let hashed = bcrypt.hashSync(password, salt);

        let document = new model({
            _id: _id,
            username: username,
            password: hashed,
            date_add: new Date()
        });

        let result = await document.save();
        return result;
    },

    modify: async function (req) {
        let { find, upd } = req;

        let mod = {
            $set: {
                ...upd.$set
            }
        };

        if (upd.$push) {
            mod.$push = upd.$push;
        }

        const query = model.findOneAndUpdate(find, mod, { new: true });
        const result = await query.exec();
        return result;
    },

    modifyPassword: async function (req) {
        let { _id, oldPassword, newPassword } = req;

        let user = await this.getById({ _id });
        let hash = user.password;

        let isMatch = bcrypt.compareSync(oldPassword, hash);

        if (!isMatch) {
            return {
                success: false,
                errorSet: ['WRONG_PASSWORD']
            };
        }

        // Crypting the password
        const salt = bcrypt.genSaltSync(saltRounds);
        let password = bcrypt.hashSync(newPassword, salt);

        let params = {
            find: {
                _id: _id
            },
            upd: {
                $set: { password: password },
                $push: null
            }
        };
        let modifyPass = await this.modify(params);

        let result = {
            success: true,
            data: modifyPass
        };

        return result;
    },

    delete: async function (req) {
        let { _id } = req;
        let query = model.findByIdAndRemove(_id);
        let result = await query.exec();
        return result;
    }
};
