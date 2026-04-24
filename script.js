// Placeholder site data until the real API is connected
const siteData = {
    "google.com":       { score: 95, risk: "low",    notes: "Well-established site with no known threats detected." },
    "facebook.com":     { score: 88, risk: "low",    notes: "Large platform, generally considered safe." },
    "cnn.com":          { score: 78, risk: "low",    notes: "Known news outlet, no major threats found." },
    "foxnews.com":      { score: 72, risk: "medium", notes: "Some trackers detected. No direct threats, but proceed with awareness." },
    "example-scam.com": { score: 12, risk: "high",   notes: "Multiple threat detectors flagged this site. Avoid entering any personal information." }
};

function checkSite() {
  const input = document.getElementById("urlInput").value;
  const resultsBox = document.getElementById("results");

  if (!input) {
    alert("Please enter a URL");
    return;
  }

  // Normalize URL (simple version)
  const url = input.startsWith("http") ? input : "https://" + input;

  loadReports(url);

  fetch(`http://localhost:3000/reports?url=${url}`)
    .then(res => res.json())
    .then(data => {
      console.log(data);

      resultsBox.classList.remove("hidden");

      if (data.length === 0) {
        resultsBox.innerHTML = `
          <p><strong>No reports found</strong></p>
          <p>This site has not been flagged yet.</p>
        `;
        return;
      }

      // Simple "risk score" = number of reports
      const reportCount = data.length;

      let riskLevel = "Low";
      if (reportCount >= 3) riskLevel = "Medium";
      if (reportCount >= 5) riskLevel = "High";

      resultsBox.innerHTML = `
        <p><strong>Reports found:</strong> ${reportCount}</p>
        <p><strong>Risk level:</strong> ${riskLevel}</p>
      `;
    })
    .catch(err => {
      console.error(err);
      resultsBox.classList.remove("hidden");
      resultsBox.innerHTML = `<p>Error checking site</p>`;
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