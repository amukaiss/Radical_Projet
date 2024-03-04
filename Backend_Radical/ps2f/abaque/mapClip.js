const express = require('express');
const router = express.Router();
const mapshaper = require('mapshaper');
const fs = require('fs');
const path = require('path');
const FS = process.env.FS;
const FormData = require('form-data');
const axios = require('axios');

router.post('/', async function (req, res) {
    let result = {};
    let success = true;
    let errorSet = [];
    let { nameProject, filename, id_user, id_project } = req.body;

    let resp = await axios.post(FS + '/getByFilename', {
        filename: filename,
        id_user: id_user,
        id_project: id_project
    });
    let target = resp.data.data.destination;
    if (process.platform === 'win32'){
        target = target.replace(/\//g, '\\');
    }

    let rectResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_rectangle.json',
        id_user: id_user,
        id_project: id_project
    });
    let source = rectResp.data.data.destination;
    if (process.platform === 'win32'){
        source = source.replace(/\//g, '\\');
    }

    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    let testResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_test.json',
        id_user: id_user,
        id_project: id_project
    });
    if (testResp.data.success) {
        await axios.post(FS + '/delete', {
            id_files: testResp.data.data._id,
            destination: testResp.data.data.destination
        });
    }

    const cmd =
        '-i ' +
        target +
        ' -clip ' +
        source +
        ` -o force ../files/tmp/${id_project}/` +
        nameProject +
        '_test.json';
    await mapshaper.runCommands(cmd);

    let dest = path.resolve(newFilePath, `${nameProject}_test.json`);
    let formData = new FormData();
    formData.append('file', fs.createReadStream(dest));
    formData.append('id_user', id_user);
    formData.append('id_project', id_project);
    let sendFileResp = await axios.post(FS + '/single', formData);

    if (!sendFileResp.data.success) {
        result = {
            status: 200,
            success: false,
            errorSet: ['ERROR UPLOAD SERVER']
        };
        res.send(result);
    }

    fs.unlinkSync(dest);
    result = {
        success: success,
        errorSet: errorSet
    };
    res.send(result);
});

router.post('/ocSol', async function (req, res) {
    let { nameProject, data, id_user, id_project } = req.body;
    if (!nameProject || !data || !id_user || !id_project) {
        return {
            status: 200,
            success: false,
            errorSet: ['MISSING_PARAM']
        };
    }
    let jsonData = JSON.stringify(data);
    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, true);
    }

    let dest = path.join(newFilePath, './' + nameProject + '_OcSol.json');

    fs.writeFileSync(dest, jsonData);
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

    fs.rmSync(dest);
    res.send({
        status: true,
        message: 'File downloaded!'
    });
});

module.exports = router;
