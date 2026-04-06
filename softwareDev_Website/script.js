const data = {
    "cnn.com": { score: 78 },
    "foxnews.com": { score: 65 },
    "nytimes.com": { score: 85 }
};

function searchSite() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const resultDiv = document.getElementById("result");

    if (data[input]) {
        resultDiv.innerHTML = `Score: ${data[input].score}/100`;
    } else {
        resultDiv.innerHTML = "No data found for this site.";
    }
}