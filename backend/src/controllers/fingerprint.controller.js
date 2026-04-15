const path = require('path');
const fse = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/fingerprints.json');

// Helpers lecture/écriture
const readData = async () => {
  try {
    const data = await fse.readJson(DATA_FILE);
    return data;
  } catch {
    return { fingerprints: [] };
  }
};

const writeData = async (data) => {
  await fse.writeJson(DATA_FILE, data, { spaces: 2 });
};

// -------------------------------------------------------
// POST /api/fingerprints
// -------------------------------------------------------
exports.saveFingerprint = async (req, res) => {
  try {
    const { visitorId, confidence, components } = req.body;

    if (!visitorId) {
      return res.status(400).json({ error: 'visitorId is required' });
    }

    const data = await readData();
    const now = new Date().toISOString();

    // Enrichissement avec les données HTTP
    const httpInfo = {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
      referer: req.headers['referer'] || null,
    };

    // Recherche d'un fingerprint existant pour ce visitorId
    const existingIndex = data.fingerprints.findIndex(
      fp => fp.visitorId === visitorId
    );

    if (existingIndex !== -1) {
      // Mise à jour du fingerprint existant
      const existing = data.fingerprints[existingIndex];
      data.fingerprints[existingIndex] = {
        ...existing,
        confidence,
        components,
        httpInfo,
        metadata: {
          ...existing.metadata,
          lastSeen: now,
          visits: (existing.metadata?.visits || 1) + 1,
          updatedAt: now,
        }
      };

      await writeData(data);
      console.log(`✅ Fingerprint mis à jour : ${visitorId}`);

      return res.status(200).json({
        message: 'Fingerprint updated',
        visitorId,
        visits: data.fingerprints[existingIndex].metadata.visits
      });
    }

    // Nouveau fingerprint
    const newFingerprint = {
      _id: uuidv4(),
      visitorId,
      confidence,
      components,
      httpInfo,
      metadata: {
        firstSeen: now,
        lastSeen: now,
        visits: 1,
        createdAt: now,
        updatedAt: now,
      }
    };

    data.fingerprints.push(newFingerprint);
    await writeData(data);

    console.log(`🆕 Nouveau fingerprint : ${visitorId}`);
    console.log(`📦 Composants collectés : ${Object.keys(components || {}).length}`);

    return res.status(201).json({
      message: 'Fingerprint saved',
      visitorId,
      componentsCount: Object.keys(components || {}).length
    });

  } catch (error) {
    console.error('Erreur saveFingerprint:', error);
    res.status(500).json({ error: 'Failed to save fingerprint', details: error.message });
  }
};

// -------------------------------------------------------
// GET /api/fingerprints
// -------------------------------------------------------
exports.getAllFingerprints = async (req, res) => {
  try {
    const data = await readData();
    const { page = 1, limit = 20, sort = 'lastSeen' } = req.query;

    let fingerprints = [...data.fingerprints];

    // Tri
    fingerprints.sort((a, b) => {
      const dateA = new Date(a.metadata?.lastSeen || 0);
      const dateB = new Date(b.metadata?.lastSeen || 0);
      return dateB - dateA;
    });

    // Pagination
    const total = fingerprints.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const end = start + parseInt(limit);
    const paginated = fingerprints.slice(start, end);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      fingerprints: paginated
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get fingerprints', details: error.message });
  }
};

// -------------------------------------------------------
// GET /api/fingerprints/stats/summary
// -------------------------------------------------------
exports.getStats = async (req, res) => {
  try {
    const data = await readData();
    const fingerprints = data.fingerprints;

    // Analyse des composants
    const browsers = {};
    const operatingSystems = {};
    const timezones = {};
    const languages = {};
    const screenResolutions = {};
    const colorDepths = {};

    fingerprints.forEach(fp => {
      const components = fp.components || {};

      // Browser via userAgent HTTP
      const ua = fp.httpInfo?.userAgent || '';
      let browser = 'Unknown';
      if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
      else if (ua.includes('Edg')) browser = 'Edge';
      else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
      browsers[browser] = (browsers[browser] || 0) + 1;

      // OS via composant platform
      const platform = components.platform?.value || components.osCpu?.value || '';
      let os = 'Unknown';
      if (platform.includes('Win')) os = 'Windows';
      else if (platform.includes('Mac')) os = 'macOS';
      else if (platform.includes('Linux') || platform.includes('X11')) os = 'Linux';
      else if (platform.includes('iPhone') || platform.includes('iPad')) os = 'iOS';
      else if (ua.includes('Android')) os = 'Android';
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;

      // Timezone
      const tz = components.timezone?.value || 'Unknown';
      timezones[tz] = (timezones[tz] || 0) + 1;

      // Languages
      const lang = Array.isArray(components.languages?.value)
        ? components.languages.value[0]?.[0] || 'Unknown'
        : components.languages?.value || 'Unknown';
      languages[lang] = (languages[lang] || 0) + 1;

      // Screen Resolution
      const screen = Array.isArray(components.screenResolution?.value)
        ? components.screenResolution.value.join('x')
        : components.screenResolution?.value || 'Unknown';
      screenResolutions[screen] = (screenResolutions[screen] || 0) + 1;

      // Color Depth
      const cd = components.colorDepth?.value
        ? `${components.colorDepth.value} bits`
        : 'Unknown';
      colorDepths[cd] = (colorDepths[cd] || 0) + 1;
    });

    // Confidence moyenne
    const avgConfidence = fingerprints.length > 0
      ? fingerprints.reduce((acc, fp) => acc + (fp.confidence?.score || 0), 0) / fingerprints.length
      : 0;

    // Total visites
    const totalVisits = fingerprints.reduce(
      (acc, fp) => acc + (fp.metadata?.visits || 1), 0
    );

    // Composants les plus collectés
    const componentsCoverage = {};
    fingerprints.forEach(fp => {
      Object.keys(fp.components || {}).forEach(key => {
        componentsCoverage[key] = (componentsCoverage[key] || 0) + 1;
      });
    });

    res.json({
      totalVisitors: fingerprints.length,
      totalVisits,
      avgConfidence: Math.round(avgConfidence * 1000) / 1000,
      browsers,
      operatingSystems,
      timezones,
      languages,
      screenResolutions,
      colorDepths,
      componentsCoverage,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats', details: error.message });
  }
};

// -------------------------------------------------------
// GET /api/fingerprints/:visitorId
// -------------------------------------------------------
exports.getByVisitorId = async (req, res) => {
  try {
    const data = await readData();
    const fp = data.fingerprints.find(f => f.visitorId === req.params.visitorId);

    if (!fp) {
      return res.status(404).json({ error: 'Fingerprint not found' });
    }

    res.json(fp);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get fingerprint', details: error.message });
  }
};

// -------------------------------------------------------
// DELETE /api/fingerprints
// -------------------------------------------------------
exports.deleteAll = async (req, res) => {
  try {
    await writeData({ fingerprints: [] });
    res.json({ message: 'All fingerprints deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fingerprints', details: error.message });
  }
};

// -------------------------------------------------------
// DELETE /api/fingerprints/:visitorId
// -------------------------------------------------------
exports.deleteOne = async (req, res) => {
  try {
    const data = await readData();
    const index = data.fingerprints.findIndex(f => f.visitorId === req.params.visitorId);

    if (index === -1) {
      return res.status(404).json({ error: 'Fingerprint not found' });
    }

    data.fingerprints.splice(index, 1);
    await writeData(data);

    res.json({ message: 'Fingerprint deleted', visitorId: req.params.visitorId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete fingerprint', details: error.message });
  }
};
