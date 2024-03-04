const express = require('express');
const router = express.Router();
const bo = require('./file.bo');
const { check } = require('express-validator');
const multer = require('multer');
// const  storage = multer.memoryStorage();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },

    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

router.post('/read', async function (req, res) {
    const result = await bo.read();
    res.send(result);
});

router.post('/create', async function (req, res) {
    const result = await bo.create();
    res.send(result);
});

router.post('/findFile', async function (req, res) {
    const request = {
        fileName: req.body.fileName
    };
    const result = await bo.findFile(request);
    res.send(result);
});

router.post('/findJson', async function (req, res) {
    const params = { id_project: req.body.id_project };
    const result = await bo.findJson(params);
    res.send(result);
});

router.post('/listFileJson', async function (req, res) {
    const result = await bo.listFileJson();
    res.send(result);
});

router.post('/', upload.single('files'), async function (req, res) {
    const { status, ...result } = await bo.create({
        body: req.body,
        file: req.file,
        user: req.user
    });
    res.status(status).send(result);
});

router.post('/saveFileInfo', async function (req, res, next) {
    const saveFileInfoRequest = {
        id_file: req.body.id_file,
        id_project: req.body.id_project,
        id_user: req.body.id_user,
        name: req.body.filename,
        type: req.body.type,
        size: req.body.size
    };
    const saveFileInfoResponse = await bo.saveFileInfo(saveFileInfoRequest);
    res.send(saveFileInfoResponse);
});

router.put('/:_id', [check('_id').isUUID()], async function (req, res, next) {
    const params = { _id: req.params._id, ...req.body };
    const { status, ...result } = await bo.modify(params);
    res.status(status).send(result);
});

router.delete('', async function (req, res, next) {
    const { status, ...result } = await bo.delete({ params: req.params, body: req.body });
    res.status(status).send(result);
});

module.exports = router;
