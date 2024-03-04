const express = require('express');
const router = express.Router();
const fs = require('fs');
const FS = process.env.FS;
const FormData = require('form-data');
const path = require('path');
const axios = require('axios');

router.post('/', async function (req, res) {
    let result = {};

    if (!req.body.data || !req.body.id_user || !req.body.id_project) {
        result = {
            status: 200,
            success: false,
            errorSet: ['MISSING PARAM']
        };
        res.send(result);
    }
    let data = req.body.data;
    let { nameProject, id_user, id_project } = req.body;
    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);
    if (!fs.existsSync(newFilePath)) {
        fs.mkdirSync(newFilePath, { recursive: true });
    }

    let dest = path.join(newFilePath, './' + nameProject + '_rectangle.json');
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
    // res.json(data);
    res.send(data);
});
module.exports = router;
