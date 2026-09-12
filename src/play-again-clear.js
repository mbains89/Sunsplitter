// SUN-V036-PLAY-AGAIN-CLEAR-01 — Play Again must not leave a finished slot for Continue.
(function overlayPlayAgainClearFinishedSlot() {
  if (typeof playAgain !== "function") return;
  playAgain = function () {
    if (typeof clearSave === "function") clearSave();
    if (typeof beginFreshCampaign === "function" && beginFreshCampaign({ persist: true })) {
      if (typeof showCinematic === "function") showCinematic("intro");
      return true;
    }
    return false;
  };
})();
