const express = require('express');
const router = express.Router();
const fingerprintProController = require('../controllers/fingerprint-pro.controller');

// Routes pour FingerprintJS Pro
router.post('/fingerprints-pro', fingerprintProController.createFingerprintPro);
router.get('/fingerprints-pro', fingerprintProController.getAllFingerprintsPro);
router.get('/fingerprints-pro/stats/summary', fingerprintProController.getStatsPro);
router.delete('/fingerprints-pro', fingerprintProController.deleteAllFingerprintsPro);

module.exports = router;
