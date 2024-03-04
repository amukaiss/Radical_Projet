const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const FS = process.env.FS;
const FormData = require('form-data');
const path = require('path');

// Create a meteo file
router.post('/meteo', async function (req, res) {
    let { nameProject, id_user, id_project } = req.body;
    if (!nameProject || !id_user || !id_project) {
        return {
            status: 400,
            success: false,
            errorSet: ['MISSING_PARAM']
        };
    }

    let data = JSON.stringify(req.body.data);
    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    let dest = path.resolve(newFilePath, `${nameProject}_meteo.json`);
    if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
    }
    fs.writeFileSync(dest, data);

    let formData = new FormData();
    formData.append('file', fs.createReadStream(dest));
    formData.append('id_user', id_user);
    formData.append('id_project', id_project);

    const resp = await axios.post(FS + '/single', formData);
    if (!resp.data.success) {
        result = {
            status: 200,
            success: false,
            errorSet: ['ERROR UPLOAD SERVER']
        };
        res.send(result);
    }
    // remove tmp file
    fs.unlinkSync(dest);
    res.send(data);
});

router.post('/flamme', async function (req, res) {
    let result = {};
    let success = true;
    let errorSet = [];

    let { nameProject, id_user, id_project } = req.body;
    if (!nameProject || !id_user || !id_project) {
        result = {
            status: 400,
            success: false,
            errorSet: ['MISSING_PARAM']
        };
        res.send(result);
    }
    let data = JSON.stringify(req.body.data);

    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    let dest = path.resolve(newFilePath, `${nameProject}_flamme.json`);
    fs.writeFileSync(dest, data);
    let formData = new FormData();

    formData.append('file', fs.createReadStream(dest));
    formData.append('id_user', id_user);
    formData.append('id_project', id_project);

    const resp = await axios.post(FS + '/single', formData);
    if (!resp.data.success) {
        result = {
            status: 200,
            success: false,
            errorSet: ['ERROR UPLOAD SERVER']
        };
        res.send(result);
    }
    // remove tmp file
    fs.rmSync(dest);
    result = {
        status: 200,
        success: success,
        errorSet: errorSet,
        data: data
    };
    res.send(result);
});

module.exports = router;
