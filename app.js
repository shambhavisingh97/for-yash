/* Modal focus trap and restore */
let lastModalTrigger = null;

function getModalFocusables(modal) {
  const sel = "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])";
  return [...modal.querySelectorAll(sel)].filter((el) => el.offsetParent !== null);
}

function trapModalFocus(modal, trigger) {
  lastModalTrigger = trigger || document.activeElement;
  const focusables = getModalFocusables(modal);
  if (focusables.length) focusables[0].focus();
  function onKeydown(e) {
    if (e.key !== "Tab") return;
    const focusables = getModalFocusables(modal);
    if (focusables.length === 0) return;
    const i = focusables.indexOf(document.activeElement);
    if (e.shiftKey) {
      if (i <= 0) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      }
    } else {
      if (i === focusables.length - 1 || i === -1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  }
  modal._focusTrapCleanup = function () {
    modal.removeEventListener("keydown", onKeydown);
    if (lastModalTrigger && lastModalTrigger.focus) lastModalTrigger.focus();
  };
  modal.addEventListener("keydown", onKeydown);
}

function closeModalAndRestoreFocus(modal) {
  if (!modal) return;
  if (modal._focusTrapCleanup) modal._focusTrapCleanup();
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  document.querySelectorAll(".modal[aria-hidden=\"false\"]").forEach((modal) => {
    closeModalAndRestoreFocus(modal);
  });
  const lightbox = document.getElementById("lightbox");
  if (lightbox && lightbox.getAttribute("aria-hidden") === "false") {
    lightbox.setAttribute("aria-hidden", "true");
  }
});

/* Gallery */
const galleryGrid = document.getElementById("galleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function renderGallery() {
  if (!galleryGrid) return;
  const images = CONFIG.galleryImages || [];
  if (images.length === 0) {
    galleryGrid.innerHTML = `
      <div class="gallery-item gallery-placeholder" style="grid-column: 1 / -1;">
        Add your photos to the <strong>photos</strong> folder and list them in <strong>config.js</strong> (galleryImages). For now, enjoy the rest of the page!
      </div>`;
    return;
  }

  galleryGrid.innerHTML = images
    .map(
      (src) => `
    <div class="gallery-item" data-src="photos/${src}">
      <img src="photos/${src}" alt="Our trip" onerror="this.parentElement.innerHTML='<div class=\\'gallery-placeholder\\'>Your photo<br>${src}</div>'">
    </div>`
    )
    .join("");

  galleryGrid.querySelectorAll(".gallery-item").forEach((el) => {
    const img = el.querySelector("img");
    if (!img) return;
    el.addEventListener("click", () => {
      if (!lightboxImg || !lightbox) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = "Our trip";
      lightbox.setAttribute("aria-hidden", "false");
    });
  });
}

if (lightboxClose && lightbox) {
  lightboxClose.addEventListener("click", () => lightbox.setAttribute("aria-hidden", "true"));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.setAttribute("aria-hidden", "true");
  });
}

/* Quiz */
const quizModal = document.getElementById("quizModal");
const quizClose = document.getElementById("quizClose");
const quizContainer = document.getElementById("quizContainer");
const quizResult = document.getElementById("quizResult");
const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const quizScoreText = document.getElementById("quizScoreText");
const quizRestart = document.getElementById("quizRestart");
const quizProgress = document.getElementById("quizProgress");

let quizIndex = 0;
let quizScore = 0;
const questions = CONFIG.quizQuestions || [];

function showQuizQuestion() {
  if (quizIndex >= questions.length) {
    quizContainer.classList.add("hidden");
    quizResult.classList.remove("hidden");
    if (questions.length === 0) {
      quizScoreText.textContent = "No questions yet. (Add some in config.js. Obviously.) 💕";
    } else {
      const pct = Math.round((quizScore / questions.length) * 100);
      quizScoreText.textContent = `You got ${quizScore} out of ${questions.length}! ${pct >= 80 ? "You know us so well! (I'm impressed. A bit.) 💕" : pct >= 50 ? "Not bad. (Barely.) There's room to improve. 💕" : "Yikes. That was rough. Date night to brush up? 💕"}`;
    }
    return;
  }

  const q = questions[quizIndex];
  if (quizProgress) quizProgress.textContent = questions.length ? `Question ${quizIndex + 1} of ${questions.length}` : "";
  quizQuestion.textContent = q.question;
  quizFeedback.textContent = "";
  quizOptions.innerHTML = q.options
    .map(
      (opt, i) =>
        `<button type="button" class="quiz-option" data-index="${i}">${opt}</button>`
    )
    .join("");

  quizOptions.querySelectorAll(".quiz-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chosen = parseInt(btn.dataset.index, 10);
      const correct = q.correct;
      quizOptions.querySelectorAll(".quiz-option").forEach((b) => {
        b.disabled = true;
        if (parseInt(b.dataset.index, 10) === correct) b.classList.add("correct");
        else if (parseInt(b.dataset.index, 10) === chosen && chosen !== correct)
          b.classList.add("wrong");
      });
      if (chosen === correct) {
        quizScore++;
        const rightAnswer = q.options && q.options[correct];
        let correctMsg = "Correct. (Someone was paying attention.) 💕";
        if (rightAnswer === "Nagpur") correctMsg = "You had to remember this one — you were there! 💕";
        else if (q.question.toLowerCase().includes("countries")) correctMsg = "Hmm, good counting. 💕";
        quizFeedback.textContent = correctMsg;
      } else {
        const wrongMsg = q.options && q.options[correct] != null
          ? q.question.toLowerCase().includes("countries")
            ? `Nope. It was: ${q.options[correct]}.`
            : `Nope. It was: ${q.options[correct]}. (Obviously.)`
          : "Nope. (Check config — correct index might be wrong.)";
        quizFeedback.textContent = wrongMsg;
      }
      setTimeout(() => {
        quizIndex++;
        showQuizQuestion();
      }, 1200);
    });
  });
}

