const dao = require('./project.dao');

// const PROJECT_STATUS = {
//   PRIVATE: "private",
//   PUBLIC: "public",
//   LIMIT: "limit",
// };

module.exports = {
    getById: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id } = req;
        let project = await dao.getById({ _id });
        if (!project) {
            return {
                success: false,
                errorSet: ['PROJECT_NOTFOUND']
            };
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: project
        };

        return result;
    },

    /**
     * @function checkProjectByIdUser
     * @description  check for duplicate project by id user
     * @param {String} id_user id of user
     * @param {String} title name of project
     * @return {Boolean} success Indicate result of operation : successful or there are errors
     * @return {String[]} errorSet An array of string representing error name send to user
     * @return {Object} data An array contains Objects  each is a information of user
     */
    checkProjectByIdUser: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { title, id_user } = req;
        let check = await dao.checkProjectByIdUser({ title, id_user });
        if (!check.length) {
            result = {
                status: 404,
                success: false,
                errorSet: ['NOT_FOUND']
            };
            return result;
        }

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: check
        };
        return result;
    },

    getByIdUser: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let projects = await dao.getByIdUser(req);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: projects
        };
        return result;
    },

    getSet: async function (req) {
        try {
            let success = true;
            let errorSet = [];
            let result = {};

            // Datatable result
            let projectSet = [];

            //  Params in request
            let { id_user, nbByPage, start, search, orderBy, orderASC, get_deleted } = req.body;

            // Treat params
            // Setup default pagination params
            if (!start) start = 0;
            if (!nbByPage) nbByPage = 20;

            // Treat sort params
            // By default sort by last created date
            let _orderASC = orderASC ? '1' : '-1';
            let _orderBy = orderBy || 'date_add';
            let sort = {};
            sort[_orderBy] = _orderASC;

            // Treat find params
            // user get only their project
            let find = {};
            if (id_user) {
                find['id_user'] = id_user;
            }

            // treat get_deleted params, if get_deleted = false we only search for non deleted project
            if (!get_deleted) {
                find['delete'] = false;
            }

            // if search params is specify, filter project by title
            let search_obj;

            if (typeof search !== 'undefined') {
                search_obj = {
                    value: search,
                    fields: ['title']
                };
            }

            // Params for dao
            let params = {
                search,
                start,
                nbByPage,
                sort: sort,
                find: find
            };

            let table = await dao.getSet(params);

            // TODO : modify the library mongoose-datatable
            nbProductFiltered = table.filtered;

            // get total records number based on context
            let totalRecordsCondition = {};
            if (Object.keys(find).includes('delete')) {
                totalRecordsCondition.delete = false;
            }
            if (Object.keys(find).includes('id_user')) {
                totalRecordsCondition.id_user = find.id_user;
            }

            nbProductTotal = await dao.countByCustomCondition(totalRecordsCondition);

            // convert to DTO
            for (let i = 0; i < table.data.length; i = i + 1) {
                let projectDTO = await toProjectDTO(table.data[i]);
                projectSet.push(projectDTO);
            }

            result = {
                success: success,
                errorSet: errorSet,
                data: projectSet,
                nbProductFiltered: nbProductFiltered,
                nbProductTotal: nbProductTotal
            };
            return result;
        } catch (err) {
            throw err;
        }
    },

    get: async function (req) {
        const { start, length, _id, id_user } = req.query;

        if (typeof _id !== 'undefined') return this.getById({ _id: _id });
        if (typeof id_user !== 'undefined') return this.getByIdUser(req);
        if (typeof start !== 'undefined' && typeof length !== 'undefined') return this.getSet(req);
    },

    create: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        // params in input
        let { title, id_user } = req.body;
        if (!title || !id_user) {
            result = {
                status: 400,
                success: false,
                errorSet: ['INVALID_PARAMERTERS']
            };
            return result;
        }
        // Check if project already existed for user
        let isExisted = await this.checkProjectByIdUser({ title, id_user });
        if (isExisted.data) {
            result = {
                status: 409,
                success: false,
                errorSet: ['PROJECT_ALREADY_EXISTED'],
                data: isExisted.data
            };
            return result;
        }
        // default params
        // let status = PROJECT_STATUS.PRIVATE;
        let project = await dao.save({ title, id_user });

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: project
        };
        return result;
    },

    modify: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        let { _id, id_file, file_type, ...data } = req;

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

        let project = await dao.modify(params);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: project
        };
        return result;
    },

    // changeProjectStatus: async function (req) {
    //     const { _id, projectStatus, authorizedDomains, user } = req;

    //     const validProjectStatus = Object.values(PROJECT_STATUS);
    //     if (!validProjectStatus.includes(projectStatus)) {
    //         return {
    //             success: false,
    //             errorSet: ['INVALID_STATUS']
    //         };
    //     }

    //     if (projectStatus === PROJECT_STATUS.LIMIT && authorizedDomains.length === 0) {
    //         return {
    //             success: false,
    //             errorSet: ['NO_AUTHORIZED_DOMAIN']
    //         };
    //     }

    //     await this.ensureRequirements({
    //         id_project: _id,
    //         id_user: user.id_user,
    //         requirements: { ownership: true }
    //     });

    //     // don't "remove" authorized domain when change status to private / public
    //     let updateFields = {
    //         status: projectStatus
    //     };
    //     if (projectStatus === PROJECT_STATUS.LIMIT) {
    //         updateFields.authorizedDomains = authorizedDomains;
    //     }
    //     let params = {
    //         find: {
    //             _id: _id
    //         },
    //         upd: {
    //             $set: updateFields,
    //             $push: null
    //         }
    //     };

    //     let project = await dao.modify(params);

    //     result = {
    //         status: 200,
    //         success: true,
    //         errorSet: [],
    //         data: project
    //     };
    //     return result;
    // },

    delete: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};

        // let files = await filedao.deleteByIdProject({ id_project: req._id });
        let project = await dao.delete(req);

        result = {
            status: 200,
            success: success,
            errorSet: errorSet,
            data: project
        };

        return result;
    }
};

async function toProjectDTO(dbDocument) {
    let storageProject = await filedao.getStorageByIdProject({ id_project: dbDocument._id });

    let project = await module.exports.getById({ id: dbDocument._id });

    const projectDTO = {
        _id: dbDocument._id,
        title: dbDocument.title,
        id_user: dbDocument.id_user,
        date_add: dbDocument.date_add,
        date_upd: dbDocument.date_upd,
        // status: dbDocument.status,
        storage: storageProject,
        date_add: project.data.date_add,
        date_upd: project.data.date_upd,
        date_del: project.data.date_del,
        modify: project.data.modify
    };

    return projectDTO;
}
