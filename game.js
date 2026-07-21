(function () {
  "use strict";

  // ===================== TRANSLATIONS =====================
  var I18N = {
    en: {
      brand: "Spy Game",
      title: "Spy Card Game",
      tagline: "Find the spies hiding among you.",
      choosePacks: "Choose character packs",
      continue: "Continue",
      howToPlay: "How to play",
      playersTitle: "Players",
      playersTag: "How many are playing?",
      playersHint: "Best with 3–12+ players. You'll pass one phone around.",
      spyChance: "Spy chance per player:",
      spyChanceHint: "Each player independently has this chance of being a spy. Higher = more spies.",
      start: "Start Game",
      back: "← Back to character packs",
      menu: "✕ Menu",
      tapReveal: "Tap to reveal",
      reveal: "Reveal Card",
      hide: "Hide Card",
      spy: "SPY",
      roleSubSpy: "You don't know the character. Blend in!",
      roleSubChar: "This is your character.",
      discussTitle: "Everyone has seen their role.",
      discussText: "Start discussing! Ask each other questions about the character. Spies — blend in. Everyone else — expose the spies.",
      newRound: "New Round",
      exitMenu: "Exit to main menu",
      howTitle: "How to play",
      how1: "Choose which <strong>character packs</strong> to include, then tap Continue.",
      how2: "Pick the number of players and tap <strong>Start Game</strong>.",
      how3: "The game secretly picks one character. Most players get that character — some randomly become a <strong>SPY</strong>.",
      how4: "Pass the phone around. Each player privately reveals their card, then hides it.",
      how5: "Spies only see the word <strong>SPY</strong> — they don't know the character!",
      how6: "Discuss and ask questions to find the spies. Spies try to blend in.",
      howNote: "There's no fixed number of spies — a round might have none, one, or many. Each player has an adjustable chance of being a spy. You can tap ✕ Menu anytime to start over.",
      gotIt: "Got it",
      passTo: "Pass the phone to Player {n}",
      progress: "Player {n} of {m}",
      poolSelected: "{n} characters selected.",
      poolEmpty: "⚠️ Turn on at least one pack to continue.",
      charCount: "{n} characters"
    },
    ru: {
      brand: "Шпион",
      title: "Игра «Шпион»",
      tagline: "Найди шпионов среди своих.",
      choosePacks: "Выбери наборы персонажей",
      continue: "Продолжить",
      howToPlay: "Как играть",
      playersTitle: "Игроки",
      playersTag: "Сколько человек играет?",
      playersHint: "Лучше всего для 3–12+ игроков. Передавайте один телефон по кругу.",
      spyChance: "Шанс стать шпионом:",
      spyChanceHint: "У каждого игрока независимо есть такой шанс стать шпионом. Больше — больше шпионов.",
      start: "Начать игру",
      back: "← Назад к наборам",
      menu: "✕ Меню",
      tapReveal: "Нажми, чтобы открыть",
      reveal: "Открыть карту",
      hide: "Скрыть карту",
      spy: "ШПИОН",
      roleSubSpy: "Ты не знаешь персонажа. Маскируйся!",
      roleSubChar: "Это твой персонаж.",
      discussTitle: "Все увидели свои роли.",
      discussText: "Начинайте обсуждение! Задавайте друг другу вопросы о персонаже. Шпионы — маскируйтесь. Остальные — вычислите шпионов.",
      newRound: "Новый раунд",
      exitMenu: "Выйти в главное меню",
      howTitle: "Как играть",
      how1: "Выбери, какие <strong>наборы персонажей</strong> включить, затем нажми «Продолжить».",
      how2: "Укажи число игроков и нажми <strong>«Начать игру»</strong>.",
      how3: "Игра тайно выбирает одного персонажа. Большинство получают его — некоторые случайно становятся <strong>ШПИОНАМИ</strong>.",
      how4: "Передавайте телефон по кругу. Каждый игрок тайно смотрит свою карту, затем прячет её.",
      how5: "Шпионы видят только слово <strong>ШПИОН</strong> — они не знают персонажа!",
      how6: "Обсуждайте и задавайте вопросы, чтобы найти шпионов. Шпионы стараются не выдать себя.",
      howNote: "Число шпионов не фиксировано — в раунде их может не быть, быть один или несколько. У каждого игрока настраиваемый шанс стать шпионом. Нажми ✕ Меню в любой момент, чтобы начать заново.",
      gotIt: "Понятно",
      passTo: "Передай телефон игроку {n}",
      progress: "Игрок {n} из {m}",
      poolSelected: "Выбрано персонажей: {n}.",
      poolEmpty: "⚠️ Включи хотя бы один набор, чтобы продолжить.",
      charCount: "{n} персонажей"
    }
  };

  function t(key) {
    var pack = I18N[lang] || I18N.en;
    return pack[key] != null ? pack[key] : (I18N.en[key] != null ? I18N.en[key] : key);
  }
  function fmt(str, map) {
    return str.replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : "{" + k + "}"; });
  }

  // ===================== STATE =====================
  var lang = "en";
  var spyProbability = 0.30;
  var categories = [];
  var playerCount = 5;
  var roles = [];
  var currentPlayer = 0;
  var isFlipped = false;
  var shownRole = null; // role currently displayed on the card, or null

  var el = {};
  function $(id) { return document.getElementById(id); }

  // ===================== LANGUAGE =====================
  function loadLang() {
    try {
      var saved = window.localStorage.getItem("spyLang");
      if (saved === "en" || saved === "ru") lang = saved;
    } catch (e) { /* localStorage unavailable — default to en */ }
  }
  function saveLang() {
    try { window.localStorage.setItem("spyLang", lang); } catch (e) {}
  }
  function setLang(newLang) {
    lang = (newLang === "ru") ? "ru" : "en";
    saveLang();
    applyLang();
  }
  function applyLang() {
    document.documentElement.setAttribute("lang", lang);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
    var html = document.querySelectorAll("[data-i18n-html]");
    for (var j = 0; j < html.length; j++) {
      html[j].innerHTML = t(html[j].getAttribute("data-i18n-html"));
    }

    // active button state
    var btns = document.querySelectorAll(".lang-btn");
    for (var b = 0; b < btns.length; b++) {
      btns[b].classList.toggle("active", btns[b].getAttribute("data-lang") === lang);
    }

    // refresh dynamic strings
    renderCategories();
    updatePoolHint();
    refreshRevealTexts();
  }

  // ===================== CHARACTER DATA =====================
  function loadCategories() {
    return fetch("characters.json")
      .then(function (res) { if (!res.ok) throw new Error("bad"); return res.json(); })
      .then(function (data) {
        var list = (data && data.categories) ? data.categories : [];
        if (!list.length) throw new Error("empty");
        return list;
      })
      .catch(function () { return (window.FALLBACK_CATEGORIES || []).slice(); })
      .then(function (list) {
        categories = list.map(function (c) {
          return { id: c.id, name: c.name, characters: (c.characters || []).slice(), enabled: true };
        });
        renderCategories();
        updatePoolHint();
      });
  }

  function renderCategories() {
    if (!el.categoryList) return;
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
      count.textContent = fmt(t("charCount"), { n: cat.characters.length });
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

  function getPool() {
    var pool = [];
    categories.forEach(function (cat) { if (cat.enabled) pool = pool.concat(cat.characters); });
    return pool;
  }

  function updatePoolHint() {
    if (!el.poolHint) return;
    var n = getPool().length;
    if (n === 0) {
      el.poolHint.textContent = t("poolEmpty");
      el.toPlayersBtn.disabled = true;
      el.toPlayersBtn.classList.add("disabled");
    } else {
      el.poolHint.textContent = fmt(t("poolSelected"), { n: n });
      el.toPlayersBtn.disabled = false;
      el.toPlayersBtn.classList.remove("disabled");
    }
  }

  // ===================== ROUND =====================
  function pickCharacter(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

  function generateRoles(count, character) {
    var out = [];
    for (var i = 0; i < count; i++) {
      out.push(Math.random() < spyProbability ? "SPY" : character);
    }
    return out;
  }

  function showScreen(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    $(id).classList.add("active");
  }

  function startRound() {
    var pool = getPool();
    if (!pool.length) { updatePoolHint(); return; }
    var character = pickCharacter(pool);
    roles = generateRoles(playerCount, character);
    currentPlayer = 0;
    setupCurrentPlayer();
    showScreen("screen-reveal");
  }

  // ===================== REVEAL =====================
  function setupCurrentPlayer() {
    isFlipped = false;
    shownRole = null;
    el.flipCard.classList.remove("flipped");
    el.passLabel.style.visibility = "visible";
    refreshRevealTexts();
  }

  // Re-applies all reveal-screen text for the current language + state
  function refreshRevealTexts() {
    if (!el.passLabel) return;
    el.passLabel.textContent = fmt(t("passTo"), { n: currentPlayer + 1 });
    el.revealProgress.textContent = fmt(t("progress"), { n: currentPlayer + 1, m: playerCount });
    el.revealActionBtn.textContent = isFlipped ? t("hide") : t("reveal");
    if (isFlipped && shownRole != null) {
      if (shownRole === "SPY") {
        el.roleText.textContent = t("spy");
        el.roleSub.textContent = t("roleSubSpy");
      } else {
        el.roleText.textContent = shownRole;
        el.roleSub.textContent = t("roleSubChar");
      }
    }
  }

  function revealCard() {
    shownRole = roles[currentPlayer];
    if (shownRole === "SPY") {
      el.roleText.textContent = t("spy");
      el.roleSub.textContent = t("roleSubSpy");
      el.flipCard.classList.add("is-spy");
    } else {
      el.roleText.textContent = shownRole;
      el.roleSub.textContent = t("roleSubChar");
      el.flipCard.classList.remove("is-spy");
    }
    el.flipCard.classList.add("flipped");
    el.passLabel.style.visibility = "hidden";
    isFlipped = true;
    el.revealActionBtn.textContent = t("hide");
  }

  function hideCard() {
    el.flipCard.classList.remove("flipped");
    isFlipped = false;
    shownRole = null;
    currentPlayer++;
    if (currentPlayer >= playerCount) {
      setTimeout(function () { showScreen("screen-discuss"); }, 350);
    } else {
      setTimeout(setupCurrentPlayer, 350);
    }
  }

  function onRevealAction() { if (!isFlipped) revealCard(); else hideCard(); }

  // ===================== PLAYER COUNT =====================
  function clampCount(n) {
    if (isNaN(n)) n = 3;
    if (n < 3) n = 3;
    if (n > 20) n = 20;
    return n;
  }
  function syncCountInput() { el.playerCount.value = playerCount; }

  // ===================== INIT =====================
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

    el.minusBtn.addEventListener("click", function () { playerCount = clampCount(playerCount - 1); syncCountInput(); });
    el.plusBtn.addEventListener("click", function () { playerCount = clampCount(playerCount + 1); syncCountInput(); });
    el.playerCount.addEventListener("change", function () { playerCount = clampCount(parseInt(el.playerCount.value, 10)); syncCountInput(); });

    // Spy probability slider
    spyProbability = parseInt(el.spyProb.value, 10) / 100;
    el.spyProbValue.textContent = el.spyProb.value + "%";
    el.spyProb.addEventListener("input", function () {
      spyProbability = parseInt(el.spyProb.value, 10) / 100;
      el.spyProbValue.textContent = el.spyProb.value + "%";
    });

    // Navigation
    el.toPlayersBtn.addEventListener("click", function () {
      if (!getPool().length) { updatePoolHint(); return; }
      showScreen("screen-players");
    });
    el.backToPacksBtn.addEventListener("click", function () { showScreen("screen-home"); });
    el.startBtn.addEventListener("click", startRound);
    el.revealActionBtn.addEventListener("click", onRevealAction);
    el.newRoundBtn.addEventListener("click", startRound);
    el.homeBtn.addEventListener("click", function () { showScreen("screen-home"); });

    var exitBtns = document.querySelectorAll("[data-exit]");
    for (var b = 0; b < exitBtns.length; b++) {
      exitBtns[b].addEventListener("click", function () { showScreen("screen-home"); });
    }

    // How-to modal
    el.howToBtn.addEventListener("click", function () { el.howToModal.classList.add("open"); });
    el.closeModalBtn.addEventListener("click", function () { el.howToModal.classList.remove("open"); });
    el.howToModal.addEventListener("click", function (e) { if (e.target === el.howToModal) el.howToModal.classList.remove("open"); });

    // Language switch
    var langBtns = document.querySelectorAll(".lang-btn");
    for (var L = 0; L < langBtns.length; L++) {
      langBtns[L].addEventListener("click", function () { setLang(this.getAttribute("data-lang")); });
    }

    loadLang();
    applyLang();
    loadCategories();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