function openQuiz(trigger) {
  if (!quizModal) return;
  quizIndex = 0;
  quizScore = 0;
  quizContainer.classList.remove("hidden");
  quizResult.classList.add("hidden");
  if (!quizContainer || !quizResult) return;
  showQuizQuestion();
  quizModal.setAttribute("aria-hidden", "false");
  trapModalFocus(quizModal, trigger);
}

if (quizClose) quizClose.addEventListener("click", () => closeModalAndRestoreFocus(quizModal));
if (quizRestart) quizRestart.addEventListener("click", () => { openQuiz(); });

/* Memory game */
const MEMORY_EMOJIS_POOL = CONFIG.memoryEmojis && CONFIG.memoryEmojis.length >= 8 ? CONFIG.memoryEmojis : ["💕", "🌸", "💝", "🌹", "✨", "💖", "🦋", "💐", "🎀", "🌷", "💒", "🍀", "🌈", "🎈", "🫶", "💌"];
const memoryModal = document.getElementById("memoryModal");
const memoryClose = document.getElementById("memoryClose");
const memoryGrid = document.getElementById("memoryGrid");
const memoryMovesEl = document.getElementById("memoryMoves");
const memoryBestEl = document.getElementById("memoryBest");
const MEMORY_BEST_KEY = "memoryBest";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMemoryGame() {
  const custom = CONFIG.memoryImages && CONFIG.memoryImages.length >= 4;
  let pairs = [];
  if (custom) {
    // Expect [photo1, photo1, photo2, photo2, ...] — each pair has same image twice
    CONFIG.memoryImages.forEach((src, i) => {
      pairs.push({ id: Math.floor(i / 2), type: "img", src });
    });
  } else {
    const shuffled = shuffle([...MEMORY_EMOJIS_POOL]);
    const emojis = shuffled.slice(0, 8);
    emojis.forEach((emoji, i) => {
      pairs.push({ id: i, type: "emoji", value: emoji });
      pairs.push({ id: i, type: "emoji", value: emoji });
    });
  }
  pairs = shuffle(pairs);

  let moves = 0;
  let flipped = [];
  memoryGrid.innerHTML = pairs
    .map(
      (p, idx) => `
    <div class="memory-card" data-index="${idx}" data-id="${p.id}" data-type="${p.type}">
      <span class="memory-card-back">?</span>
      <span class="memory-card-front">
        ${p.type === "emoji" ? p.value : ""}
        ${p.type === "img" ? `<img src="${p.src}" alt="">` : ""}
      </span>
    </div>`
    )
    .join("");

  const cards = memoryGrid.querySelectorAll(".memory-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
      if (flipped.length === 2) return;

      card.classList.add("flipped");
      flipped.push({ el: card, id: card.dataset.id });

      if (flipped.length === 2) {
        moves++;
        memoryMovesEl.textContent = `Moves: ${moves}`;
        if (flipped[0].id === flipped[1].id) {
          flipped.forEach((f) => f.el.classList.add("matched"));
          flipped = [];
          if (memoryGrid.querySelectorAll(".memory-card.matched").length === pairs.length) {
            setTimeout(() => {
              let best = parseInt(sessionStorage.getItem(MEMORY_BEST_KEY) || "0", 10);
              if (moves < best || best === 0) {
                best = moves;
                sessionStorage.setItem(MEMORY_BEST_KEY, String(best));
              }
              memoryMovesEl.textContent = `Made it to love in ${moves} moves. (Not that I was counting.) 💕`;
              if (memoryBestEl) memoryBestEl.textContent = best > 0 ? "Best: " + best + " moves" : "";
            }, 300);
          }
        } else {
          setTimeout(() => {
            flipped.forEach((f) => f.el.classList.remove("flipped"));
            flipped = [];
          }, 700);
        }
      }
    });
  });

  memoryMovesEl.textContent = "Moves: 0";
  const savedBest = sessionStorage.getItem(MEMORY_BEST_KEY);
  if (memoryBestEl) memoryBestEl.textContent = savedBest ? "Best: " + savedBest + " moves" : "";
}

function openMemory(trigger) {
  if (!memoryModal) return;
  buildMemoryGame();
  memoryModal.setAttribute("aria-hidden", "false");
  trapModalFocus(memoryModal, trigger);
}

if (memoryClose) memoryClose.addEventListener("click", () => closeModalAndRestoreFocus(memoryModal));

/* Will you be my Valentine? (game modal) */
const VALENTINE_NO_MESSAGES = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Think again!",
  "Last chance!",
  "Surely not? You might regret this",
  "Give it another thought",
  "Are you absolutely certain?",
  "This could be a mistake",
  "Have a heart",
  "Don't be so cold",
  "Change of heart?",
  "Wouldn't you reconsider?",
  "Is that your final answer?",
  "You are breaking my heart :(",
  "Pretty please?",
  "One more chance?",
  "Just say yes?",
  "I'll keep asking...",
  "You know you want to",
  "The button's right there. Just saying.",
  "Come on...",
  "Yes is such a nice word",
  "Okay, I'm considering it a Yes 💕",
];

const VALENTINE_YES_MAX_SCALE = 2;
const VALENTINE_NO_MIN_SCALE = 0.72;

