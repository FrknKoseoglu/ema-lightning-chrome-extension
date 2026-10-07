// EMA Lightning - Streaming Audio Player
let currentCard = null;
let audioQueue = [];
let isAudioPlaying = false;
let currentHtmlAudio = null;
let timerInterval = null;
let elapsedSeconds = 0;
let estimatedDuration = 10;
let isStreamFinished = false;
let isMinimized = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PREPARE_SELECTION") {
    const sel = window.getSelection();
    sendResponse({ text: sel ? sel.toString().trim() : "" });
  } else if (request.action === "GET_PAGE_TEXT") {
    const text = extractPageText();
    sendResponse({ text: text });
  } else if (request.action === "SHOW_LOADING") {
    stopPlayback();
    estimatedDuration = Math.max(5, Math.round((request.textLength || 100) / 14));
    renderPlayerCard("Tamponlanıyor (Yerel Model)...");
    updateTimeDisplay(0, estimatedDuration);
    sendResponse({ ok: true });
  } else if (request.action === "RECEIVE_CHUNK") {
    handleIncomingChunk(request.audio_base64, request.duration);
    sendResponse({ ok: true });
  } else if (request.action === "STREAM_DONE") {
    isStreamFinished = true;
    sendResponse({ ok: true });
  } else if (request.action === "PLAY_ERROR") {
    showPlayerError(request.error);
    sendResponse({ ok: true });
  }
  return true;
});

function extractPageText() {
  const sel = window.getSelection();
  if (sel && sel.toString().trim()) {
    return sel.toString().trim();
  }

  const article = document.querySelector("article") ||
                  document.querySelector("[role='article']") ||
                  document.querySelector(".article-body") ||
                  document.querySelector(".story-body") ||
                  document.querySelector(".content") ||
                  document.querySelector("main");

  if (article) {
    const paras = Array.from(article.querySelectorAll("p"))
      .map(p => p.innerText.trim())
      .filter(t => t.length > 25);
    return paras.length > 0 ? paras.join("\n\n") : article.innerText;
  }

  const allP = Array.from(document.querySelectorAll("p"))
    .map(p => p.innerText.trim())
    .filter(t => t.length > 30);

  if (allP.length > 0) return allP.slice(0, 40).join("\n\n");
  return document.body.innerText.slice(0, 3000);
}

function handleIncomingChunk(b64Wav, chunkDuration) {
  const audioBlobUrl = `data:audio/wav;base64,${b64Wav}`;
  audioQueue.push(audioBlobUrl);

  if (!isAudioPlaying) {
    playNextChunk();
    const statusEl = document.getElementById("ema-card-status");
    if (statusEl) statusEl.innerText = "Oynatılıyor 🔊";
    startTimer();
  }
}

function playNextChunk() {
  if (audioQueue.length === 0) {
    if (isStreamFinished) {
      isAudioPlaying = false;
      const statusEl = document.getElementById("ema-card-status");
      const playBtn = document.getElementById("ema-card-play-pause");
      if (statusEl) statusEl.innerText = "Tamamlandı ✅";
      if (playBtn) playBtn.innerText = "▶";
      clearInterval(timerInterval);
    } else {
      isAudioPlaying = false;
    }
    return;
  }

  isAudioPlaying = true;
  const nextUrl = audioQueue.shift();
  currentHtmlAudio = new Audio(nextUrl);

  currentHtmlAudio.onended = () => {
    playNextChunk();
  };

  currentHtmlAudio.onerror = (e) => {
    console.error("Chunk hatası:", e);
    playNextChunk();
  };

  currentHtmlAudio.play().catch(e => console.log("Oynatma hatası:", e));
}

