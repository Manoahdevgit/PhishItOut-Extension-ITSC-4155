require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { getVirusTotalReport } = require("./virustotal");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust the proxy. Render (and most hosts) sit behind a load balancer,
// so without this `req.ip` is wrong and express-rate-limit complains.
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, report.html, learn.html, script.js,
// styles.css, etc.) from the repo root, which is one level up from /backend.
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// Rate limiter (5 requests per hour per IP) on /report only
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many reports from this IP. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/report', limiter);

// Helper to get IP
function getIP(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

// Health check — useful for confirming a deploy is live
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    vtKeyConfigured: Boolean(process.env.VT_API_KEY)
  });
});

// POST: Submit a report
app.post('/report', (req, res) => {
  const { url, report } = req.body;
  const ip = getIP(req);

  if (!url || !report) {
    return res.status(400).json({ error: "Missing url or report" });
  }

  const stmt = `
    INSERT INTO reports (url, report, ip)
    VALUES (?, ?, ?)
  `;

  db.run(stmt, [url, report, ip], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      success: true,
      reportId: this.lastID
    });
  });
});

// GET: fetch reports for a URL
app.get('/reports', (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  db.all(
    `SELECT * FROM reports WHERE url = ? ORDER BY created_at DESC`,
    [url],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});

// GET: VirusTotal lookup
app.get("/vt-report", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  if (!process.env.VT_API_KEY) {
    return res.status(500).json({ error: "VirusTotal API key not configured" });
  }

  try {
    const data = await getVirusTotalReport(url);
    if (!data) {
      return res.status(500).json({ error: "VirusTotal request failed" });
    }
    res.json(data);
  } catch (err) {
    console.error("VT route error:", err);
    res.status(500).json({ error: "VirusTotal request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});