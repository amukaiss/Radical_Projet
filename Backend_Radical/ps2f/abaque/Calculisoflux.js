const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FS = process.env.FS;
const RAD = process.env.RAD;
const FormData = require('form-data');
// const visualize = require('../visualize/visualize.bo');
// const findFileBo = require('../file/file.bo');

let humi, force, dir;
async function meteo_file(nameProject, id_user, id_project) {
    let resp = await axios.post(FS + '/downloadByFilename', {
        filename: nameProject + '_meteo.json',
        id_user: id_user,
        id_project: id_project
    });
    if (resp.data.length === 0) {
        return false;
    }
    humi = resp.data[0].Humidite;
    force = resp.data[0].forceV;
    dir = resp.data[0].directionV;
    return true;
}

async function isoflux(
    humi,
    vent_force,
    vent_direction,
    nameProject,
    fileName,
    id_user,
    id_project
) {
    // let success = true;
    // let errorSet = [];
    let result = {};
    let resultat;
    if (nameProject === '') {
        result = {
            success: false,
            errorSet: ['MISSING_PROJECT_NAME']
        };
        return result;
    }

    if (!fileName) {
        result = {
            success: false,
            errorSet: ['MISSING_FILE_NAME']
        };
        return result;
    }
    // Search for mntFile
    let mntResp = await axios.post(FS + '/getByFilename', {
        filename: fileName,
        id_user: id_user,
        id_project: id_project
    });
    let mntLink = mntResp.data.data.destination;
    let mntFile = 'mnt_file=' + mntLink;
    if (process.platform === 'win32') {
        mntFile = mntFile.replace(/\\/g, '/');
    }

    // Search for rectangle json
    let rectResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_rectangle.json',
        id_user: id_user,
        id_project: id_project
    });
    let rectLink = rectResp.data.data.destination;
    let rectFile = 'rect_file=' + rectLink;
    if (process.platform === 'win32') {
        rectFile = rectFile.replace(/\\/g, '/');
    }

    let frontResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_frontFeuOrder.json',
        id_user: id_user,
        id_project: id_project
    });
    let frontLink = frontResp.data.data.destination;
    let frontFile = 'front_file=' + frontLink;
    if (process.platform === 'win32') {
        frontFile = frontFile.replace(/\\/g, '/');
    }

    let flamResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_flamme.json',
        id_user: id_user,
        id_project: id_project
    });
    let flamLink = flamResp.data.data.destination;
    let flammeFile = 'flamme_file=' + flamLink;
    if (process.platform === 'win32') {
        flammeFile = flammeFile.replace(/\\/g, '/');
    }

    let humiStr = 'humi=' + humi;
    let ventForceStr = 'vent_force=' + vent_force;
    let ventDirectionStr = 'vent_direction=' + vent_direction;

    try {
        const url =
            RAD +
            '/fonction4?' +
            mntFile +
            '&' +
            rectFile +
            '&' +
            frontFile +
            '&' +
            flammeFile +
            '&' +
            humiStr +
            '&' +
            ventForceStr +
            '&' +
            ventDirectionStr;
        resultat = await axios({ method: 'post', url: url, maxContentLength: 100000000000, maxBodyLength: 100000000000 });
    } catch (error) {
        console.log(error);
    }
    return resultat.data;
}

async function displayContent(nameProject, fileName, id_user, id_project) {
    if (!nameProject || !fileName || !id_user || !id_project) {
        return {
            status: 400,
            success: false,
            errorSet: ['MISSING_PARAM']
        };
    }
    let hasMeteoData = await meteo_file(nameProject, id_user, id_project);
    if (!hasMeteoData) {
        result = {
            status: 200,
            success: false,
            errorSet: ['ERROR METEO DATA']
        };
        return result;
    }
    let isofluxResponse = isoflux(humi, force, dir, nameProject, fileName, id_user, id_project);
    let values = await Promise.all([isofluxResponse]);
    let text = JSON.stringify(values[0]);

    let dest = path.join(__dirname, '../../../files/tmp/' + nameProject + '_resultat.json');
    fs.writeFileSync(dest, text);

    let formData = new FormData();
    formData.append('file', fs.createReadStream(dest));
    formData.append('id_user', id_user);
    formData.append('id_project', id_project);

    //const resp = await axios.post(FS + '/single', formData);
    const resp = await axios({ method: 'post', url: FS + '/single', data: formData, maxContentLength: 100000000000, maxBodyLength: 100000000000 });
    if (!resp.data.success) {
        result = {
            status: 200,
            success: false,
            errorSet: ['ERROR UPLOAD SERVER']
        };
        return result;
    }
    // remove tmp file
    fs.rmSync(dest);

    result = {
        status: 200,
        success: true,
        errorSet: []
    };
    return result;
}

router.post('/', async function (req, res) {
    let { nameProject, fileName, id_user, id_project } = req.body;
    let resp = await displayContent(nameProject, fileName, id_user, id_project);
    res.send(resp);
});

module.exports = router;