function renderPlayerCard(initialStatus) {
  removePlayerCard();

  const card = document.createElement("div");
  card.id = "ema-player-card";
  card.innerHTML = `
    <!-- Tam Görünüm -->
    <div class="ema-full-body">
      <div class="ema-card-header">
        <div class="ema-brand">
          <span class="ema-pulse-dot"></span> EMA Seslendirici
        </div>
        <div class="ema-header-actions">
          <button class="ema-action-btn" id="ema-card-minimize" title="Küçült">−</button>
          <button class="ema-action-btn" id="ema-card-close" title="Kapat">✕</button>
        </div>
      </div>
      <div class="ema-status-bar" id="ema-card-status">
        ${initialStatus}
      </div>
      <div class="ema-progress-container">
        <div class="ema-progress-buffer" id="ema-card-buffer"></div>
        <div class="ema-progress-bar" id="ema-card-progress"></div>
      </div>
      <div class="ema-time-row">
        <span id="ema-card-cur-time">00:00</span>
        <span id="ema-card-total-time">--:--</span>
      </div>
      <div class="ema-controls">
        <button class="ema-play-btn" id="ema-card-play-pause">⏸</button>
      </div>
    </div>

    <!-- Küçültülmüş Görünüm (Mini Bar) -->
    <div class="ema-mini-body">
      <button class="ema-mini-play" id="ema-mini-play-btn">⏸</button>
      <span class="ema-mini-title">⚡ EMA Oynatılıyor...</span>
      <button class="ema-action-btn" id="ema-card-maximize" title="Büyüt">⤢</button>
      <button class="ema-action-btn" id="ema-mini-close" title="Kapat">✕</button>
    </div>
  `;

  document.body.appendChild(card);
  currentCard = card;

  // Küçült Butonu (−)
  document.getElementById("ema-card-minimize").onclick = (e) => {
    e.stopPropagation();
    isMinimized = true;
    card.classList.add("ema-minimized");
  };

  // Büyüt Butonu (⤢) veya mini bar'a tıklama
  document.getElementById("ema-card-maximize").onclick = (e) => {
    e.stopPropagation();
    isMinimized = false;
    card.classList.remove("ema-minimized");
  };

  card.onclick = (e) => {
    if (isMinimized && !e.target.closest("button")) {
      isMinimized = false;
      card.classList.remove("ema-minimized");
    }
  };

  // Kapat Butonları
  document.getElementById("ema-card-close").onclick = () => {
    stopPlayback();
    removePlayerCard();
  };
  document.getElementById("ema-mini-close").onclick = (e) => {
    e.stopPropagation();
    stopPlayback();
    removePlayerCard();
  };

  // Oynat / Duraklat
  const togglePlay = () => {
    if (!currentHtmlAudio) return;
    const playPauseBtn = document.getElementById("ema-card-play-pause");
    const miniPlayBtn = document.getElementById("ema-mini-play-btn");

    if (!currentHtmlAudio.paused) {
      currentHtmlAudio.pause();
      if (playPauseBtn) playPauseBtn.innerText = "▶";
      if (miniPlayBtn) miniPlayBtn.innerText = "▶";
      document.getElementById("ema-card-status").innerText = "Duraklatıldı ⏸";
      clearInterval(timerInterval);
    } else {
      currentHtmlAudio.play();
      if (playPauseBtn) playPauseBtn.innerText = "⏸";
      if (miniPlayBtn) miniPlayBtn.innerText = "⏸";
      document.getElementById("ema-card-status").innerText = "Oynatılıyor 🔊";
      startTimer();
    }
  };

  document.getElementById("ema-card-play-pause").onclick = togglePlay;
  document.getElementById("ema-mini-play-btn").onclick = (e) => {
    e.stopPropagation();
    togglePlay();
  };
}

function removePlayerCard() {
  if (currentCard) {
    currentCard.remove();
    currentCard = null;
  }
}

function stopPlayback() {
  if (currentHtmlAudio) {
    try {
      currentHtmlAudio.pause();
      currentHtmlAudio.currentTime = 0;
    } catch(e){}
    currentHtmlAudio = null;
  }
  audioQueue = [];
  isAudioPlaying = false;
  isStreamFinished = false;
  elapsedSeconds = 0;
  isMinimized = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateTimeDisplay(current, total) {
  const curEl = document.getElementById("ema-card-cur-time");
  const totEl = document.getElementById("ema-card-total-time");
  const progEl = document.getElementById("ema-card-progress");

  if (curEl) curEl.innerText = formatTime(current);
  if (totEl) totEl.innerText = formatTime(total);
  if (progEl) {
    const pct = Math.min(100, (current / (total || 1)) * 100);
    progEl.style.width = `${pct}%`;
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (currentHtmlAudio && !currentHtmlAudio.paused) {
      elapsedSeconds += 1;
      updateTimeDisplay(elapsedSeconds, estimatedDuration);
    }
  }, 1000);
}

function showPlayerError(msg) {
  const statusEl = document.getElementById("ema-card-status");
  if (statusEl) {
    statusEl.innerHTML = `<span style="color:#ffffff;background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:4px;">Hata: ${msg}</span>`;
  }
}
