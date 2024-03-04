const express = require('express');
const router = express.Router();
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const axios = require('axios');
const FS = process.env.FS;

router.post('/', async function (req, res) {
    let result = {};
    let success = true;
    let errorSet = [];
    if (!req.body.data || !req.body.id_user || !req.body.id_project) {
        result = {
            status: 200,
            success: false,
            errorSet: ['MISSING PARAM']
        };
        res.send(result);
    }
    let data = req.body.data;
    data = JSON.stringify(data);
    let { nameProject, id_user, id_project } = req.body;

    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    let dest = path.join(newFilePath, './' + nameProject + '_frontLine.json');
    fs.writeFileSync(dest, data);
    let formData = new FormData();

    formData.append('file', fs.createReadStream(dest));
    formData.append('id_user', id_user);
    formData.append('id_project', id_project);
    // formData.append('originalname', id_project + '_frontLine.json');
    // console.log(formData);
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
    // res.json(data);
    result = {
        success: success,
        errorSet: errorSet,
        data: data,
        file: resp.data
    };
    res.send(data);
});

module.exports = router;
