const data = {
  "cnn.com": { score: 78 },
  "foxnews.com": { score: 65 },
  "nytimes.com": { score: 85 }
};

function searchSite() {
  const input = document.getElementById("searchInput").value.toLowerCase().trim();
  const resultDiv = document.getElementById("result");

  if (data[input]) {
    resultDiv.textContent = `Score: ${data[input].score}/100`;
  } else {
    resultDiv.textContent = "No data found for this site.";
  }
}

document.getElementById("searchBtn").addEventListener("click", searchSite);

document.getElementById("searchInput").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchSite();
  }
});