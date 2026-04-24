const siteData = {
    "google.com": { score: 95, risk: "low", notes: "Well-established site with no known threats detected." },
    "facebook.com": { score: 88, risk: "low", notes: "Large platform, generally considered safe." },
    "cnn.com": { score: 78, risk: "low", notes: "Known news outlet, no major threats found." },
    "foxnews.com": { score: 72, risk: "medium", notes: "Some trackers detected. No direct threats, but proceed with awareness." },
    "example-scam.com": { score: 12, risk: "high", notes: "Multiple threat detectors flagged this site. Avoid entering any personal information." }
};

function normalizeDomain(input) {
    return input
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
}

function isValidWebsiteInput(input) {
    const domain = normalizeDomain(input);
    const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainPattern.test(domain);
}

function checkSite() {
    const urlInput = document.getElementById("urlInput");
    const resultsBox = document.getElementById("results");

    if (!urlInput || !resultsBox) return;

    const rawInput = urlInput.value.trim();
    const input = normalizeDomain(rawInput);

    if (!rawInput) {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `<p class="result-no-data">Please enter a website to check.</p>`;
        return;
    }

    if (!isValidWebsiteInput(rawInput)) {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `<p class="result-no-data">Please enter a valid website URL, like google.com.</p>`;
        return;
    }

    const site = siteData[input];

    if (!site) {
        resultsBox.className = "results-box";
        resultsBox.innerHTML = `
            <p class="result-domain">${input}</p>
            <p class="result-no-data">No data on file for this site yet. If it seems suspicious, consider reporting it.</p>
        `;
        return;
    }

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
                <div class="risk-bar-fill" style="width: ${site.score}%"></div>
            </div>
        </div>

        <p class="result-notes">${site.notes}</p>
    `;
}

document.addEventListener("DOMContentLoaded", function () {
    const urlInput = document.getElementById("urlInput");
    const checkBtn = document.getElementById("checkBtn");

    if (checkBtn) {
        checkBtn.addEventListener("click", checkSite);
    }

    if (urlInput) {
        urlInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") checkSite();
        });
    }
});