const valentineModal = document.getElementById("valentineModal");
const valentineClose = document.getElementById("valentineClose");
const valentineAsk = document.getElementById("valentineAsk");
const valentineButtons = document.getElementById("valentineButtons");
const valentineYes = document.getElementById("valentineYes");
const valentineNo = document.getElementById("valentineNo");
const valentineSuccess = document.getElementById("valentineSuccess");
const valentineSuccessText = document.getElementById("valentineSuccessText");

const VALENTINE_SUCCESS_YES = "Yay! So glad you said yes! 💕";
const VALENTINE_SUCCESS_FORCED = "Obv had to force you to this — but I'll take it! 💕";

let valentineNoClicks = 0;

function resetValentineState() {
  valentineNoClicks = 0;
  if (valentineNo) valentineNo.textContent = "No";
  if (valentineYes) valentineYes.style.transform = "scale(1)";
  if (valentineNo) valentineNo.style.transform = "scale(1)";
  if (valentineAsk) valentineAsk.classList.remove("hidden");
  if (valentineButtons) valentineButtons.classList.remove("hidden");
  if (valentineSuccess) valentineSuccess.classList.add("hidden");
  if (valentineSuccessText) valentineSuccessText.textContent = VALENTINE_SUCCESS_YES;
}

function showValentineSuccess(forced) {
  if (!valentineAsk || !valentineSuccess) return;
  if (valentineSuccessText) valentineSuccessText.textContent = forced ? VALENTINE_SUCCESS_FORCED : VALENTINE_SUCCESS_YES;
  valentineAsk.classList.add("hidden");
  valentineSuccess.classList.remove("hidden");
  runConfetti();
}

function runConfetti() {
  const colors = ["#b84a62", "#8b3a4a", "#c9a962", "#e8d5b5", "#d48a9a", "#fdf8f5"];
  const container = document.createElement("div");
  container.className = "confetti-container";
  container.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 55; i++) {
    const p = document.createElement("div");
    p.className = "confetti-particle";
    p.style.left = 50 + (Math.random() - 0.5) * 40 + "%";
    p.style.animationDelay = Math.random() * 0.6 + "s";
    p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    p.style.setProperty("--confetti-rotate", (Math.random() - 0.5) * 720 + "deg");
    p.style.setProperty("--confetti-x", (Math.random() - 0.5) * 200 + "px");
    container.appendChild(p);
  }
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3200);
}

if (valentineYes) {
  valentineYes.addEventListener("click", () => {
    showValentineSuccess(false);
  });
}

if (valentineNo) {
  valentineNo.addEventListener("click", () => {
    valentineNoClicks++;
    const msgIndex = Math.min(valentineNoClicks, VALENTINE_NO_MESSAGES.length - 1);
    valentineNo.textContent = VALENTINE_NO_MESSAGES[msgIndex];

    const yesScale = Math.min(VALENTINE_YES_MAX_SCALE, 1 + valentineNoClicks * 0.08);
    const noScale = Math.max(VALENTINE_NO_MIN_SCALE, 1 - valentineNoClicks * 0.04);
    if (valentineYes) valentineYes.style.transform = `scale(${yesScale})`;
    valentineNo.style.transform = `scale(${noScale})`;

    if (msgIndex === VALENTINE_NO_MESSAGES.length - 1) {
      showValentineSuccess(true);
    }
  });
}

if (valentineClose) valentineClose.addEventListener("click", () => closeModalAndRestoreFocus(valentineModal));

function openValentine(trigger) {
  if (!valentineModal) return;
  resetValentineState();
  valentineModal.setAttribute("aria-hidden", "false");
  trapModalFocus(valentineModal, trigger);
}

/* Mini Golf */
const golfModal = document.getElementById("golfModal");
const golfClose = document.getElementById("golfClose");
const golfCourse = document.getElementById("golfCourse");
const golfBall = document.getElementById("golfBall");
const golfHole = document.getElementById("golfHole");
const golfArrow = document.getElementById("golfArrow");
const golfStrokesEl = document.getElementById("golfStrokes");
const golfWin = document.getElementById("golfWin");
const golfWinText = document.getElementById("golfWinText");
const golfRestart = document.getElementById("golfRestart");
const golfBestText = document.getElementById("golfBestText");
const golfParEl = document.getElementById("golfPar");
const GOLF_PAR = 5;
const GOLF_BEST_KEY = "golfBest";

const GOLF_COURSE_W = 480;
const GOLF_COURSE_H = 320;
const BALL_R = 10;
const HOLE_R = 16;
const FRICTION = 0.98;
const SAND_FRICTION = 0.96;
const HOLE_DIST = 14;
const BOUNCE_DAMP = 0.75;

const GOLF_SAND_TRAP = { x: 180, y: 100, w: 100, h: 70 };

const GOLF_OBSTACLES = [
  { x: 120, y: 80, r: 30, emoji: "💕" },
  { x: 240, y: 220, r: 32, emoji: "🌹" },
  { x: 340, y: 100, r: 28, emoji: "💝" },
  { x: 200, y: 160, r: 28, emoji: "🌸" },
  { x: 360, y: 220, r: 30, emoji: "💖" },
  { x: 280, y: 50, r: 26, emoji: "🌷" },
  { x: 140, y: 220, r: 28, emoji: "💐" },
];

let golfBallX = 50;
let golfBallY = GOLF_COURSE_H / 2;
let golfHoleX = GOLF_COURSE_W - 55;
let golfHoleY = GOLF_COURSE_H * 0.48;
let golfStrokes = 0;
let golfVx = 0, golfVy = 0;
let golfAnimId = null;
let golfDragStart = null;

function setGolfPositions() {
  const px = (x) => (x / GOLF_COURSE_W) * 100;
  const py = (y) => (y / GOLF_COURSE_H) * 100;
  golfBall.style.left = px(golfBallX - BALL_R) + "%";
  golfBall.style.top = py(golfBallY - BALL_R) + "%";
  golfHole.style.left = px(golfHoleX - HOLE_R) + "%";
  golfHole.style.top = py(golfHoleY - HOLE_R) + "%";
}

