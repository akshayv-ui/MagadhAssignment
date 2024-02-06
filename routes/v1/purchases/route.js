const express = require('express');
const purchaseController = require('./controller').default;
const router = express.Router();

router.post('/newOrder', purchaseController.newOrder);

router.get('/totalRevenue', purchaseController.totalRevenue);

router.put('/updatePurchase', purchaseController.updatePurchase);

exports.default = router;