/* SUN-CREW-BOARD-FOLLOW-CLARITY-01 */
(function () {
  if (typeof toggleCrewPanel !== "function") return;
  var previous = toggleCrewPanel;
  var crewBoardOpenPass = false;
  toggleCrewPanel = function () {
    crewBoardOpenPass = true;
    try { previous(); }
    finally { crewBoardOpenPass = false; }
    if (typeof closeCrewSheet === "function") closeCrewSheet();
  };
})();