function golfBounceOffObstacle(obx, oby, obr) {
  const dx = golfBallX - obx;
  const dy = golfBallY - oby;
  const dist = Math.hypot(dx, dy);
  const minDist = obr + BALL_R;
  if (dist < minDist && dist > 0.01) {
    const nx = dx / dist;
    const ny = dy / dist;
    golfBallX = obx + nx * minDist;
    golfBallY = oby + ny * minDist;
    const dot = golfVx * nx + golfVy * ny;
    golfVx = (golfVx - 2 * dot * nx) * BOUNCE_DAMP;
    golfVy = (golfVy - 2 * dot * ny) * BOUNCE_DAMP;
  }
}

function golfTick() {
  golfBallX += golfVx;
  golfBallY += golfVy;
  const inSand = golfBallX >= GOLF_SAND_TRAP.x && golfBallX <= GOLF_SAND_TRAP.x + GOLF_SAND_TRAP.w &&
    golfBallY >= GOLF_SAND_TRAP.y && golfBallY <= GOLF_SAND_TRAP.y + GOLF_SAND_TRAP.h;
  golfVx *= inSand ? SAND_FRICTION : FRICTION;
  golfVy *= inSand ? SAND_FRICTION : FRICTION;
  if (Math.abs(golfVx) < 0.1 && Math.abs(golfVy) < 0.1) golfVx = golfVy = 0;
  if (golfBallX < BALL_R) golfBallX = BALL_R, golfVx *= -0.5;
  if (golfBallY < BALL_R) golfBallY = BALL_R, golfVy *= -0.5;
  if (golfBallX > GOLF_COURSE_W - BALL_R) golfBallX = GOLF_COURSE_W - BALL_R, golfVx *= -0.5;
  if (golfBallY > GOLF_COURSE_H - BALL_R) golfBallY = GOLF_COURSE_H - BALL_R, golfVy *= -0.5;
  GOLF_OBSTACLES.forEach((ob) => golfBounceOffObstacle(ob.x, ob.y, ob.r));
  setGolfPositions();
  const dist = Math.hypot(golfBallX - golfHoleX, golfBallY - golfHoleY);
  if (dist < HOLE_DIST) {
    golfVx = golfVy = 0;
    let best = parseInt(sessionStorage.getItem(GOLF_BEST_KEY) || "0", 10);
    if (golfStrokes < best || best === 0) {
      best = golfStrokes;
      sessionStorage.setItem(GOLF_BEST_KEY, String(best));
    }
    golfWinText.textContent = golfStrokes === 1 ? "Hole in one! (Show-off.) 🏌️‍♀️💕" : "In the hole. (" + golfStrokes + " strokes. I wasn't counting. Okay, I was.) 💕";
    if (golfBestText) golfBestText.textContent = best > 0 ? "Best: " + best + " stroke" + (best === 1 ? "" : "s") : "";
    golfWin.classList.remove("hidden");
    return;
  }
  if (golfVx !== 0 || golfVy !== 0) golfAnimId = requestAnimationFrame(golfTick);
}

const golfObstaclesContainer = document.getElementById("golfObstacles");

function initGolf() {
  golfBallX = 50;
  golfBallY = GOLF_COURSE_H / 2;
  golfHoleX = GOLF_COURSE_W - 55;
  golfHoleY = GOLF_COURSE_H * 0.48;
  golfStrokes = 0;
  golfVx = golfVy = 0;
  golfStrokesEl.textContent = "0";
  if (golfParEl) golfParEl.textContent = String(GOLF_PAR);
  golfWin.classList.add("hidden");
  if (golfBestText) golfBestText.textContent = "";
  hideGolfArrow();
  golfObstaclesContainer.innerHTML = GOLF_OBSTACLES.map(
    (ob) =>
      `<div class="golf-obstacle" style="left:${((ob.x - ob.r) / GOLF_COURSE_W) * 100}%;top:${((ob.y - ob.r) / GOLF_COURSE_H) * 100}%;width:${(ob.r * 2 / GOLF_COURSE_W) * 100}%;height:${(ob.r * 2 / GOLF_COURSE_H) * 100}%;">${ob.emoji}</div>`
  ).join("");
  setGolfPositions();
}

