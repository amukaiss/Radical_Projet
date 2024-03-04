const express = require('express');
const router = express.Router();
const bo = require('./upload.bo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dbHelper = require('../dbHelper');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create folder
        const randomNum = dbHelper.generateIdTechnique();
        const pathToFile = path.join(__dirname, `../../files/tmp/${randomNum}`);
        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(pathToFile, {
                recursive: true
            });
        }
        cb(null, pathToFile);
    },
    filename: (req, file, cb) => {
        //originalname is the uploaded file's name with extension
        cb(null, file.originalname);
    }
});

const filter = function (req, file, cb) {
    const fileTypes = /json|asc|geojson/;
    let mimeTypes =
        /application\/json|application\/pgp-signature|application\/geo\+json|application\/octet-stream/;

    if (process.platform === 'linux') {
        mimeTypes =
            /application\/json|application\/pgp-signature|application\/geo\+json|application\/octet-stream|text\/plain/;
    }
    const ext = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const extMime = mimeTypes.test(file.mimetype);
    if (ext && extMime) {
        return cb(null, true);
    }
    return cb(new Error('WRONG FILE EXTENSION'));
};

const uploads = multer({ storage: storage, fileFilter: filter });

// Using middleware require next
router.post('/single', uploads.single('file'), async function (req, res, next) {
    const result = await bo.create({ body: req.body, file: req.file });
    console.log('called upload');
    res.send(result);
});

router.post('/getByFilename', async function (req, res) {
    const request = {
        filename: req.body.filename,
        id_user: req.body.id_user,
        id_project: req.body.id_project
    };
    const result = await bo.getByFilenameByIdUserIdProject(request);
    console.log('called get');
    res.send(result);
});

router.post('/downloadByFilename', async function (req, res) {
    const request = {
        filename: req.body.filename,
        id_user: req.body.id_user,
        id_project: req.body.id_project
    };
    const result = await bo.getByFilenameByIdUserIdProject(request);
    if (result.data) {
        console.log('called download');
        res.sendFile(result.data.destination);
    } else {
        res.send(result);
    }
});

router.post('/getByIdUser', async function (req, res) {
    const request = { id_user: req.body.id_user };
    const result = await bo.getByIdUser(request);
    res.send(result);
});

router.post('/getByIdProject', async function (req, res) {
    const request = { id_project: req.body.id_project };
    const result = await bo.getByIdProject(request);
    res.send(result);
});

// router.post('/files', async function (res) {
//     const result = await bo.getListFile();
//     res.send(result);
// });

router.post('/modify/:id', async function (req, res, next) {
    const params = { _id: req.params._id, ...req.body };
    const { status, ...result } = await bo.modify(params);
    res.status(status).send(result);
});

router.post('/delete', async function (req, res) {
    const request = { id_files: req.body.id_files, destination: req.body.destination };
    const result = await bo.delete(request);
    res.send(result);
});

// get storage by Project ID
router.post('/storageByIdProject', async function (req, res) {
    const request = {
        id_project: req.body.id_project
    };
    const result = await bo.getStorageByIdProject(request);
    // console.log("second", result);
    res.send(result);
});

router.post('/storageByIdUser', async function (req, res) {
    const request = {
        id_user: req.body.id_user
    };
    const result = await bo.getStorageByIdUser(request);
    res.send(result);
});

module.exports = router;
