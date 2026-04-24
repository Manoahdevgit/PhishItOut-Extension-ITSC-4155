document.addEventListener("DOMContentLoaded", detectCurrentTab);

function detectCurrentTab() {
    const currentSite = document.getElementById("currentSite");
    const detectStatus = document.getElementById("detectStatus");

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;

        currentSite.textContent = currentUrl;

        if (
            currentUrl.startsWith("chrome://") ||
            currentUrl.startsWith("edge://") ||
            currentUrl.startsWith("about:")
        ) {
            detectStatus.textContent = "Open a normal website like google.com, then try again.";
            return;
        }

        const result = analyzeUrl(currentUrl);
        showResult(currentUrl, result);
    });
}

function analyzeUrl(url) {
    let score = 100;
    let reasons = [];

    if (url.length > 75) {
        score -= 25;
        reasons.push("URL is very long");
    }

    if (url.length > 120) {
        score -= 20;
        reasons.push("URL is extremely long");
    }

    if (url.includes("%")) {
        score -= 20;
        reasons.push("URL has encoded characters");
    }

    if (url.includes("@")) {
        score -= 25;
        reasons.push("URL contains an @ symbol");
    }

    if ((url.match(/-/g) || []).length >= 3) {
        score -= 15;
        reasons.push("URL has many hyphens");
    }

    if ((url.match(/\./g) || []).length >= 4) {
        score -= 15;
        reasons.push("URL has many subdomains");
    }

    if (!url.startsWith("https://")) {
        score -= 15;
        reasons.push("URL does not use HTTPS");
    }

    if (score < 0) {
        score = 0;
    }

    let risk = "low";

    if (score < 70) {
        risk = "medium";
    }

    if (score < 40) {
        risk = "high";
    }

    if (reasons.length === 0) {
        reasons.push("URL is short and looks normal");
    }

    return {
        score,
        risk,
        reasons
    };
}

function showResult(url, result) {
    const results = document.getElementById("results");

    const label =
        result.risk === "low" ? "Safe" :
        result.risk === "medium" ? "Suspicious" :
        "Dangerous";

    document.getElementById("detectStatus").textContent = `${label} Site`;

    results.className = `results-box risk-${result.risk}`;

    results.innerHTML = `
        <p><strong>URL:</strong> ${url}</p>
        <p><strong>Score:</strong> ${result.score}/100</p>
        <ul>
            ${result.reasons.map(reason => `<li>${reason}</li>`).join("")}
        </ul>
    `;
}
