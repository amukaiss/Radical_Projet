const dbHelper = require('../dbHelper');
const dao = require('./upload.dao');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

module.exports = {
    create: async function (req, res) {
        let success = true;
        let errorSet = [];
        let result = {};
        if (!req.file) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }
        let { filename } = req.file;
        let id_project = req.body.id_project;
        let id_user = req.body.id_user;
        if (req.body.type && req.body.nameProject) {
            let type = req.body.type;
            let nameProject = req.body.nameProject;
            if (type === 'asc') filename = `${nameProject}_mnt.asc`;
            if (type === 'osc') filename = `${nameProject}_osc.json`;
        }
        let filePath = req.file.path;
        filePath = filePath.replace(/\\/g, '/');
        let newFilePath = path.join(__dirname, `../../files/${id_project}`);
        if (!fs.existsSync(newFilePath)) {
            fs.mkdirSync(newFilePath, { recursive: true });
        }
        let reader = fs.createReadStream(filePath);
        let writer = fs.createWriteStream(`${newFilePath}/${filename}`);

        await pipeline(reader, writer);

        // reader.on('close', function () {
        //     fs.unlinkSync(filePath);
        //     reader.destroy();
        //     console.log('reader  closed');
        // });

        // writer.on('finish', function () {
        //     writer.destroy();
        //     writer.end();
        //     console.log('writer finish');
        // });

        // writer.on('close', () => {
        //     console.log('writer closed');
        // });
        // reader.pipe(writer);

        // writeStream.on('error', next); // go to express error handler
        // readStream.on('error', next);
        fs.newFilePath = newFilePath.replace(/\\/g, '/');
        let linkToFile = newFilePath + '/' + filename;
        linkToFile = linkToFile.replace(/\\/g, '/');
        let id_file = dbHelper.generateIdFile();
        let pwd = req.file.destination.replace(/\\/g, '/');
        let params = {
            _id: id_file,
            id_user: id_user,
            filename: filename,
            destination: linkToFile,
            pwd: pwd,
            type: req.file.mimetype,
            id_project: id_project,
            size: req.file.size
        };
        let file = await dao.save(params);
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file
        };
        return result;
    },

    getStorageByIdUser: async function (req) {
        // Check input
        if (!req.body.id_user) {
            return {
                status: 200,
                success: false,
                errorSet: ['INVALID PARAMS']
            };
        }

        const request = {
            id_user: req.body.id_user
        };

        const size = await dao.getStorageByIdUser(request);
        return {
            status: 200,
            success: true,
            errorSet: [],
            data: size
        };
    },

    getStorageByIdProject: async function (req) {
        if (!req.body.id_project) {
            return {
                status: 200,
                success: false,
                errorSet: ['INVALID PARAMS']
            };
        }
        const request = {
            id_project: req.body.id_project
        };
        const size = await dao.getStorageByIdProject(request);

        return {
            status: 200,
            success: true,
            errorSet: [],
            data: size
        };
    },

    getByFilenameByIdUserIdProject: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        const filename = req.filename;
        const id_user = req.id_user;
        const id_project = req.id_project;
        if (!filename || !id_user || !id_project) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }

        const file = await dao.getByFilenameByIdUserIdProject({ filename, id_user, id_project });
        if (file.length === 0) {
            result = {
                status: 200,
                success: false,
                errorSet: ['ERROR DATABASE']
            };

            return result;
        }
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file[0]
        };

        return result;
    },

    downloadByFilenameByIdUserIdProject: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};
        console.log('called');
        const { filename, id_user, id_project } = req;
        if (!filename || !id_user || !id_project) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }

        const file = await dao.getByFilenameByIdUserIdProject({ filename, id_user, id_project });
        console.log(file);
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: file[0]
        };

        return result;
    },

    getById: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        const { _id } = req.body._id;
        if (!_id) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }
        const file = await dao.getById({ _id });

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
        const { id_project } = req;
        if (!id_project) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }
        const files = await dao.getByIdProject({ id_project });
        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: files
        };
        return result;
    },

    getByIdUser: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        const { id_user } = req.body.id_user;
        if (!id_user) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING PARAM']
            };
            return result;
        }
        const files = await dao.getByIdUser({ id_user });

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

        const file = await dao.modify(params);

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

        const { id_files } = req;
        if (!id_files) {
            result = {
                status: 200,
                success: false,
                errorSet: ['MISSING_PARAMS']
            };
            return result;
        }
        let promises = id_files.map((item) => {
            this.removeFile({ destination: item.destination });
            dao.delete({ _id: item._id });
        });
        await Promise.all(promises);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet
        };

        return result;
    },

    uploadSingle: async function (req, res) {
        let success = true;
        let errorSet = [];
        let result = {};

        try {
            if (req.file === undefined) {
                result = {
                    status: 200,
                    success: false,
                    errorSet: ['PLEASE_UPLOAD_A_FILE']
                };
                return result;
            }
            result = {
                status: 200,
                success: success,
                errorSet: errorSet,
                data: {
                    message: `Uploaded the file successfully`
                }
            };
        } catch (err) {
            result = {
                status: 200,
                success: false,
                errorSet: [`COULD_NOT_UPLOAD}`]
            };
        }
    },

    // function removeDirectory(dir_path) {
    //     if (fs.existsSync(dir_path)) {
    //         fs.readdirSync(dir_path).forEach(function (entry) {
    //             var entry_path = path.join(dir_path, entry);
    //             if (fs.lstatSync(entry_path).isDirectory()) {
    //                 removeDirectory(entry_path);
    //             } else {
    //                 fs.unlinkSync(entry_path);
    //             }
    //         });
    //         fs.rmdirSync(dir_path);
    //     }
    // }

    removeFile: async function (filePath) {
        fs.unlink(filePath.destination, function (err) {
            if (err) {
                console.log('Cannot delete file at ' + filePath);
            }
        });
    }
};
