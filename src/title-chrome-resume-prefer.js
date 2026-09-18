// SUN-RESUME-POST-HOLD-01 — title Enter/Space prefers Continue when visible.
(function preferResumeOnTitleChrome() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return;
  if (typeof handleTitleChromeKeydown === "function") {
    document.removeEventListener("keydown", handleTitleChromeKeydown);
  }
  handleTitleChromeKeydown = function handleTitleChromeKeydown(event) {
    if (!event || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return false;
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return false;
    if (typeof keyboardTargetIsInteractive === "function" && keyboardTargetIsInteractive(event.target)) return false;
    const game = document.getElementById("game-screen");
    if (game && !game.classList.contains("hidden")) return false;
    const visible = id => { const el = document.getElementById(id); return !!(el && !el.classList.contains("hidden")); };
    if (visible("tone-screen")) {
      if (typeof event.preventDefault === "function") event.preventDefault();
      if (typeof acknowledgeTone === "function") acknowledgeTone();
      return true;
    }
    if (!visible("title-screen")) return false;
    if (visible("commander-create") || visible("new-run-confirm")) return false;
    const resume = document.getElementById("btn-resume");
    if (resume && !resume.classList.contains("hidden")) {
      if (typeof event.preventDefault === "function") event.preventDefault();
      if (typeof resume.click === "function") resume.click();
      return true;
    }
    const begin = document.getElementById("btn-begin");
    if (!begin || begin.classList.contains("hidden")) return false;
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof begin.click === "function") begin.click();
    else if (typeof startGame === "function") startGame();
    return true;
  };
  document.addEventListener("keydown", handleTitleChromeKeydown);
})();
