const express = require('express');
const router = express.Router();
const axios = require('axios');
const FS = process.env.FS;

router.post('/', async function (req, res) {
    let { nameProject, id_user, id_project } = req.body;
    let success = true;
    let errorSet = [];
    let result = {};
    if (!nameProject || !id_user || !id_project) {
        result = {
            status: 200,
            success: false,
            errorSet: ['MISSING PARAM']
        };
        return res.send(result);
    }

    let resp = await axios.post(FS + '/downloadByFilename', {
        filename: nameProject + '_meteo.json',
        id_user: id_user,
        id_project: id_project
    });
    if (resp.data.length === 0 || !resp.data.success) {
        return res.send(resp.data);
    }
    result = {
        success: success,
        errorSet: errorSet,
        data: resp.data
    };
    return res.send(result);
});

router.post('/readflamme', async function (req, res) {
    let { nameProject, id_user, id_project } = req.body;
    let success = true;
    let errorSet = [];
    let result = {};
    if (!nameProject || !id_user || !id_project) {
        result = {
            success: false,
            errorSet: ['MISSING PARAM']
        };
        return res.send(result);
    }
    let resp = await axios.post(FS + '/downloadByFilename', {
        filename: nameProject + '_flamme.json',
        id_user: id_user,
        id_project: id_project
    });

    if (!resp.data.success) {
        return res.send(resp.data);
    }
    result = {
        success: success,
        errorSet: errorSet,
        data: resp.data
    };
    return res.send(result);
});

router.post('/veg', async function (req, res) {
    let { nameProject, id_user, id_project } = req.body;
    if (!nameProject || !id_user || !id_project) {
        result = {
            success: false,
            errorSet: ['MISSING PARAM']
        };
        return res.send(result);
    }
    let resp = await axios.post(FS + '/downloadByFilename', {
        filename: nameProject + '_frontFeu.json',
        id_user: id_user,
        id_project: id_project
    });
    return res.send(resp.data);
});

router.post('/readOcc', async function (req, res) {
    // console.log('enter ReadOcc');
    let { nameProject, id_user, id_project } = req.body;
    if (!nameProject || !id_user || !id_project) {
        result = {
            success: false,
            errorSet: ['MISSING PARAM']
        };
        return res.send(result);
    }
    let resp = await axios.post(FS + '/downloadByFilename', {
        filename: nameProject + '_OcSol.json',
        id_user: id_user,
        id_project: id_project
    });
    return res.send(resp.data);
});

module.exports = router;
