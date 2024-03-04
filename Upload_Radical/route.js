process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const express = require('express');
const router = express.Router();
const upload = require('./upload/upload.route');

const cors = require('cors');
const corsOpt = {
    origin: '*' // reflect the request origin
};

router.use(cors(corsOpt));

router.use('/uploads', upload);

module.exports = router;
