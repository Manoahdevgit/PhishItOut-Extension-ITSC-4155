// Placeholder site data until the real API is connected
const siteData = {
    "google.com":       { score: 95, risk: "low",    notes: "Well-established site with no known threats detected." },
    "facebook.com":     { score: 88, risk: "low",    notes: "Large platform, generally considered safe." },
    "cnn.com":          { score: 78, risk: "low",    notes: "Known news outlet, no major threats found." },
    "foxnews.com":      { score: 72, risk: "medium", notes: "Some trackers detected. No direct threats, but proceed with awareness." },
    "example-scam.com": { score: 12, risk: "high",   notes: "Multiple threat detectors flagged this site. Avoid entering any personal information." }
};

function normalizeDomain(input) {
    let value = input.trim().toLowerCase();
    value = value.replace(/^https?:\/\//, "");
    value = value.replace(/^www\./, "");
    value = value.split("/")[0];
    return value;
}

function checkSite() {
    const urlInput = document.getElementById("urlInput");
    const resultsBox = document.getElementById("results");

    if (!urlInput || !resultsBox) return;

    const input = normalizeDomain(urlInput.value);

    resultsBox.classList.remove("hidden");

    if (!input) {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `<p class="result-no-data">Please enter a website to check.</p>`;
        return;
    }

    const site = siteData[input];

    if (site) {
        const barWidth = site.score + "%";
        const riskLabel =
            site.risk === "low" ? "Safe" :
            site.risk === "medium" ? "Caution" :
            "Dangerous";

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

function submitReport() {
    const reportUrl = document.getElementById("reportUrl");
    const reportType = document.getElementById("reportType");
    const confirmBox = document.getElementById("reportConfirm");

    if (!reportUrl || !reportType || !confirmBox) return;

    const url = reportUrl.value.trim();
    const type = reportType.value;

    confirmBox.classList.remove("hidden");

    if (!url || !type) {
        confirmBox.className = "error-message";
        confirmBox.innerHTML = "Please fill in the URL and select a reason before submitting.";
        return;
    }

    confirmBox.className = "confirm-message";
    confirmBox.innerHTML = "Report received. Thanks for helping keep people safe.";

    reportUrl.value = "";
    reportType.value = "";
    const reportDetails = document.getElementById("reportDetails");
    if (reportDetails) reportDetails.value = "";
}

document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("urlInput");
    const checkBtn = document.getElementById("checkBtn");
    const reportBtn = document.getElementById("reportBtn");

    if (urlInput) {
        urlInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                checkSite();
            }
        });
    }

    if (checkBtn) {
        checkBtn.addEventListener("click", checkSite);
    }

    if (reportBtn) {
        reportBtn.addEventListener("click", submitReport);
    }
});
