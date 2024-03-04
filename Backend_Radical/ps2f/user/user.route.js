const express = require('express');
const router = express.Router();
const bo = require('./user.bo');

router.post('/getAll', async function (req, res) {
    const { status, ...result } = await bo.getAll();
    res.send(result);
});

router.post('/getById', async function (req, res) {
    const params = { _id: req.body._id };
    const { status, ...result } = await bo.getById(params);
    res.send(result);
});

router.post('/getByUsername', async function (req, res) {
    const request = {
        username: req.body.username
    };
    const { status, ...result } = await bo.getByUsername(request);
    res.send(result);
});

router.post('/authenticate', async function (req, res) {
    const request = {
        username: req.body.username,
        password: req.body.password
    };
    const { status, ...result } = await bo.authenticate(request);
    res.send(result);
});

router.post('/createAccount', async function (req, res) {
    const request = {
        username: req.body.username,
        password: req.body.password
    };
    const { status, ...result } = await bo.create(request);
    res.send(result);
});

router.post('/modifyAccount', async function (req, res) {
    const request = {
        _id: req.body._id,
        ...req.body
    };
    const { status, ...result } = await bo.modify(request);
    res.send(result);
});

router.post('/modifyPassword', async function (req, res) {
    const request = {
        _id: req.body._id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword
    };
    const { status, ...result } = await bo.modifyPassword(request);
    res.send(result);
});

router.post('/deleteAccount', async function (req, res) {
    const request = {
        _id: req.body._id
    };
    const { status, ...result } = await bo.delete(request);
    res.send(result);
});

module.exports = router;
