require("dotenv").config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiter (5 requests per hour per IP)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many reports from this IP. Try again later." }
});

app.use('/report', limiter);

// Helper to get IP
function getIP(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

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

  db.run(stmt, [url, report, ip], function(err) {
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

// GET: (optional) fetch reports for a URL
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
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const { getVirusTotalReport } = require("./virustotal");

app.get("/vt-report", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing URL" });
  }

  const data = await getVirusTotalReport(url);

  if (!data) {
    return res.status(500).json({ error: "VirusTotal request failed" });
  }

  res.json(data);
});