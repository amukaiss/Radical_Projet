const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FS = process.env.FS;
module.exports = {
    getById: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id } = req.query;
        let file = await dao.getById({ _id });

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file
        };

        return result;
    },

    getByIdProject: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { id_project } = req.query;
        let files = await dao.getByIdProject({ id_project });

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: files
        };
        return result;
    },

    modify: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id, ...data } = req;

        let params = {
            find: {
                _id: _id
            },
            upd: {
                $set: data,
                $push: null
            }
        };

        let file = await dao.modify(params);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file
        };
        return result;
    },

    delete: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        const { id_files } = req.body;

        let promises = id_files.map((item) => dao.delete({ _id: item }));

        await Promise.all(promises);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: null
        };
        return result;
    },

    saveFileInfo: async function (saveFileInfoRequest) {
        let params = {
            _id: saveFileInfoRequest.id_file,
            id_project: saveFileInfoRequest.id_project,
            id_user: saveFileInfoRequest.id_user,
            name: saveFileInfoRequest.name,
            type: saveFileInfoRequest.type,
            size: saveFileInfoRequest.size_origin
        };

        let file = await dao.save(params);

        result = {
            success: true,
            errorSet: [],
            data: file
        };

        return result;
    },

    getStorageByIdProject: async function (req) {
        // Check input
        if (!req.id_project) {
            return {
                success: false,
                errorSet: ['INVALID_PARAMS']
            };
        }
        const request = {
            id_project: req.id_project,
            delete: false
        };
        const size = await dao.getStorageByIdProject(request);

        return {
            success: true,
            errorSet: [],
            data: {
                size: size
            }
        };
    },

    create: async function () {
        let success = true;
        let errorSet = [];
        let result = {};

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file
        };
        return result;
    },

    createAsset: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        // params in input
        let { filename, destination } = req.file;
        let { id_project } = req.body;

        let filePath = path.join(destination, filename);

        let params = {
            id_owner: id_project,
            role: req.body.type,
            extract: false
        };

        let response = await upload_file(filePath, params);

        fileHelper.removeFile(filePath);

        try {
            let data = JSON.parse(response);

            if (data.success) {
                let { id_file, name, size } = data;
                let params = {
                    _id: id_file,
                    name: name,
                    type: req.body.type,
                    id_project: id_project,
                    size: size
                };

                let file = await dao.save(params);

                result = {
                    status: 200,
                    success: success,
                    errorSet: errorSet,
                    data: file
                };

                return result;
            }
        } catch (error) {
            console.log('Cannot upload asset to file server');
            result = {
                status: 500,
                success: false,
                errorSet: ['ERROR_SERVER'],
                data: null
            };
            return result;
        }
    },

    read: async function (req) {
        // let success = true;
        // let errorSet = [];
        // let obj = 5;
        let obj = '';
        // let obj = { mnt: 'a', osc: 'b' };
        if (!obj) {
            console.log('error');
        }

        let result = {
            obj
        };

        return result;
    },

    // TO REVIEW
    findFile: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};
        let foundFile;
        let found = false;

        const listFile = fs.readdirSync('../assets');

        let fileName = req;
        let fileNameExtension = req.split('.').pop();
        let slice = fileName.slice(17, 26);
        // Find JSON File
        for (let i = 0; i < listFile.length; i++) {
            if (
                listFile[i].indexOf(slice) != -1 &&
                listFile[i].indexOf(fileNameExtension) !== 'asc'
            ) {
                // if (listFile[i] === fileName) {
                //     continue;
                // }
                foundFile = listFile[i];
                found = true;
            }
        }

        if (!found) {
            result = { status: 404, success: false, errorSet: ['FILE_NOT_FOUND'] };
            return result;
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: foundFile
        };
        return result;
    },

    findJson: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};
        let isExist = false;
        let id_project = req.id_project;
        const resp = await axios.post(FS + '/getByIdProject', {
            id_project: id_project
        });

        const listFile = resp.data.data;
        for (let i = 0; i < listFile.length; i++) {
            if (listFile[i].filename.includes('osc')) {
                isExist = true;
            }
        }

        if (!isExist) {
            result = { status: 404, success: false, errorSet: ['FILE_NOT_FOUND'] };
            return result;
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet
        };
        return result;
    },

    listFileJson: async function () {
        let success = true;
        let errorSet = [];
        let result = {};
        let data = [];

        let fileNameExtension;
        const listFile = fs.readdirSync('../assets');
        for (let i = 0; i < listFile.length; i++) {
            fileNameExtension = listFile[i].split('.').pop();
            if (fileNameExtension === 'json') {
                data.push(listFile[i]);
            }
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: data
        };
        return result;
    }
};