function golfClientToCourse(clientX, clientY) {
  const rect = golfCourse.getBoundingClientRect();
  const scaleX = GOLF_COURSE_W / rect.width;
  const scaleY = GOLF_COURSE_H / rect.height;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function updateGolfArrow(clientX, clientY) {
  if (!golfDragStart || !golfArrow) return;
  const { x, y } = golfClientToCourse(clientX, clientY);
  const dx = golfDragStart.x - x;
  const dy = golfDragStart.y - y;
  const len = Math.hypot(dx, dy);
  if (len < 4) {
    golfArrow.style.display = "none";
    return;
  }
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const arrowLen = Math.min(80, len * 0.8);
  const px = (v) => (v / GOLF_COURSE_W) * 100;
  const py = (v) => (v / GOLF_COURSE_H) * 100;
  golfArrow.style.display = "block";
  golfArrow.style.left = px(golfBallX) + "%";
  golfArrow.style.top = py(golfBallY) + "%";
  golfArrow.style.width = arrowLen + "px";
  golfArrow.style.transformOrigin = "left center";
  golfArrow.style.transform = "translateY(-50%) rotate(" + angle + "deg)";
}

function hideGolfArrow() {
  if (golfArrow) golfArrow.style.display = "none";
}

function startGolfDrag(clientX, clientY) {
  if (Math.abs(golfVx) > 0.1 || Math.abs(golfVy) > 0.1) return;
  const { x, y } = golfClientToCourse(clientX, clientY);
  if (Math.hypot(x - golfBallX, y - golfBallY) > 28) return;
  golfDragStart = { x: golfBallX, y: golfBallY, startX: clientX, startY: clientY };
  hideGolfArrow();
}

function endGolfDrag(clientX, clientY) {
  if (!golfDragStart) return;
  hideGolfArrow();
  const { x, y } = golfClientToCourse(clientX, clientY);
  const dx = golfDragStart.x - x;
  const dy = golfDragStart.y - y;
  golfDragStart = null;
  if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
  const power = 0.12;
  golfVx = dx * power;
  golfVy = dy * power;
  golfStrokes++;
  golfStrokesEl.textContent = golfStrokes;
  if (golfAnimId) cancelAnimationFrame(golfAnimId);
  golfAnimId = requestAnimationFrame(golfTick);
}

golfCourse.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startGolfDrag(e.clientX, e.clientY);
});
golfCourse.addEventListener("mousemove", (e) => {
  if (!golfDragStart) return;
  e.preventDefault();
  updateGolfArrow(e.clientX, e.clientY);
});
golfCourse.addEventListener("mouseup", (e) => {
  e.preventDefault();
  endGolfDrag(e.clientX, e.clientY);
});
golfCourse.addEventListener("mouseleave", () => {
  if (golfDragStart) endGolfDrag(golfDragStart.startX, golfDragStart.startY);
});
golfCourse.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startGolfDrag(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
golfCourse.addEventListener("touchmove", (e) => {
  if (golfDragStart && e.touches[0]) {
    e.preventDefault();
    updateGolfArrow(e.touches[0].clientX, e.touches[0].clientY);
  }
}, { passive: false });
golfCourse.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (e.changedTouches[0]) endGolfDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}, { passive: false });

if (golfRestart) golfRestart.addEventListener("click", () => { initGolf(); });
if (golfClose) golfClose.addEventListener("click", () => closeModalAndRestoreFocus(golfModal));

function openGolf(trigger) {
  if (!golfModal) return;
  initGolf();
  golfModal.setAttribute("aria-hidden", "false");
  trapModalFocus(golfModal, trigger);
}

/* Brick Breaker */
const bricksModal = document.getElementById("bricksModal");
const bricksClose = document.getElementById("bricksClose");
const bricksCanvas = document.getElementById("bricksCanvas");
const bricksScoreEl = document.getElementById("bricksScore");
const bricksWin = document.getElementById("bricksWin");
const bricksLose = document.getElementById("bricksLose");
const bricksRestart = document.getElementById("bricksRestart");
const bricksRestart2 = document.getElementById("bricksRestart2");
const bricksBestText = document.getElementById("bricksBestText");
const BRICKS_BEST_KEY = "bricksBest";

const BRICKS_W = 320;
const BRICKS_H = 400;
const BRICKS_DPR = Math.min(2, window.devicePixelRatio || 1);
const PADDLE_W = 60;
const PADDLE_H = 10;
const BRICKS_BALL_R = 6;
const BRICK_COLS = 8;
const BRICK_ROWS = 4;
const BRICK_PAD = 2;
const BRICKS_VALENTINE_COLORS = ["#b84a62", "#8b3a4a", "#e8d5b5", "#d48a9a", "#c9a962", "#a67c52"];

let bricksCtx, bricksBricks, bricksPaddleX, bricksBallX, bricksBallY, bricksVx, bricksVy;
let bricksScore = 0;
let bricksAnimId = null;
let bricksRunning = false;

function bricksReset() {
  bricksBricks = [];
  const bw = (BRICKS_W - (BRICK_COLS + 1) * BRICK_PAD) / BRICK_COLS;
  const bh = 18;
  const colors = BRICKS_VALENTINE_COLORS;
  for (let row = 0; row < BRICK_ROWS; row++) {
    for (let col = 0; col < BRICK_COLS; col++) {
      bricksBricks.push({
        x: BRICK_PAD + col * (bw + BRICK_PAD),
        y: BRICK_PAD + row * (bh + BRICK_PAD) + 24,
        w: bw,
        h: bh,
        alive: true,
        color: colors[(row + col) % colors.length],
      });
    }
  }
  bricksPaddleX = BRICKS_W / 2 - PADDLE_W / 2;
  bricksBallX = BRICKS_W / 2;
  bricksBallY = BRICKS_H - 50;
  bricksVx = 2.8;
  bricksVy = -5.5;
  bricksScore = 0;
  bricksScoreEl.textContent = "0";
  bricksWin.classList.add("hidden");
  bricksLose.classList.add("hidden");
}

function drawHeart(ctx, x, y, w, h) {
  const size = Math.min(w, h);
  const ox = (w - size) / 2;
  const oy = (h - size) / 2;
  const sx = x + ox;
  const sy = y + oy;
  const topCurve = size * 0.28;
  ctx.moveTo(sx + size / 2, sy + size - topCurve);
  ctx.bezierCurveTo(sx, sy + size - topCurve, sx, sy, sx + size / 2, sy + topCurve);
  ctx.bezierCurveTo(sx + size, sy, sx + size, sy + size - topCurve, sx + size / 2, sy + size - topCurve);
  ctx.fill();
}

