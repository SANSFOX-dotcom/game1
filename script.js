const character      = document.getElementById("character");
const cactusContainer= document.getElementById("cactus-container");
const scoreDisplay   = document.getElementById("score");
const popup          = document.getElementById("popup");
const finalScore     = document.getElementById("final-score");
const countdownEl    = document.getElementById("countdown");

const jumpSound      = document.getElementById("jump-sound");
const hitSound       = document.getElementById("hit-sound");
const startSound     = document.getElementById("start-sound");

let isJumping      = false;
let score          = 0;
let gameInterval   = null;
let spawnInterval  = null;
let isGameRunning  = false;
let cactusList     = [];
let audioUnlocked  = false;

// Fungsi untuk melompat
function jump() {
  if (isJumping || !isGameRunning) return;
  isJumping = true;

  if (audioUnlocked) {
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
  }

  let up = 0;
  const jumpInterval = setInterval(() => {
    if (up >= 200) {
      clearInterval(jumpInterval);
      const downInterval = setInterval(() => {
        if (up <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          up -= 4;
          character.style.bottom = up + "px";
        }
      }, 20);
    } else {
      up += 4;
      character.style.bottom = up + "px";
    }
  }, 20);
}

// Fungsi untuk membuat kaktus baru
function createCactus() {
  const cactus = document.createElement("img");
  cactus.src = "kaktus.png";
  cactus.classList.add("cactus");
  cactus.style.left = "100%";
  cactusContainer.appendChild(cactus);
  cactusList.push(cactus);
}

// Fungsi untuk memulai permainan
function startGame() {
  popup.classList.add("hidden");
  isGameRunning = true;
  score = 0;
  scoreDisplay.textContent = score;
  cactusContainer.innerHTML = "";
  cactusList = [];

  if (gameInterval)  clearInterval(gameInterval);
  if (spawnInterval) clearInterval(spawnInterval);

  let speed = 0.6;

  spawnInterval = setInterval(() => {
    if (isGameRunning) createCactus();
  }, 2500 + Math.random() * 1000);

  gameInterval = setInterval(() => {
    cactusList.forEach((cactus, idx) => {
      let left = parseFloat(cactus.style.left) - speed;
      cactus.style.left = left + "%";

      if (left < -5) {
        cactus.remove();
        cactusList.splice(idx, 1);
        score++;
        scoreDisplay.textContent = score;
        if (score % 5 === 0 && speed < 2.5) speed += 0.1;
      }

      const r1 = character.getBoundingClientRect();
      const r2 = cactus.getBoundingClientRect();
      if (
        r1.right > r2.left &&
        r1.left  < r2.right &&
        r1.bottom> r2.top &&
        r1.top   < r2.bottom
      ) {
        clearInterval(gameInterval);
        clearInterval(spawnInterval);
        isGameRunning = false;
        if (audioUnlocked) {
          hitSound.currentTime = 0;
          hitSound.play().catch(() => {});
        }
        finalScore.textContent = score;
        popup.classList.remove("hidden");
      }
    });
  }, 30);
}

// Fungsi countdown sebelum permainan dimulai
function startCountdown() {
  let count = 3;
  countdownEl.textContent = count;
  countdownEl.classList.remove("hidden");
  popup.classList.add("hidden");
  isGameRunning = false;
  cactusContainer.innerHTML = "";
  cactusList = [];

  if (gameInterval)  clearInterval(gameInterval);
  if (spawnInterval) clearInterval(spawnInterval);

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else if (count === 0) {
      countdownEl.textContent = "MULAI!";
      if (audioUnlocked) {
        startSound.currentTime = 0;
        startSound.play().catch(() => {});
      }
    } else {
      clearInterval(countdownInterval);
      countdownEl.classList.add("hidden");
      startGame();
    }
  }, 1000);
}

// Fungsi restart dari tombol
function restartGame() {
  startCountdown();
}

// Kontrol: lompat via space / klik / tap
document.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});
document.addEventListener("click", jump);
document.addEventListener("touchstart", jump);

// 🔐 Fungsi untuk unlock semua audio
function unlockAudio() {
  return Promise.all(
    [jumpSound, hitSound, startSound].map(sound => {
      sound.volume = 0;
      return sound.play().then(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.volume = 1;
        console.log("✅ Audio unlocked:", sound.id);
      }).catch((e) => {
        console.warn("❌ Gagal unlock:", sound.id, e);
      });
    })
  );
}

// 🚀 Fungsi yang dijalankan saat interaksi pertama (klik/tap pertama)
function firstStart() {
  unlockAudio().then(() => {
    audioUnlocked = true;
    startCountdown();
    document.removeEventListener("click", firstStart);
    document.removeEventListener("touchstart", firstStart);
  });
}

// 📌 Pasang listener klik/tap pertama
document.addEventListener("click", firstStart);
document.addEventListener("touchstart", firstStart);
