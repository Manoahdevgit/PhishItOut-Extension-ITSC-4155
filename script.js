// API base URL. Empty string = "same origin as this page", which is
// what we want now that the backend serves this file too.
// For local dev where you might run frontend separately, change to
// "http://localhost:3000".
const API_BASE = "";

async function checkSite() {
  const inputEl = document.getElementById("urlInput");
  const resultsBox = document.getElementById("results");
  const vtBox = document.getElementById("vtResults");
  const reportsContainer = document.getElementById("reportsContainer");

  const input = inputEl.value.trim();

  if (!input) {
    alert("Please enter a URL");
    return;
  }

  // Normalize URL
  const url = input.startsWith("http") ? input : "https://" + input;

  // Show loading states (and reveal the boxes)
  resultsBox.classList.remove("hidden");
  resultsBox.innerHTML = "<p>Loading site data...</p>";

  if (vtBox) {
    vtBox.classList.remove("hidden");
    vtBox.innerHTML = "<p>Checking VirusTotal...</p>";
  }
  if (reportsContainer) {
    reportsContainer.classList.remove("hidden");
    reportsContainer.innerHTML = "<p>Loading reports...</p>";
  }

  try {
    // Run BOTH requests in parallel
    const [reportsRes, vtRes] = await Promise.all([
      fetch(`${API_BASE}/reports?url=${encodeURIComponent(url)}`),
      fetch(`${API_BASE}/vt-report?url=${encodeURIComponent(url)}`)
    ]);

    if (!reportsRes.ok) throw new Error("Failed to fetch reports");

    const reportsData = await reportsRes.json();
    // Don't throw on a VT failure — just show "unavailable" for that panel
    const vtData = vtRes.ok ? await vtRes.json() : null;

    // === Reports summary ===
    const reportCount = Array.isArray(reportsData) ? reportsData.length : 0;

    let riskLevel = "Low";
    if (reportCount >= 3) riskLevel = "Medium";
    if (reportCount >= 5) riskLevel = "High";

    if (reportCount === 0) {
      resultsBox.innerHTML = `
        <p><strong>No reports found</strong></p>
        <p>This site has not been flagged yet.</p>
      `;
    } else {
      resultsBox.innerHTML = `
        <p><strong>Reports found:</strong> ${reportCount}</p>
        <p><strong>Risk level:</strong> ${riskLevel}</p>
      `;
    }

    // === User reports list ===
    renderReports(reportsData);

    // === VirusTotal panel ===
    if (vtBox) {
      if (!vtData) {
        vtBox.innerHTML = `<p>VirusTotal data unavailable.</p>`;
      } else if (vtData.pending) {
        vtBox.innerHTML = `<p>${vtData.message}</p>`;
      } else if (vtData?.data?.attributes?.last_analysis_stats) {
        const stats = vtData.data.attributes.last_analysis_stats;
        vtBox.innerHTML = `
          <p><strong>VirusTotal:</strong></p>
          <p>Malicious: ${stats.malicious}</p>
          <p>Suspicious: ${stats.suspicious}</p>
          <p>Harmless: ${stats.harmless}</p>
          <p>Undetected: ${stats.undetected}</p>
        `;
      } else {
        vtBox.innerHTML = `<p>No VirusTotal data available.</p>`;
      }
    }

  } catch (err) {
    console.error(err);
    resultsBox.innerHTML = `<p>Error checking site</p>`;
    if (vtBox) vtBox.innerHTML = `<p>Error loading VirusTotal data</p>`;
    if (reportsContainer) reportsContainer.innerHTML = `<p>Error loading reports</p>`;
  }
}

function renderReports(data) {
  const container = document.getElementById("reportsContainer");
  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = "<p>No user reports yet.</p>";
    return;
  }

  data.forEach(r => {
    const div = document.createElement("div");
    div.textContent = r.report;
    container.appendChild(div);
  });
}

// Allow pressing Enter to trigger the check — guarded so this script
// doesn't crash on report.html / learn.html where #urlInput doesn't exist.
const urlInputEl = document.getElementById("urlInput");
if (urlInputEl) {
  urlInputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") checkSite();
  });
}

// Handles the report form submission
function submitReport() {
  const url = document.getElementById("reportUrl").value.trim();
  const type = document.getElementById("reportType").value;
  const details = document.getElementById("reportDetails").value.trim();
  const confirmEl = document.getElementById("reportConfirm");

  if (!url || !type) {
    confirmEl.className = "error-message";
    confirmEl.innerHTML = "Please fill in the URL and select a reason before submitting.";
    return;
  }

  let reportText = type;
  if (details) reportText += ": " + details;

  fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, report: reportText })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        confirmEl.className = "confirm-message";
        confirmEl.innerHTML = "Report received. Thanks for helping keep people safe.";
        document.getElementById("reportUrl").value = "";
        document.getElementById("reportType").value = "";
        document.getElementById("reportDetails").value = "";
      } else {
        confirmEl.className = "error-message";
        confirmEl.innerHTML = "Error submitting report: " + (data.error || "Unknown error");
      }
    })
    .catch(err => {
      console.error(err);
      confirmEl.className = "error-message";
      confirmEl.innerHTML = "Error submitting report. Please try again.";
    });
}