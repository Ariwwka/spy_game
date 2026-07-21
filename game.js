(function () {
  "use strict";

  var SPY_PROBABILITY = 0.30;

  // ---- State ----
  var characters = [];      // loaded character pool
  var playerCount = 5;      // number of players this round
  var roles = [];           // e.g. ["Batman", "SPY", "Batman", ...]
  var currentPlayer = 0;    // 0-based index of player currently revealing
  var isFlipped = false;    // is the current card showing its face?

  // ---- Element refs ----
  var el = {};
  function $(id) { return document.getElementById(id); }

  // ---- Character loading (JSON file first, JS fallback second) ----
  function loadCharacters() {
    return fetch("characters.json")
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then(function (data) {
        var list = (data && data.characters) ? data.characters : [];
        if (!list.length) throw new Error("empty list");
        characters = list;
      })
      .catch(function () {
        // Fetch fails when opened via file:// — use embedded fallback.
        characters = (window.FALLBACK_CHARACTERS || []).slice();
      });
  }

  // ---- Round generation ----
  function pickCharacter() {
    return characters[Math.floor(Math.random() * characters.length)];
  }

  function generateRoles(count, character) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push(Math.random() < SPY_PROBABILITY ? "SPY" : character);
    }
    return out;
  }

  // ---- Screen navigation ----
  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove("active");
    }
    $(id).classList.add("active");
  }

  // ---- Start a new round ----
  function startRound() {
    var character = pickCharacter();
    roles = generateRoles(playerCount, character);
    currentPlayer = 0;
    setupCurrentPlayer();
    showScreen("screen-reveal");
  }

  // ---- Reveal phase per-player setup ----
  function setupCurrentPlayer() {
    isFlipped = false;
    el.flipCard.classList.remove("flipped");
    el.passLabel.textContent = "Pass the phone to Player " + (currentPlayer + 1);
    el.passLabel.style.visibility = "visible";
    el.revealProgress.textContent = "Player " + (currentPlayer + 1) + " of " + playerCount;
    el.revealActionBtn.textContent = "Reveal Card";
  }

  function revealCard() {
    var role = roles[currentPlayer];
    if (role === "SPY") {
      el.roleText.textContent = "SPY";
      el.roleSub.textContent = "You don't know the character. Blend in!";
      el.flipCard.classList.add("is-spy");
    } else {
      el.roleText.textContent = role;
      el.roleSub.textContent = "This is your character.";
      el.flipCard.classList.remove("is-spy");
    }
    el.flipCard.classList.add("flipped");
    el.passLabel.style.visibility = "hidden";
    isFlipped = true;
    el.revealActionBtn.textContent = "Hide Card";
  }

  function hideCard() {
    el.flipCard.classList.remove("flipped");
    isFlipped = false;
    currentPlayer++;
    if (currentPlayer >= playerCount) {
      // Small delay so the flip-back animation finishes before switching screens.
      setTimeout(function () { showScreen("screen-discuss"); }, 350);
    } else {
      setTimeout(setupCurrentPlayer, 350);
    }
  }

  function onRevealAction() {
    if (!isFlipped) {
      revealCard();
    } else {
      hideCard();
    }
  }

  // ---- Player count stepper ----
  function clampCount(n) {
    if (isNaN(n)) n = 3;
    if (n < 3) n = 3;
    if (n > 20) n = 20;
    return n;
  }

  function syncCountInput() {
    el.playerCount.value = playerCount;
  }

  // ---- Wire up events ----
  function init() {
    el.playerCount = $("playerCount");
    el.minusBtn = $("minusBtn");
    el.plusBtn = $("plusBtn");
    el.startBtn = $("startBtn");
    el.howToBtn = $("howToBtn");
    el.howToModal = $("howToModal");
    el.closeModalBtn = $("closeModalBtn");
    el.passLabel = $("passLabel");
    el.flipCard = $("flipCard");
    el.roleText = $("roleText");
    el.roleSub = $("roleSub");
    el.revealActionBtn = $("revealActionBtn");
    el.revealProgress = $("revealProgress");
    el.newRoundBtn = $("newRoundBtn");
    el.homeBtn = $("homeBtn");

    playerCount = clampCount(parseInt(el.playerCount.value, 10));
    syncCountInput();

    el.minusBtn.addEventListener("click", function () {
      playerCount = clampCount(playerCount - 1);
      syncCountInput();
    });
    el.plusBtn.addEventListener("click", function () {
      playerCount = clampCount(playerCount + 1);
      syncCountInput();
    });
    el.playerCount.addEventListener("change", function () {
      playerCount = clampCount(parseInt(el.playerCount.value, 10));
      syncCountInput();
    });

    el.startBtn.addEventListener("click", startRound);
    el.revealActionBtn.addEventListener("click", onRevealAction);
    el.newRoundBtn.addEventListener("click", startRound);
    el.homeBtn.addEventListener("click", function () { showScreen("screen-home"); });

    el.howToBtn.addEventListener("click", function () {
      el.howToModal.classList.add("open");
    });
    el.closeModalBtn.addEventListener("click", function () {
      el.howToModal.classList.remove("open");
    });
    el.howToModal.addEventListener("click", function (e) {
      if (e.target === el.howToModal) el.howToModal.classList.remove("open");
    });

    loadCharacters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
