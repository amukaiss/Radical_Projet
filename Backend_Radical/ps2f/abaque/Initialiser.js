const express = require('express');
const router = express.Router();
const fs = require('fs');
// const path = require('path');

router.delete('/', async function (req, res) {
    let projectName = req.projectName;
    // TO DO
    let filePath1 = '../public/Data/out.json';
    let filePath2 = '../public/Data/' + projectName + '_frontLine.json';
    let filePath3 = '../public/Data/' + projectName + '_test.json';
    let filePath4 = '../public/Data/' + projectName + '_rectangle.json';

    if (fs.existsSync(filePath1)) {
        fs.unlinkSync(filePath1);
    }
    if (fs.existsSync(filePath2)) {
        fs.unlinkSync(filePath2);
    }
    if (fs.existsSync(filePath3)) {
        fs.unlinkSync(filePath3);
    }
    if (fs.existsSync(filePath4)) {
        fs.unlinkSync(filePath4);
    }
});

module.exports = router;
