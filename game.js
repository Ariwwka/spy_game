(function () {
  "use strict";

  var spyProbability = 0.30; // adjustable via the slider on the players screen

  // ---- State ----
  var categories = [];      // [{id, name, characters:[], enabled:bool}]
  var playerCount = 5;      // number of players this round
  var roles = [];           // e.g. ["Batman", "SPY", "Batman", ...]
  var currentPlayer = 0;    // 0-based index of player currently revealing
  var isFlipped = false;    // is the current card showing its face?

  // ---- Element refs ----
  var el = {};
  function $(id) { return document.getElementById(id); }

  // ---- Character loading (JSON file first, JS fallback second) ----
  function loadCategories() {
    return fetch("characters.json")
      .then(function (res) {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then(function (data) {
        var list = (data && data.categories) ? data.categories : [];
        if (!list.length) throw new Error("empty list");
        return list;
      })
      .catch(function () {
        // Fetch fails when opened via file:// — use embedded fallback.
        return (window.FALLBACK_CATEGORIES || []).slice();
      })
      .then(function (list) {
        categories = list.map(function (c) {
          return {
            id: c.id,
            name: c.name,
            characters: (c.characters || []).slice(),
            enabled: true
          };
        });
        renderCategories();
        updatePoolHint();
      });
  }

  // ---- Render category toggles ----
  function renderCategories() {
    el.categoryList.innerHTML = "";
    categories.forEach(function (cat) {
      var row = document.createElement("div");
      row.className = "category-row" + (cat.enabled ? " on" : "");
      row.setAttribute("role", "switch");
      row.setAttribute("aria-checked", cat.enabled ? "true" : "false");

      var left = document.createElement("div");
      left.className = "category-left";
      var name = document.createElement("span");
      name.className = "category-name";
      name.textContent = cat.name;
      var count = document.createElement("span");
      count.className = "category-count";
      count.textContent = cat.characters.length + " characters";
      left.appendChild(name);
      left.appendChild(count);

      var sw = document.createElement("span");
      sw.className = "switch";

      row.appendChild(left);
      row.appendChild(sw);

      row.addEventListener("click", function () {
        cat.enabled = !cat.enabled;
        row.classList.toggle("on", cat.enabled);
        row.setAttribute("aria-checked", cat.enabled ? "true" : "false");
        updatePoolHint();
      });

      el.categoryList.appendChild(row);
    });
  }

  // ---- Build the active character pool from enabled categories ----
  function getPool() {
    var pool = [];
    categories.forEach(function (cat) {
      if (cat.enabled) pool = pool.concat(cat.characters);
    });
    return pool;
  }

  function updatePoolHint() {
    var n = getPool().length;
    if (n === 0) {
      el.poolHint.textContent = "⚠️ Turn on at least one pack to continue.";
      el.toPlayersBtn.disabled = true;
      el.toPlayersBtn.classList.add("disabled");
    } else {
      el.poolHint.textContent = n + " characters selected.";
      el.toPlayersBtn.disabled = false;
      el.toPlayersBtn.classList.remove("disabled");
    }
  }

  // ---- Round generation ----
  function pickCharacter(pool) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function generateRoles(count, character) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push(Math.random() < spyProbability ? "SPY" : character);
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
    var pool = getPool();
    if (!pool.length) { updatePoolHint(); return; }
    var character = pickCharacter(pool);
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
    el.spyProb = $("spyProb");
    el.spyProbValue = $("spyProbValue");
    el.toPlayersBtn = $("toPlayersBtn");
    el.backToPacksBtn = $("backToPacksBtn");
    el.howToBtn = $("howToBtn");
    el.howToModal = $("howToModal");
    el.closeModalBtn = $("closeModalBtn");
    el.categoryList = $("categoryList");
    el.poolHint = $("poolHint");
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

    // Spy probability slider
    spyProbability = parseInt(el.spyProb.value, 10) / 100;
    el.spyProbValue.textContent = el.spyProb.value + "%";
    el.spyProb.addEventListener("input", function () {
      spyProbability = parseInt(el.spyProb.value, 10) / 100;
      el.spyProbValue.textContent = el.spyProb.value + "%";
    });

    // Step 1 -> Step 2
    el.toPlayersBtn.addEventListener("click", function () {
      if (!getPool().length) { updatePoolHint(); return; }
      showScreen("screen-players");
    });
    // Step 2 -> back to Step 1
    el.backToPacksBtn.addEventListener("click", function () { showScreen("screen-home"); });

    el.startBtn.addEventListener("click", startRound);
    el.revealActionBtn.addEventListener("click", onRevealAction);
    el.newRoundBtn.addEventListener("click", startRound);
    el.homeBtn.addEventListener("click", function () { showScreen("screen-home"); });

    // Exit-to-menu buttons (reveal + discussion) return to the main menu
    var exitBtns = document.querySelectorAll("[data-exit]");
    for (var b = 0; b < exitBtns.length; b++) {
      exitBtns[b].addEventListener("click", function () { showScreen("screen-home"); });
    }

    el.howToBtn.addEventListener("click", function () {
      el.howToModal.classList.add("open");
    });
    el.closeModalBtn.addEventListener("click", function () {
      el.howToModal.classList.remove("open");
    });
    el.howToModal.addEventListener("click", function (e) {
      if (e.target === el.howToModal) el.howToModal.classList.remove("open");
    });

    loadCategories();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