function bricksDraw() {
  if (!bricksCtx) return;
  bricksCtx.fillStyle = "#f5ebe6";
  bricksCtx.fillRect(0, 0, BRICKS_W, BRICKS_H);
  bricksCtx.fillStyle = "#8b3a4a";
  const py = BRICKS_H - PADDLE_H - 8;
  const r = 5;
  if (bricksCtx.roundRect) {
    bricksCtx.beginPath();
    bricksCtx.roundRect(bricksPaddleX, py, PADDLE_W, PADDLE_H, r);
    bricksCtx.fill();
  } else {
    bricksCtx.fillRect(bricksPaddleX, py, PADDLE_W, PADDLE_H);
  }
  bricksCtx.beginPath();
  bricksCtx.arc(bricksBallX, bricksBallY, BRICKS_BALL_R, 0, Math.PI * 2);
  bricksCtx.fillStyle = "#b84a62";
  bricksCtx.fill();
  bricksBricks.forEach((b) => {
    if (!b.alive) return;
    bricksCtx.fillStyle = b.color;
    bricksCtx.beginPath();
    drawHeart(bricksCtx, b.x, b.y, b.w, b.h);
  });
}

function bricksTick() {
  if (!bricksRunning) return;
  bricksBallX += bricksVx;
  bricksBallY += bricksVy;
  if (bricksBallX - BRICKS_BALL_R < 0) bricksBallX = BRICKS_BALL_R, bricksVx = -bricksVx;
  if (bricksBallX + BRICKS_BALL_R > BRICKS_W) bricksBallX = BRICKS_W - BRICKS_BALL_R, bricksVx = -bricksVx;
  if (bricksBallY - BRICKS_BALL_R < 0) bricksBallY = BRICKS_BALL_R, bricksVy = -bricksVy;
  if (bricksBallY + BRICKS_BALL_R > BRICKS_H) {
    bricksRunning = false;
    bricksLose.classList.remove("hidden");
    return;
  }
  const paddleY = BRICKS_H - PADDLE_H - 8;
  if (bricksVy > 0 && bricksBallY + BRICKS_BALL_R >= paddleY && bricksBallY - BRICKS_BALL_R <= paddleY + PADDLE_H &&
      bricksBallX >= bricksPaddleX && bricksBallX <= bricksPaddleX + PADDLE_W) {
    bricksBallY = paddleY - BRICKS_BALL_R;
    bricksVy = -Math.abs(bricksVy);
    const hit = (bricksBallX - (bricksPaddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
    bricksVx = hit * 4;
  }
  bricksBricks.forEach((b) => {
    if (!b.alive) return;
    if (bricksBallX + BRICKS_BALL_R >= b.x && bricksBallX - BRICKS_BALL_R <= b.x + b.w &&
        bricksBallY + BRICKS_BALL_R >= b.y && bricksBallY - BRICKS_BALL_R <= b.y + b.h) {
      b.alive = false;
      bricksScore += 10;
      bricksScoreEl.textContent = bricksScore;
      if (bricksBallX < b.x || bricksBallX > b.x + b.w) bricksVx = -bricksVx;
      else bricksVy = -bricksVy;
    }
  });
  const alive = bricksBricks.filter((b) => b.alive).length;
  if (alive === 0) {
    bricksRunning = false;
    let best = parseInt(sessionStorage.getItem(BRICKS_BEST_KEY) || "0", 10);
    if (bricksScore > best) {
      best = bricksScore;
      sessionStorage.setItem(BRICKS_BEST_KEY, String(best));
    }
    if (bricksBestText) bricksBestText.textContent = best > 0 ? "Best: " + best : "";
    bricksWin.classList.remove("hidden");
    return;
  }
  bricksDraw();
  bricksAnimId = requestAnimationFrame(bricksTick);
}

function bricksStart() {
  bricksRunning = true;
  bricksTick();
}

function initBricks() {
  bricksReset();
  bricksCtx = bricksCanvas.getContext("2d");
  bricksCanvas.width = BRICKS_W * BRICKS_DPR;
  bricksCanvas.height = BRICKS_H * BRICKS_DPR;
  bricksCtx.setTransform(BRICKS_DPR, 0, 0, BRICKS_DPR, 0, 0);
  bricksDraw();
  bricksRunning = true;
  if (bricksAnimId) cancelAnimationFrame(bricksAnimId);
  bricksAnimId = requestAnimationFrame(bricksTick);
}

bricksCanvas.addEventListener("mousemove", (e) => {
  const rect = bricksCanvas.getBoundingClientRect();
  const scale = BRICKS_W / rect.width;
  bricksPaddleX = (e.clientX - rect.left) * scale - PADDLE_W / 2;
  bricksPaddleX = Math.max(0, Math.min(BRICKS_W - PADDLE_W, bricksPaddleX));
});
bricksCanvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const rect = bricksCanvas.getBoundingClientRect();
  const scale = BRICKS_W / rect.width;
  bricksPaddleX = (e.touches[0].clientX - rect.left) * scale - PADDLE_W / 2;
  bricksPaddleX = Math.max(0, Math.min(BRICKS_W - PADDLE_W, bricksPaddleX));
}, { passive: false });

if (bricksRestart) bricksRestart.addEventListener("click", () => { initBricks(); });
if (bricksRestart2) bricksRestart2.addEventListener("click", () => { initBricks(); });
if (bricksClose) bricksClose.addEventListener("click", () => {
  bricksRunning = false;
  if (bricksAnimId) cancelAnimationFrame(bricksAnimId);
  closeModalAndRestoreFocus(bricksModal);
});

function openBricks(trigger) {
  if (!bricksModal) return;
  initBricks();
  bricksModal.setAttribute("aria-hidden", "false");
  trapModalFocus(bricksModal, trigger);
}

/* Heart catch */
const HEARTCATCH_EMOJIS = ["💕", "💗", "💖", "❤️", "💝"];
const HEARTCATCH_SPAWN_INTERVAL = 800;
const HEARTCATCH_FALL_SPEED = 2.9;
const HEARTCATCH_AREA_HEIGHT = 360;
const HEARTCATCH_DURATION_SEC = 60;

