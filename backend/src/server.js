require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-OpenAI-Key']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rsid', require('./routes/rsid'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'GeneShield AI Backend is running',
    openAI: !!process.env.OPENAI_API_KEY ? 'configured' : 'not configured (using rule-based fallback)',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    const aiStatus = process.env.OPENAI_API_KEY ? '✅ OpenAI configured' : '⚠  No OpenAI key — using rule-based fallback';
    console.log(`\n🧬 GeneShield AI Backend  →  http://localhost:${PORT}`);
    console.log(`🤖 AI Status             →  ${aiStatus}`);
    console.log(`🔑 Admin Login           →  admin@geneshield.ai / Admin@1234\n`);
  });
}

module.exports = app;
