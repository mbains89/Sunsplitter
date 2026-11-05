(function showReviewBuildStamp() {
  var node = document.getElementById("review-build-stamp");
  if (!node || !node.classList.contains("hidden")) return;
  fetch("PRIVATE_PACKAGE_MANIFEST.json", { cache: "no-store" }).then(function (response) {
    if (!response.ok) return null;
    return response.json();
  }).then(function (manifest) {
    if (!manifest || typeof manifest.sourceCommit !== "string" || !/^[0-9a-f]{40}$/.test(manifest.sourceCommit)) return;
    node.textContent = "Private review build \u00b7 " + manifest.sourceCommit.slice(0, 8);
    node.classList.remove("hidden");
  }).catch(function () {});
})();
