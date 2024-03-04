const express = require('express');
const router = express.Router();
const bo = require('./visualize.bo');

router.post('/getVisualizationWithArgument', async function (req, res) {
    const request = {
        nameProject: req.body.nameProject,
        id_user: req.body.id_user,
        id_project: req.body.id_project
    };
    const result = await bo.getVisualizationWithArgument(request);
    res.send(result);
});

module.exports = router;
