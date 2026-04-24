const axios = require("axios");

const API_KEY = process.env.VT_API_KEY;

// Encode URL for VirusTotal (URL-safe base64 with no padding)
function urlToBase64(url) {
  return Buffer.from(url)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Submit URL for scanning (used when VT has never seen this URL before)
async function submitUrlForScan(url) {
  return axios.post(
    "https://www.virustotal.com/api/v3/urls",
    `url=${encodeURIComponent(url)}`,
    {
      headers: {
        "x-apikey": API_KEY,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
}

// Main function: try to fetch an existing report; if none exists, submit
// the URL for scanning and tell the caller to retry shortly.
async function getVirusTotalReport(url) {
  if (!API_KEY) {
    console.error("VT_API_KEY not set in environment");
    return null;
  }

  const encodedUrl = urlToBase64(url);

  try {
    const res = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      { headers: { "x-apikey": API_KEY } }
    );
    return res.data;
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log("URL not scanned yet. Submitting...");
      try {
        await submitUrlForScan(url);
      } catch (submitErr) {
        console.error("VT submit error:", submitErr.message);
        return null;
      }
      return {
        pending: true,
        message: "URL submitted for scanning. Try again in a few seconds."
      };
    }

    console.error("VirusTotal error:", err.message);
    return null;
  }
}

module.exports = { getVirusTotalReport };