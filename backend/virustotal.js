const axios = require("axios");

const API_KEY = process.env.VT_API_KEY;

// Encode URL for VirusTotal
function urlToBase64(url) {
  return Buffer.from(url).toString("base64").replace(/=/g, "");
}

// Submit URL for scanning
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

// Main function
async function getVirusTotalReport(url) {
  const encodedUrl = urlToBase64(url);

  try {
    // 🔹 Try to GET existing report first
    const res = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      {
        headers: { "x-apikey": API_KEY }
      }
    );

    return res.data;

  } catch (err) {
    // 🔹 If not found → submit for scanning
    if (err.response && err.response.status === 404) {
      console.log("URL not scanned yet. Submitting...");

      await submitUrlForScan(url);

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