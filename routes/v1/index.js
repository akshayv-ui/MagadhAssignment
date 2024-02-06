const express = require('express');
const authentication = require('../../auth/authentication').default;
const access = require('./access/route').router;
const book = require('./books/route').default;
const purchase = require('./purchases/route').default;

const router = express.Router();

router.use('/access', access);

router.use('/', authentication);

router.use('/book', book);
router.use('/purchase', purchase);

exports.router = router;