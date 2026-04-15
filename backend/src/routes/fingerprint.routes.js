const express = require('express');
const router = express.Router();
const fingerprintController = require('../controllers/fingerprint.controller');

// POST - Enregistrer un nouveau fingerprint
router.post('/fingerprints', fingerprintController.saveFingerprint);

// GET - Récupérer tous les fingerprints
router.get('/fingerprints', fingerprintController.getAllFingerprints);

// GET - Statistiques globales
router.get('/fingerprints/stats/summary', fingerprintController.getStats);

// GET - Récupérer un fingerprint par visitorId
router.get('/fingerprints/:visitorId', fingerprintController.getByVisitorId);

// DELETE - Supprimer tous les fingerprints
router.delete('/fingerprints', fingerprintController.deleteAll);

// DELETE - Supprimer un fingerprint par visitorId
router.delete('/fingerprints/:visitorId', fingerprintController.deleteOne);

module.exports = router;
