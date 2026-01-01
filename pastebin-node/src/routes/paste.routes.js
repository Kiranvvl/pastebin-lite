// src/routes/paste.routes.js
const express = require('express');
const { nanoid } = require('nanoid');
const pool = require('../db/index');
const { getNow } = require('../utils/time');

const router = express.Router();

/* CREATE PASTE */
router.post('/pastes', async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validate
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ 
        error: 'content is required and must be a non-empty string' 
      });
    }
    
    if (ttl_seconds && (typeof ttl_seconds !== 'number' || ttl_seconds < 1 || !Number.isInteger(ttl_seconds))) {
      return res.status(400).json({ 
        error: 'ttl_seconds must be an integer ≥ 1' 
      });
    }
    
    if (max_views && (typeof max_views !== 'number' || max_views < 1 || !Number.isInteger(max_views))) {
      return res.status(400).json({ 
        error: 'max_views must be an integer ≥ 1' 
      });
    }

    // Generate ID
    const id = nanoid(8);
    const now = new Date();
    const expiresAt = ttl_seconds 
      ? new Date(now.getTime() + ttl_seconds * 1000)
      : null;

    // Insert into database
    await pool.query(
      `INSERT INTO pastes (id, content, created_at, expires_at, max_views, views_used)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [id, content.trim(), now, expiresAt, max_views || null]
    );

    // Return response
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
    
    res.status(201).json({
      id,
      url: `${appUrl}/p/${id}`
    });
  } catch (err) {
    console.error('Error creating paste:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* GET PASTE (API) */
router.get('/pastes/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const now = getNow(req);
    
    await client.query('BEGIN');
    
    // Get paste with row locking
    const result = await client.query(
      `SELECT * FROM pastes WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = result.rows[0];
    
    // Check expiry
    if (paste.expires_at && now > paste.expires_at) {
      await client.query('DELETE FROM pastes WHERE id = $1', [id]);
      await client.query('COMMIT');
      client.release();
      return res.status(404).json({ error: 'Paste expired' });
    }
    
    // Check view limit
    if (paste.max_views && paste.views_used >= paste.max_views) {
      await client.query('ROLLBACK');
      client.release();
      return res.status(404).json({ error: 'View limit exceeded' });
    }

    // Increment view count
    await client.query(
      'UPDATE pastes SET views_used = views_used + 1 WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');
    
    // Prepare response
    const response = {
      content: paste.content
    };

    if (paste.max_views) {
      response.remaining_views = paste.max_views - paste.views_used - 1;
    }

    if (paste.expires_at) {
      response.expires_at = paste.expires_at.toISOString();
    }

    client.release();
    res.json(response);
  } catch (err) {
    await client.query('ROLLBACK');
    client.release();
    console.error('Error fetching paste:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* VIEW PASTE (HTML) */
router.get('/p/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);
    
    // Get paste
    const result = await pool.query(
      `SELECT * FROM pastes WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('<h1>Paste not found</h1>');
    }

    const paste = result.rows[0];
    
    // Check expiry
    if (paste.expires_at && now > paste.expires_at) {
      await pool.query('DELETE FROM pastes WHERE id = $1', [id]);
      return res.status(404).send('<h1>Paste expired</h1>');
    }
    
    // Check view limit
    if (paste.max_views && paste.views_used >= paste.max_views) {
      return res.status(404).send('<h1>View limit exceeded</h1>');
    }

    // Increment view count
    await pool.query(
      'UPDATE pastes SET views_used = views_used + 1 WHERE id = $1',
      [id]
    );

    // Escape HTML
    const escapedContent = paste.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Create HTML
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paste: ${id}</title>
        <style>
          body { 
            font-family: sans-serif; 
            padding: 20px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          pre { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 5px; 
            overflow-x: auto; 
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .info { 
            background: #e3f2fd; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          a { 
            color: #007bff; 
            text-decoration: none; 
          }
          a:hover { 
            text-decoration: underline; 
          }
        </style>
      </head>
      <body>
        <h1>Paste: ${id}</h1>
        <div class="info">
          <p>Created: ${new Date(paste.created_at).toLocaleString()}</p>
          ${paste.expires_at ? `<p>Expires: ${new Date(paste.expires_at).toLocaleString()}</p>` : ''}
          <p>Views: ${paste.views_used + 1}${paste.max_views ? ` of ${paste.max_views}` : ''}</p>
        </div>
        <pre>${escapedContent}</pre>
        <p style="margin-top: 20px;">
          <a href="/">← Create new paste</a> | 
          <a href="/api/pastes/${id}">View as JSON</a>
        </p>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (err) {
    console.error('Error rendering paste:', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
});

module.exports = router;