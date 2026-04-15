const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fse = require('fs-extra');

const fingerprintRoutes = require('./routes/fingerprint.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// S'assurer que le fichier de données existe
const dataFilePath = path.join(__dirname, 'data', 'fingerprints.json');
fse.ensureFileSync(dataFilePath);

fse.readFile(dataFilePath, 'utf8').then(content => {
  if (!content || content.trim() === '') {
    fse.writeJsonSync(dataFilePath, { fingerprints: [] });
  }
}).catch(() => {
  fse.writeJsonSync(dataFilePath, { fingerprints: [] });
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', fingerprintRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Fingerprint Tracker API is running'
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Fingerprints API: http://localhost:${PORT}/api/fingerprints`);
});

module.exports = app;
