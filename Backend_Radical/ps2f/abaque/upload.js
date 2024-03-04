const express = require('express');
const router = express.Router();
const mapshaper = require('mapshaper');
const path = require('path');
const axios = require('axios');
const RAD = process.env.RAD;
const FS = process.env.FS;
const FormData = require('form-data');
const fs = require('fs');

router.post('/centerMNT', async function (req, res) {
    let success = true;
    let errorSet = [];
    let result = {};

    let content = {};
    let convertJson = {};

    let filename = req.body.filename;
    let filePath = req.body.destination;

    let fileNameExtension = filename.split('.').pop();
    if (fileNameExtension !== 'asc') {
        return {
            status: 422,
            success: false,
            errorSet: ['WRONG_FILE_EXTENSION']
        };
    }
    let mntFileName = 'mntFile=' + filePath;
    try {
        let centerPoint = await axios.post(RAD + '/getcenter?' + mntFileName);

        content = await centerPoint;
        convertJson = content.data;
    } catch (err) {
        result = {
            status: 500,
            success: false,
            errorSet: ['ERROR_WHILE_CALL_APITEST01']
        };
        res.send(result);
    }

    const type = typeof convertJson;
    if (type === 'string') {
        result = {
            status: 500,
            success: false,
            errorSet: ['TYPE_ERROR_WHEN_PROCESSING_APITEST01_RESPONSE']
        };
        res.send(result);
    }

    result = {
        status: 200,
        success: success,
        errorSet: errorSet,
        data: {
            longtitude: convertJson[0],
            latitude: convertJson[1]
        }
    };
    res.send(result);
});

router.post('/getbbox', async function (req, res) {
    let respJSON;

    let filename = req.body.filename;
    let filePath = req.body.destination;
    let fileNameExtension = filename.split('.').pop();

    let resp;

    if (fileNameExtension !== 'asc') {
        return {
            status: 422,
            success: false,
            errorSet: ['WRONG_FILE_EXTENSION']
        };
    }

    let mntFileName = 'mntFile=' + filePath;
    console.log(mntFileName);
    try {
        resp = await axios.post(RAD + '/getbbox?' + mntFileName).then((response) => response.data);
    } catch (err) {
        console.log(err);
    }
    // let obj = Object.fromEntries(resp);
    try {
        respJSON = Object.entries(resp).map(([index, coords]) => ({ index, coords }));
    } catch (err) {
        console.log(err);
    }
    res.send(respJSON);
});

router.post('/front', async function (req, res) {
    let success = true;
    let errorSet = [];
    let result = {};

    const { nameProject, filename, id_user, id_project } = req.body;
    if (!nameProject || !filename || !id_project || !id_user) {
        result = {
            status: 200,
            success: false,
            errorSet: ['MISSING PARAM']
        };
        res.send(result);
    }

    let frontResp = await axios.post(FS + '/getByFilename', {
        filename: nameProject + '_frontLine.json',
        id_user: id_user,
        id_project: id_project
    });
    let target = frontResp.data.data.destination;
    if (process.platform === 'win32') {
        target = target.replace(/\//g, '\\');
    }

    let ocsResp = await axios.post(FS + '/getByFilename', {
        filename: filename,
        id_user: id_user,
        id_project: id_project
    });
    let source = ocsResp.data.data.destination;
    if (process.platform === 'win32') {
        source = source.replace(/\//g, '\\');
    }

    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    const cmd =
        '-i ' +
        target +
        ' -divide ' +
        source +
        ` -o force ../files/tmp/${id_project}/` +
        nameProject +
        '_frontFeu.json';
    await mapshaper.runCommands(cmd);
    
    let target1 = `../files/tmp/${id_project}/${nameProject}_frontFeu.json`;
    target1 = target1.replace(/\//g, '\\');
    const cmd2 = target1 + ' -explode ' + ` -o force ../files/tmp/${id_project}/` + nameProject + "_frontFeuOrder.json";
    await mapshaper.runCommands(cmd2);
    let dest = path.resolve(newFilePath, `${nameProject}_frontFeu.json`);
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

    let dest1 = path.resolve(newFilePath, `${nameProject}_frontFeuOrder.json`);
    let formData1 = new FormData();
    formData1.append('file', fs.createReadStream(dest1));
    formData1.append('id_user', id_user);
    formData1.append('id_project', id_project);
    let sendFileResp1 = await axios.post(FS + '/single', formData1);
    let result1 = {};
    if (!sendFileResp1.data.success) {
        result1 = {
            status: 200,
            success: false,
            errorSet: ['ERROR UPLOAD SERVER']
        };
        res.send(result1);
    }
    fs.unlinkSync(dest);
    fs.unlinkSync(dest1);
    result1 = {
        success: success,
        errorSet: errorSet
    };
    res.send(result);
});

module.exports = router;

// router.post('/test', async function (request, response) {
//     let success = true;
//     let errorSet = [];
//     let result = {};

//     if (!request.body.data || !request.body.id_user || !request.body.id_project) {
//         result = {
//             status: 200,
//             success: false,
//             errorSet: ['MISSING PARAM']
//         };
//         response.send(result);
//     }
//     let data = request.body.data;
//     let { nameProject, id_user, id_project } = request.body;
//     let dest = path.join(__dirname, '../../../files/tmp/' + nameProject + '_frontLine.json');
//     fs.writeFileSync(dest, data);
//     let formData = new FormData();

//     formData.append('file', fs.createReadStream(dest));
//     formData.append('id_user', id_user);
//     formData.append('id_project', id_project);
//     // formData.append('originalname', id_project + '_frontLine.json');
//     // console.log(formData);
//     let resp = await axios.post(FS + '/single', formData);
//     if (!resp.data.success) {
//         result = {
//             status: 200,
//             success: false,
//             errorSet: ['ERROR UPLOAD SERVER']
//         };
//         response.send(result);
//     }
//     // remove tmp file
//     fs.rmSync(dest);
//     // response.json(data);
//     response.send(data);
// });