const heartcatchModal = document.getElementById("heartcatchModal");
const heartcatchClose = document.getElementById("heartcatchClose");
const heartcatchArea = document.getElementById("heartcatchArea");
const heartcatchHearts = document.getElementById("heartcatchHearts");
const heartcatchScoreEl = document.getElementById("heartcatchScore");
const heartcatchTimerEl = document.getElementById("heartcatchTimer");
const heartcatchRestart = document.getElementById("heartcatchRestart");
const heartcatchPlayWrap = document.getElementById("heartcatchPlayWrap");
const heartcatchResult = document.getElementById("heartcatchResult");
const heartcatchResultText = document.getElementById("heartcatchResultText");
const heartcatchBestText = document.getElementById("heartcatchBestText");

let heartcatchScore = 0;
let heartcatchSpawnTimer = null;
let heartcatchAnimId = null;
let heartcatchTimerId = null;
let heartcatchHeartsList = [];
let heartcatchTimeLeft = HEARTCATCH_DURATION_SEC;

function heartcatchTick() {
  if (!heartcatchHearts || !heartcatchArea) return;
  const areaRect = heartcatchArea.getBoundingClientRect();
  const toRemove = [];
  heartcatchHeartsList.forEach((h) => {
    h.top += HEARTCATCH_FALL_SPEED;
    h.el.style.top = h.top + "px";
    if (h.top > HEARTCATCH_AREA_HEIGHT - 40) toRemove.push(h);
  });
  toRemove.forEach((h) => {
    h.el.remove();
    heartcatchHeartsList = heartcatchHeartsList.filter((x) => x !== h);
  });
  heartcatchAnimId = requestAnimationFrame(heartcatchTick);
}

function heartcatchSpawn() {
  if (!heartcatchHearts) return;
  const heart = document.createElement("div");
  heart.className = "heart-catch-heart";
  heart.textContent = HEARTCATCH_EMOJIS[Math.floor(Math.random() * HEARTCATCH_EMOJIS.length)];
  heart.style.left = 10 + Math.random() * 80 + "%";
  heart.style.top = "0px";
  heartcatchHearts.appendChild(heart);
  heartcatchHeartsList.push({ el: heart, top: 0 });
}

function heartcatchOnClick(e) {
  const clientX = e.clientX != null ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY != null ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
  const target = e.target;
  if (target.classList.contains("heart-catch-heart")) {
    e.preventDefault();
    e.stopPropagation();
    heartcatchHeartsList = heartcatchHeartsList.filter((h) => h.el !== target);
    target.remove();
    heartcatchScore++;
    if (heartcatchScoreEl) heartcatchScoreEl.textContent = heartcatchScore;
    return;
  }
  for (let i = heartcatchHeartsList.length - 1; i >= 0; i--) {
    const h = heartcatchHeartsList[i];
    const rect = h.el.getBoundingClientRect();
    const padding = 15;
    if (clientX >= rect.left - padding && clientX <= rect.right + padding && clientY >= rect.top - padding && clientY <= rect.bottom + padding) {
      e.preventDefault();
      e.stopPropagation();
      heartcatchHeartsList.splice(i, 1);
      h.el.remove();
      heartcatchScore++;
      if (heartcatchScoreEl) heartcatchScoreEl.textContent = heartcatchScore;
      return;
    }
  }
}

function stopHeartcatch() {
  if (heartcatchSpawnTimer) clearInterval(heartcatchSpawnTimer);
  heartcatchSpawnTimer = null;
  if (heartcatchTimerId) clearInterval(heartcatchTimerId);
  heartcatchTimerId = null;
  if (heartcatchAnimId) cancelAnimationFrame(heartcatchAnimId);
  heartcatchAnimId = null;
  heartcatchHeartsList.forEach((h) => h.el.remove());
  heartcatchHeartsList = [];
}

const HEARTCATCH_BEST_KEY = "heartcatchBest";

function heartcatchEndGame() {
  stopHeartcatch();
  if (heartcatchPlayWrap) heartcatchPlayWrap.classList.add("hidden");
  let best = parseInt(sessionStorage.getItem(HEARTCATCH_BEST_KEY) || "0", 10);
  if (heartcatchScore > best) {
    best = heartcatchScore;
    sessionStorage.setItem(HEARTCATCH_BEST_KEY, String(best));
  }
  if (heartcatchResult && heartcatchResultText) {
    const x = heartcatchScore;
    let msg;
    if (x >= 40) {
      const opts = ["Okay, show-off. 💕", "Who asked you to show off? 💕", "(We're almost impressed. Almost.) 💕"];
      msg = "You caught " + x + " hearts. " + opts[Math.floor(Math.random() * opts.length)];
    } else if (x >= 25) {
      const opts = ["Not bad. (We're still not impressed.) 💕", "Decent. (Barely.) 💕", "Could've been worse. 💕"];
      msg = "You caught " + x + " hearts. " + opts[Math.floor(Math.random() * opts.length)];
    } else if (x >= 15) {
      const opts = ["They were literally falling for you. 💕", "In a whole minute. (Yikes.) 💕", "The bar was on the floor. 💕"];
      msg = "Only " + x + " hearts? " + opts[Math.floor(Math.random() * opts.length)];
    } else {
      const opts = ["In a whole minute. (We're not judging. Much.) 💕", "Really? A whole minute. 💕", "(We're judging a little.) 💕", "The hearts were literally falling into your lap. 💕"];
      msg = "You could catch only " + x + " heart" + (x === 1 ? "" : "s") + ". " + opts[Math.floor(Math.random() * opts.length)];
    }
    heartcatchResultText.textContent = msg;
    if (heartcatchBestText) heartcatchBestText.textContent = best > 0 ? "Best: " + best + " hearts" : "";
    heartcatchResult.classList.remove("hidden");
  }
}

