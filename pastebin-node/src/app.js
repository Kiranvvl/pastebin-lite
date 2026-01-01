// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pasteRoutes = require('./routes/paste.routes');
const pool = require('./db/index');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      ok: true,
      timestamp: new Date().toISOString(),
      service: 'pastebin-lite',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      ok: false,
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api', pasteRoutes);

// Simple homepage
app.get('/', (req, res) => {
  const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pastebin-Lite</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 40px; 
        }
        textarea { 
          width: 100%; 
          height: 200px; 
          padding: 10px; 
        }
        input { 
          width: 100%; 
          padding: 8px; 
          margin: 5px 0; 
        }
        button { 
          background: #007bff; 
          color: white; 
          border: none; 
          padding: 10px 20px; 
          cursor: pointer; 
          margin-top: 10px;
        }
        .result { 
          margin-top: 20px; 
          padding: 10px; 
          background: #e8f5e9; 
          display: none;
        }
      </style>
    </head>
    <body>
      <h1>Pastebin-Lite</h1>
      <textarea id="content" placeholder="Enter your text here..."></textarea>
      <input type="number" id="ttl" placeholder="TTL in seconds (optional)" min="1">
      <input type="number" id="maxViews" placeholder="Max views (optional)" min="1">
      <button onclick="createPaste()">Create Paste</button>
      <div class="result" id="result">
        <p><strong>Paste Created!</strong></p>
        <p>Share URL: <a id="pasteUrl" target="_blank"></a></p>
      </div>
      <script>
        async function createPaste() {
          const content = document.getElementById('content').value;
          const ttl = document.getElementById('ttl').value;
          const maxViews = document.getElementById('maxViews').value;
          
          if (!content.trim()) {
            alert('Please enter some content');
            return;
          }
          
          const data = {
            content: content
          };
          
          if (ttl) data.ttl_seconds = parseInt(ttl);
          if (maxViews) data.max_views = parseInt(maxViews);
          
          try {
            const response = await fetch('/api/pastes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
              const resultDiv = document.getElementById('result');
              const urlLink = document.getElementById('pasteUrl');
              urlLink.href = result.url;
              urlLink.textContent = result.url;
              resultDiv.style.display = 'block';
            } else {
              alert('Error: ' + result.error);
            }
          } catch (error) {
            alert('Error creating paste: ' + error.message);
          }
        }
      </script>
    </body>
    </html>
  `);
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;