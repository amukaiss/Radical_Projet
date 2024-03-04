const express = require('express');
const router = express.Router();
const bo = require('./project.bo');
const { check } = require('express-validator');

router.post('/createProject', async function (req, res) {
    const params = { id_user: req.id_user, body: req.body };
    const result= await bo.create(params);
    res.send(result);
});

router.post('/getById', async function (req, res) {
    const params = { _id: req.body._id };
    const result = await bo.getById(params);
    res.send(result);
});

router.post('/getByIdUser', async function (req, res) {
    const params = { id_user: req.body.id_user };
    const result = await bo.getByIdUser(params);
    res.send(result);
});

router.post('/checkProjectByIdUser', async function (req, res) {
    const params = { title: req.body.title, id_user: req.body.id_user };
    const result = await bo.checkProjectByIdUser(params);
    res.send(result);
});

router.post('/getProjectSet', async function (req, res) {
    const params = { body: req.body };
    const result = await bo.getSet(params);
    res.send(result);
});

router.put('/:_id', [check('_id').isUUID()], async function (req, res, next) {
    const params = { _id: req.params._id, ...req.body };
    const result = await bo.modify(params);
    res.send(result);
});

router.delete('/:_id', async function (req, res) {
    const params = { _id: req.params._id };
    const result = await bo.delete(params);
    res.send(result);
});

module.exports = router;