function openHeartcatch(trigger) {
  if (!heartcatchModal || !heartcatchArea || !heartcatchHearts) return;
  stopHeartcatch();
  heartcatchScore = 0;
  heartcatchTimeLeft = HEARTCATCH_DURATION_SEC;
  if (heartcatchScoreEl) heartcatchScoreEl.textContent = "0";
  if (heartcatchTimerEl) heartcatchTimerEl.textContent = "1:00";
  if (heartcatchPlayWrap) heartcatchPlayWrap.classList.remove("hidden");
  if (heartcatchResult) heartcatchResult.classList.add("hidden");
  heartcatchModal.setAttribute("aria-hidden", "false");
  trapModalFocus(heartcatchModal, trigger);
  heartcatchSpawnTimer = setInterval(heartcatchSpawn, HEARTCATCH_SPAWN_INTERVAL);
  heartcatchSpawn();
  heartcatchSpawn();
  heartcatchAnimId = requestAnimationFrame(heartcatchTick);
  heartcatchTimerId = setInterval(function () {
    heartcatchTimeLeft--;
    if (heartcatchTimerEl) {
      const m = Math.floor(heartcatchTimeLeft / 60);
      const s = heartcatchTimeLeft % 60;
      heartcatchTimerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
    }
    if (heartcatchTimeLeft <= 0) {
      heartcatchEndGame();
    }
  }, 1000);
}

if (heartcatchArea) {
  heartcatchArea.addEventListener("click", heartcatchOnClick);
  heartcatchArea.addEventListener("touchend", function (e) {
    if (e.changedTouches && e.changedTouches[0]) {
      const fake = { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY, target: e.target, preventDefault: () => {}, stopPropagation: () => {} };
      heartcatchOnClick(fake);
    }
  }, { passive: true });
}
if (heartcatchClose) heartcatchClose.addEventListener("click", () => {
  stopHeartcatch();
  closeModalAndRestoreFocus(heartcatchModal);
});
if (heartcatchRestart) heartcatchRestart.addEventListener("click", () => openHeartcatch(null));

/* Game buttons: use event delegation on games section */
function initGameButtons() {
  var gamesSection = document.getElementById("games");
  if (!gamesSection) return;
  gamesSection.addEventListener("click", function (e) {
    var btn = e.target.closest(".game-btn");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var game = btn.getAttribute("data-game");
    if (game === "quiz") openQuiz(btn);
    else if (game === "memory") openMemory(btn);
    else if (game === "golf") openGolf(btn);
    else if (game === "bricks") openBricks(btn);
    else if (game === "heartcatch") openHeartcatch(btn);
    else if (game === "valentine") openValentine(btn);
  });
}

/* Sweet letter (envelope → popup) */
const letterModal = document.getElementById("letterModal");
const letterClose = document.getElementById("letterClose");
const envelopeBtn = document.getElementById("envelopeBtn");
const letterContentEl = document.getElementById("letterContent");

function formatLetterHtml(text) {
  const raw = (text || "").trim();
  if (!raw) return "";
  const paragraphs = raw.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return paragraphs
    .map((para, i) => {
      const cls = i === 0 ? "letter-greeting" : i === paragraphs.length - 1 ? "letter-signoff" : "";
      const escaped = para.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      return cls ? `<p class="${cls}">${escaped}</p>` : `<p>${escaped}</p>`;
    })
    .join("");
}

function openLetter(trigger) {
  if (!letterModal || !letterContentEl) return;
  const text = (typeof CONFIG !== "undefined" && CONFIG.letterContent) ? CONFIG.letterContent : "To you,\n\nSomething sweet goes here. Edit CONFIG.letterContent in config.js.\n\n💕";
  letterContentEl.innerHTML = formatLetterHtml(text);
  letterModal.setAttribute("aria-hidden", "false");
  trapModalFocus(letterModal, trigger);
}

function closeLetter() {
  if (!letterModal) return;
  closeModalAndRestoreFocus(letterModal);
}

if (envelopeBtn) envelopeBtn.addEventListener("click", function () { openLetter(this); });
if (letterClose) letterClose.addEventListener("click", closeLetter);
if (letterModal) letterModal.addEventListener("click", function (e) { if (e.target === letterModal) closeLetter(); });

/* Easter egg: 5 clicks on hero title */
const heroTitle = document.getElementById("heroTitle");
if (heroTitle) {
  let heroClicks = 0;
  let heroClickTimer = null;
  heroTitle.addEventListener("click", function () {
    heroClicks++;
    if (heroClickTimer) clearTimeout(heroClickTimer);
    heroClickTimer = setTimeout(() => { heroClicks = 0; }, 1200);
    if (heroClicks >= 5) {
      heroClicks = 0;
      const toast = document.createElement("div");
      toast.className = "easter-egg-toast";
      toast.textContent = "Okay, we get it. You're cute. 💕";
      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add("easter-egg-toast--show"));
      setTimeout(() => {
        toast.classList.remove("easter-egg-toast--show");
        setTimeout(() => toast.remove(), 350);
      }, 2500);
    }
  });
}

/* Init when DOM is ready */
function init() {
  if (typeof history !== "undefined" && history.scrollRestoration) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  renderGallery();
  initGameButtons();
  const letterPrint = document.getElementById("letterPrint");
  if (letterPrint && typeof CONFIG !== "undefined" && CONFIG.letterContent) {
    letterPrint.innerHTML = formatLetterHtml(CONFIG.letterContent);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
