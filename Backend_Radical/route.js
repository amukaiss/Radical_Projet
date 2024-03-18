process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const express = require('express');
const router = express.Router();
const ps2f = require('./ps2f');

const cors = require('cors');
const corsOpt = {
    origin: true // reflect the request origin
};

router.use(cors(corsOpt));

router.use('/ps2f', ps2f);

module.exports = router;
