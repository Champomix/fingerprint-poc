const path = require('path');
const fse = require('fs-extra');
const { FingerprintJsServerApiClient, Region } = require('@fingerprintjs/fingerprintjs-pro-server-api');
require('dotenv').config();

const dataFilePath = path.join(__dirname, '../data/fingerprints-pro.json');

// Initialiser le client API FingerprintJS Pro
let fpClient = null;

try {
  const secretKey = process.env.FINGERPRINT_PRO_SECRET_KEY;
  
  if (secretKey) {
    fpClient = new FingerprintJsServerApiClient({
      apiKey: secretKey,
      region: process.env.FINGERPRINT_PRO_REGION === 'us' ? Region.US : 
              process.env.FINGERPRINT_PRO_REGION === 'ap' ? Region.AP : 
              Region.EU
    });
    console.log('✅ Client FingerprintJS Pro initialisé');
  } else {
    console.warn('⚠️ Clé API FingerprintJS Pro non configurée dans .env');
  }
} catch (error) {
  console.error('❌ Erreur initialisation client Pro:', error.message);
}

// S'assurer que le fichier de données existe
fse.ensureFileSync(dataFilePath);
try {
  const content = fse.readFileSync(dataFilePath, 'utf8');
  if (!content || content.trim() === '') {
    fse.writeJsonSync(dataFilePath, { fingerprints: [] });
  }
} catch {
  fse.writeJsonSync(dataFilePath, { fingerprints: [] });
}

// Enregistrer une empreinte Pro
exports.createFingerprintPro = async (req, res) => {
  try {
    const fingerprintData = req.body;

    // Vérification côté serveur avec l'API Pro (si client disponible)
    let serverVerification = null;
    if (fpClient && fingerprintData.requestId) {
      try {
        const event = await fpClient.getEvent(fingerprintData.requestId);
        serverVerification = {
          visitorId: event.products?.identification?.data?.visitorId,
          confidence: event.products?.identification?.data?.confidence?.score,
          verified: true,
          timestamp: event.products?.identification?.data?.timestamp
        };
        console.log('🔍 Vérification serveur Pro:', serverVerification);
      } catch (verifyError) {
        console.warn('⚠️ Vérification serveur Pro échouée:', verifyError.message);
        serverVerification = { verified: false, error: verifyError.message };
      }
    }

    const data = fse.readJsonSync(dataFilePath);

    // Vérifier si le visitorId existe déjà
    const existingIndex = data.fingerprints.findIndex(
      (fp) => fp.visitorId === fingerprintData.visitorId
    );

    const newEntry = {
      ...fingerprintData,
      serverVerification,
      timestamp: new Date().toISOString(),
      visits: 1
    };

    if (existingIndex !== -1) {
      // Incrémenter le compteur de visites
      data.fingerprints[existingIndex].visits += 1;
      data.fingerprints[existingIndex].lastSeen = new Date().toISOString();
      data.fingerprints[existingIndex].serverVerification = serverVerification;
    } else {
      // Nouvelle empreinte
      data.fingerprints.push(newEntry);
    }

    fse.writeJsonSync(dataFilePath, data, { spaces: 2 });

    const visits = existingIndex !== -1 ? data.fingerprints[existingIndex].visits : 1;

    res.status(201).json({
      message: 'Fingerprint Pro enregistré avec succès',
      visits,
      isNew: existingIndex === -1,
      serverVerification,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur createFingerprintPro:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Récupérer toutes les empreintes Pro
exports.getAllFingerprintsPro = (req, res) => {
  try {
    const data = fse.readJsonSync(dataFilePath);
    res.json({
      count: data.fingerprints.length,
      fingerprints: data.fingerprints
    });
  } catch (error) {
    console.error('Erreur getAllFingerprintsPro:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Statistiques Pro
exports.getStatsPro = (req, res) => {
  try {
    const data = fse.readJsonSync(dataFilePath);
    const fingerprints = data.fingerprints;

    const stats = {
      totalFingerprints: fingerprints.length,
      totalVisits: fingerprints.reduce((sum, fp) => sum + (fp.visits || 1), 0),
      incognitoDetected: fingerprints.filter(fp => fp.incognito === true).length,
      uniqueCountries: [...new Set(fingerprints.map(fp => fp.ipLocation?.country?.code).filter(Boolean))].length,
      avgConfidence: fingerprints.length > 0
        ? fingerprints.reduce((sum, fp) => sum + (fp.confidence?.score || 0), 0) / fingerprints.length
        : 0,
      browsers: {},
      os: {},
      countries: {}
    };

    // Compter les navigateurs
    fingerprints.forEach(fp => {
      const browser = fp.browserName || 'Unknown';
      stats.browsers[browser] = (stats.browsers[browser] || 0) + 1;
    });

    // Compter les OS
    fingerprints.forEach(fp => {
      const os = fp.os || 'Unknown';
      stats.os[os] = (stats.os[os] || 0) + 1;
    });

    // Compter les pays
    fingerprints.forEach(fp => {
      const country = fp.ipLocation?.country?.name || 'Unknown';
      stats.countries[country] = (stats.countries[country] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Erreur getStatsPro:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};

// Supprimer toutes les empreintes Pro
exports.deleteAllFingerprintsPro = (req, res) => {
  try {
    fse.writeJsonSync(dataFilePath, { fingerprints: [] }, { spaces: 2 });
    res.json({ message: 'Toutes les empreintes Pro ont été supprimées' });
  } catch (error) {
    console.error('Erreur deleteAllFingerprintsPro:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
};
