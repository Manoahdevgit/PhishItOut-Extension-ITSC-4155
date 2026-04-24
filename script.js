async function checkSite() {
  const inputEl = document.getElementById("urlInput");
  const resultsBox = document.getElementById("results");
  const vtBox = document.getElementById("vtResults");
  const reportsContainer = document.getElementById("reportsContainer");

  const input = inputEl.value.trim();

  // 🔴 Validate input
  if (!input) {
    alert("Please enter a URL");
    return;
  }

  // 🔧 Normalize URL
  const url = input.startsWith("http") ? input : "https://" + input;

  if (!vtBox) {
  console.warn("vtResults element missing");
  return;
}

  // 🟡 Show loading states immediately
  resultsBox.classList.remove("hidden");
  resultsBox.innerHTML = "<p>Loading site data...</p>";
  vtBox.innerHTML = "<p>Checking VirusTotal...</p>";
  reportsContainer.innerHTML = "<p>Loading reports...</p>";

  try {
    // ⚡ Run BOTH requests in parallel
    const [reportsRes, vtRes] = await Promise.all([
      fetch(`http://localhost:3000/reports?url=${encodeURIComponent(url)}`),
      fetch(`http://localhost:3000/vt-report?url=${encodeURIComponent(url)}`)
    ]);

    // 🔴 Check for HTTP errors
    if (!reportsRes.ok) throw new Error("Failed to fetch reports");
    if (!vtRes.ok) throw new Error("Failed to fetch VirusTotal data");

    const reportsData = await reportsRes.json();
    const vtData = await vtRes.json();

    // =========================
    // 📊 RENDER REPORTS SUMMARY
    // =========================
    const reportCount = reportsData.length;

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

    // =========================
    // 🧾 RENDER USER REPORTS
    // =========================
    renderReports(reportsData);

    // =========================
    // 🛡️ RENDER VIRUSTOTAL DATA
    // =========================
    if (vtData.pending) {
      vtBox.innerHTML = `<p>${vtData.message}</p>`;
    } else if (vtData?.data?.attributes?.last_analysis_stats) {
      const stats = vtData.data.attributes.last_analysis_stats;

      vtBox.innerHTML = `
        <p><strong>VirusTotal:</strong></p>
        <p>Malicious: ${stats.malicious}</p>
        <p>Suspicious: ${stats.suspicious}</p>
      `;
    } else {
      vtBox.innerHTML = `<p>No VirusTotal data available.</p>`;
    }

  } catch (err) {
    // 🔴 Global error handling
    console.error(err);

    resultsBox.innerHTML = `<p>Error checking site</p>`;
    vtBox.innerHTML = `<p>Error loading VirusTotal data</p>`;
    reportsContainer.innerHTML = `<p>Error loading reports</p>`;
  }
}

function renderReports(data) {
  const container = document.getElementById("reportsContainer");
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

// Allow pressing Enter to trigger the check
document.getElementById("urlInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") checkSite();
});

// Handles the report form submission
function submitReport() {
    const url = document.getElementById("reportUrl").value.trim();
    const type = document.getElementById("reportType").value;
    const details = document.getElementById("reportDetails").value.trim();
    const confirm = document.getElementById("reportConfirm");

    if (!url || !type) {
        confirm.className = "error-message";
        confirm.innerHTML = "Please fill in the URL and select a reason before submitting.";
        return;
    }

    // Combine type and details into report text
    let reportText = type;
    if (details) {
        reportText += ": " + details;
    }

    // Send to server
    fetch('http://localhost:3000/report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: url,
            report: reportText
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            confirm.className = "confirm-message";
            confirm.innerHTML = "Report received. Thanks for helping keep people safe.";
            // Clear form
            document.getElementById("reportUrl").value = "";
            document.getElementById("reportType").value = "";
            document.getElementById("reportDetails").value = "";
        } else {
            confirm.className = "error-message";
            confirm.innerHTML = "Error submitting report: " + (data.error || "Unknown error");
        }
    })
    .catch(err => {
        console.error(err);
        confirm.className = "error-message";
        confirm.innerHTML = "Error submitting report. Please try again.";
    });
}

function loadReports(url) {
  fetch(`http://localhost:3000/reports?url=${url}`)
    .then(res => res.json())
    .then(data => {
      console.log("Reports:", data);

      const container = document.getElementById("reportsContainer");
      container.innerHTML = "";

      data.forEach(r => {
        const div = document.createElement("div");
        div.textContent = r.report;
        container.appendChild(div);
      });
    });
}