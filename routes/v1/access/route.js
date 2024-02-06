const { Router } = require('express');
const accessController = require('./controller').accessController;
const schema = require('./schema').schema;
const validator = require('../../../helpers/joi').validator;

const router = Router();

router.post('/sign-in', validator(schema.signIn, 'body'), accessController.signIn);

router.post('/create-user', accessController.createUser);

// router.post('/create-admin', accessController.createAdmin);

router.post('/refresh-token', accessController.refreshToken);

router.post('/sign-out', accessController.signOut);


exports.router = router;