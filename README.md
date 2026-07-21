# 🕵️ Spy Card Game

A simple digital party game inspired by Spyfall. One phone, pass it around, find the spies.

At the start of each round the game secretly picks one famous character (Spider-Man, Harry Potter, Elsa, Cristiano Ronaldo…). Most players receive that character — but each player independently has a **30% chance** of becoming a **SPY** instead. Spies don't know the character and must blend in while everyone tries to expose them.

There's no fixed number of spies: a round might have none, one, or several — even all players.

## How to play

1. Open the site, choose the number of players (3–20), tap **Start Game**.
2. Pass the phone to Player 1. They tap **Reveal Card**, look at their role, tap **Hide Card**.
3. Pass to the next player and repeat until everyone has seen their card.
4. When everyone's done, discuss and ask each other questions to find the spies.

## Files

- `index.html` — the app shell / screens
- `styles.css` — bright & playful styling
- `game.js` — game logic (round generation, reveal flow)
- `characters.json` — the character pool (**edit this to add your own**)
- `characters.js` — a fallback copy of the list so the game still works when opened directly from disk

## Adding characters

Open `characters.json` and add names to the `"characters"` list:

```json
{
  "characters": ["Spider-Man", "Batman", "Your New Character"]
}
```

If you plan to open `index.html` directly by double-clicking (rather than hosting it), also add the name to the list in `characters.js`, since browsers block loading JSON files from `file://`. When hosted on GitHub Pages, only `characters.json` matters.

## Publish free on GitHub Pages

1. Push this folder to the `spy_game` repo (see below).
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick the `main` branch and `/ (root)` folder, then **Save**.
4. Wait ~1 minute. Your game will be live at `https://<your-username>.github.io/spy_game/`.

### Pushing updates

```bash
cd /path/to/spy
git add .
git commit -m "Update game"
git push
```

Enjoy! 🎭
