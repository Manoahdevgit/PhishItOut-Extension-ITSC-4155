// Placeholder site data until the real API is connected
const siteData = {
    "google.com":       { score: 95, risk: "low",    notes: "Well-established site with no known threats detected." },
    "facebook.com":     { score: 88, risk: "low",    notes: "Large platform, generally considered safe." },
    "cnn.com":          { score: 78, risk: "low",    notes: "Known news outlet, no major threats found." },
    "foxnews.com":      { score: 72, risk: "medium", notes: "Some trackers detected. No direct threats, but proceed with awareness." },
    "example-scam.com": { score: 12, risk: "high",   notes: "Multiple threat detectors flagged this site. Avoid entering any personal information." }
};

function checkSite() {
    const input = document.getElementById("urlInput").value.trim().toLowerCase();
    const resultsBox = document.getElementById("results");

    if (!input) {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `<p class="result-no-data">Please enter a website to check.</p>`;
        return;
    }

    const site = siteData[input];

    if (site) {
        const barWidth = site.score + "%";
        const riskLabel = site.risk === "low" ? "Safe" : site.risk === "medium" ? "Caution" : "Dangerous";

        resultsBox.className = `results-box risk-${site.risk}`;
        resultsBox.innerHTML = `
            <p class="result-domain">${input}</p>
            <div class="result-score-row">
                <span class="score">${site.score}</span>
                <span class="risk-label">${riskLabel}</span>
            </div>
            <div class="risk-bar-wrap">
                <div class="risk-bar-track">
                    <div class="risk-bar-fill" style="width: ${barWidth}"></div>
                </div>
            </div>
            <p class="result-notes">${site.notes}</p>
        `;
    } else {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `
            <p class="result-domain">${input}</p>
            <p class="result-no-data">No data on file for this site yet. If it seems suspicious, consider reporting it.</p>
        `;
    }
}

// Allow pressing Enter to trigger the check
document.getElementById("urlInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") checkSite();
});

// Handles the report form submission
function submitReport() {
    const url = document.getElementById("reportUrl").value.trim();
    const type = document.getElementById("reportType").value;
    const confirm = document.getElementById("reportConfirm");

    if (!url || !type) {
        confirm.className = "error-message";
        confirm.innerHTML = "Please fill in the URL and select a reason before submitting.";
        return;
    }

    // Show success 
    confirm.className = "confirm-message";
    confirm.innerHTML = "Report received. Thanks for helping keep people safe.";
}
