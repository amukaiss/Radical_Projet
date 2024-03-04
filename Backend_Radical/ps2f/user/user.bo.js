const dao = require('./user.dao');
const bcrypt = require('bcryptjs');

module.exports = {
    /**
     * @function getById
     * @description  retrieve information of a user by id
     * @param {String} _id id of user
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of user
     */
    getById: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id } = req;
        let user = await dao.getById({ _id });
        if (!user) {
            return {
                status: 404,
                success: false,
                errorSet: ['USER_NOT_FOUND']
            };
        }
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: user
        };
        return result;
    },

    /**
     * @function getByUsername
     * @description  retrieve information of a user by username
     * @param {String} username username of user
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of user
     */
    getByUsername: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { username } = req;
        let user = await dao.getByUsername({ username });
        if (!user) {
            return {
                status: 404,
                success: false,
                errorSet: ['USER_NOT_FOUND']
            };
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: user
        };
        return result;
    },

    /**
     * @function getAll
     * @description  retrieve all users
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of user
     */
    getAll: async function () {
        let success = true;
        let errorSet = [];
        let result = {};

        let users = await dao.getAll();
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: users
        };
        return result;
    },

    /**
     * @function create
     * @description  create user account
     * @param {String} username
     * @param {String} passsword
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of request
     */
    create: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        // Treat case user already existed

        let findUser = await this.getByUsername({ username: req.username });
        if (findUser.status !== 404) {
            return {
                status: 400,
                success: false,
                errorSet: ['USER_ALREADY_EXIST']
            };
        }
        let createResp = await dao.save(req);
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: createResp
        };
        return result;
    },

    /**
     * @function modify
     * @description  modify user account
     * @param {String} _id id of user is required
     * @param {Any}  data all the other data is request are treated later
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of request
     */
    modify: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id, ...data } = req;

        let userExist = await this.getById({ _id });
        if (userExist.status != 200) {
            return {
                status: 404,
                success: false,
                errorSet: ['USER_NOT_FOUND']
            };
        }

        let params = {
            find: {
                _id: _id
            },
            upd: {
                $set: {},
                $push: null
            }
        };

        if (data) {
            params.upd.$set = data;
        }

        let user = await dao.modify(params);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: user
        };
        return result;
    },

    /**
     * @function modifyPassword
     * @description  modify user's password
     * @param {String} _id id of user is required
     * @return {Object} data An array contains Objects  each is a information of request
     */
    modifyPassword: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id } = req;
        let user = await this.getById({ _id });
        if (user.status != 200) {
            return {
                status: 404,
                success: false,
                errorSet: ['USER_NOT_FOUND']
            };
        }

        let modify = await dao.modifyPassword(req);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: modify
        };
        return result;
    },

    /**
     * @function delete
     * @description  delete user account
     * @param {String} _id id of user is required
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of request
     */
    // NOTE: If you are going to add an option to delete a user
    // You need to, also, delete all the projects, files that link to
    // this user. TO DO if required
    delete: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let user = await dao.delete(req);
        if (!user) {
            return {
                success: false,
                errorSet: ['ID_NOT_FOUND']
            };
        }
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: user
        };
        return result;
    },

    /**
     * @function authenticate
     * @description  authentication process
     * @param {String} username username of user is required
     * @param {String} password password entered is required
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of request
     */
    authenticate: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        const { username, password } = req;

        let findUserName = await dao.getByUsername({ username });
        if (!findUserName) {
            result = {
                status: 404,
                success: false,
                errorSet: ['USERNAME_NOT_FOUND']
            };
            return result;
        }

        // Compare the hashed keyword with the entered one
        let isMatch = bcrypt.compareSync(password, findUserName.password);

        if (!isMatch) {
            result = {
                status: 401,
                success: false,
                errorSet: ['AUTHENTICATION_FAILED']
            };
            return result;
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: {
                id_user: findUserName._id
            }
        };
        return result;
    }
};
