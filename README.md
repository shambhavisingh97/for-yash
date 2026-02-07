# Valentine's Day Website — For You 💕

A personal, one-page site you can send as a link: your partner can read your message, see your trip photos, and play two little games (quiz + memory match).

---

## What you need to do

### 1. Customize the content

Open **`config.js`** and edit:

- **Names** — `yourName` and `theirName` (used in messages/quiz if you refer to them).
- **Gallery photos** — Add your trip photo filenames to the `galleryImages` array. Put the actual image files in the **`photos`** folder (e.g. `trip1.jpg`, `trip2.jpg`).
- **Quiz** — Replace the `quizQuestions` with your own: where you met, favourite things, best trip, inside jokes, “our song”, etc. For each question set `correct` to the index of the right answer (0 = first option, 1 = second, etc.).
- **Memory game** — Optional: add image paths for a custom memory game (e.g. `["pic1.jpg", "pic1.jpg", "pic2.jpg", "pic2.jpg"]`). If you leave it empty, the game uses heart/emoji pairs.

### 2. Customize the text on the page

In **`index.html`** you can change:

- **Hero** — “For You” and the short line under it.
- **Our Story** — The paragraph in the “Our Story” section.
- **Footer** — The closing message at the bottom.

Search for the comments that say `CUSTOMIZE` to find these spots quickly.

---

## How to get a link to send him

To send a **link** (e.g. `https://your-site.netlify.app`), you need to put the site online. Easiest options:

### Option A: Netlify (recommended — no account needed to try)

1. Go to **[netlify.com](https://www.netlify.com)** and sign up (free).
2. Drag and drop your **entire project folder** (the one that contains `index.html`, `styles.css`, `app.js`, `config.js`, and the `photos` folder) onto the Netlify “Deploy” area.
3. Netlify will give you a link like `https://random-name-123.netlify.app`. You can change the name in Site settings → Domain management.
4. Send that link to your boyfriend.

### Option B: GitHub Pages

1. Create a GitHub account if you don’t have one.
2. Create a new repository, upload all the website files (including `photos`).
3. Go to **Settings → Pages** → Source: “Deploy from a branch” → choose `main` and `/ (root)`.
4. After a minute, your site will be at `https://yourusername.github.io/repository-name/`.

### Option C: Run locally only (no link)

- Double-click `index.html` to open it in your browser, or run a simple local server (e.g. `npx serve .` in the project folder). This is good for testing; he can’t open it via a link unless you deploy as above.

---

## Checklist before sending the link

- [ ] Replaced quiz questions and correct answers in `config.js`.
- [ ] Added your “Our Story” and footer text in `index.html`.
- [ ] Added trip photos to the `photos` folder and listed them in `config.js` → `galleryImages`.
- [ ] Deployed the folder to Netlify (or GitHub Pages) and tested the link on your phone.

---

## Is it easy?

- **Building the site:** Already done; you only customize text and photos.
- **Adding photos:** Put files in `photos/` and add their names to `config.js`.
- **Getting a link:** Drag the folder to Netlify (or use GitHub Pages) — usually under 5 minutes.

If you want to change design, add more sections, or more games, you can build on this structure or ask for help with specific changes.

Happy Valentine’s Day 💕
