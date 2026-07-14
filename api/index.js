// Vercel Serverless Function — routes all /api/* requests to Express backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// CORS — allow geneshield.vercel.app and localhost
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-OpenAI-Key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes — resolve from backend folder
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/analysis', require('../backend/src/routes/analysis'));
app.use('/api/admin', require('../backend/src/routes/admin'));
app.use('/api/rsid', require('../backend/src/routes/rsid'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
