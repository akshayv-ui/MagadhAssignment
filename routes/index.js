const express = require('express');

const router = express.Router();
const bullBoardController = require('./bullboard.js').bullBoardController;

// router.use('/', require('../auth/apiKey.js').router);

router.use('/v1', require('./v1/index.js').router);
router.use('/queues', bullBoardController);

exports.default = router