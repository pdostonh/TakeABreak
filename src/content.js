const OVERLAY_ID = "takeabreak-overlay";

function createOverlay(reminderType = "focus") {
  const existing = document.getElementById(OVERLAY_ID);
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement("div");
  overlay.id = OVERLAY_ID;
  overlay.dataset.reminderType = reminderType;
  overlay.innerHTML = `
    <div class="tab-overlay-shell" role="dialog" aria-modal="true" aria-labelledby="tab-overlay-title">
      <div class="tab-overlay-card">
        <div class="tab-overlay-topline">
          <span class="tab-overlay-pill">Break</span>
          <span class="tab-overlay-live">Live</span>
        </div>
        <h2 id="tab-overlay-title">Take a short reset</h2>
        <p class="tab-overlay-copy" data-copy></p>
        <div class="tab-overlay-visual" data-visual aria-hidden="true">
          <div class="tab-overlay-orb"></div>
        </div>
        <div class="tab-overlay-timer" data-timer>20s</div>
        <div class="tab-overlay-actions">
          <button class="tab-overlay-button secondary" data-action="snooze">Snooze</button>
          <button class="tab-overlay-button" data-action="done">Done</button>
        </div>
        <div class="tab-overlay-checklist">
          <span>Look far away</span>
          <span>Blink slowly</span>
          <span>Drop your shoulders</span>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #${OVERLAY_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      background: rgba(18, 24, 36, 0.88);
      color: #f6f1e8;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }

    .tab-overlay-shell {
      position: relative;
      width: min(92vw, 640px);
      padding: 24px;
    }

    .tab-overlay-card {
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      background: rgba(24, 31, 44, 0.96);
      padding: 24px;
      text-align: left;
    }

    .tab-overlay-card::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 180ms ease;
      pointer-events: none;
    }

    #${OVERLAY_ID}[data-reminder-type="eye"] .tab-overlay-card::before {
      opacity: 1;
      background:
        radial-gradient(circle at 20% 20%, rgba(129, 196, 255, 0.34), transparent 32%),
        radial-gradient(circle at 80% 25%, rgba(91, 108, 255, 0.26), transparent 28%),
        radial-gradient(circle at 50% 80%, rgba(96, 232, 213, 0.2), transparent 28%),
        linear-gradient(135deg, #081324, #13203d 45%, #081b2b);
      animation: tabOverlayGradient 10s ease-in-out infinite alternate;
    }

    .tab-overlay-card > * {
      position: relative;
      z-index: 1;
    }

    .tab-overlay-topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 14px;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      color: rgba(246, 241, 232, 0.72);
    }

    .tab-overlay-pill,
    .tab-overlay-live {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
    }

    #tab-overlay-title {
      margin: 0;
      font-size: clamp(1.8rem, 4vw, 3rem);
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .tab-overlay-copy {
      margin: 14px 0 0;
      max-width: 52ch;
      font-size: 1.02rem;
      line-height: 1.6;
      color: rgba(246, 241, 232, 0.84);
    }

    .tab-overlay-visual {
      display: none;
      height: 220px;
      margin-top: 18px;
      border-radius: 18px;
      overflow: hidden;
      background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    #${OVERLAY_ID}[data-reminder-type="eye"] .tab-overlay-visual {
      display: block;
      background:
        radial-gradient(circle at 20% 20%, rgba(129, 196, 255, 0.12), transparent 34%),
        radial-gradient(circle at 80% 35%, rgba(91, 108, 255, 0.18), transparent 30%),
        radial-gradient(circle at 52% 78%, rgba(96, 232, 213, 0.16), transparent 30%),
        linear-gradient(135deg, rgba(7, 18, 36, 0.96), rgba(14, 30, 59, 0.96));
      position: relative;
    }

    .tab-overlay-orb {
      display: block;
      position: absolute;
      top: 50%;
      left: 18%;
      width: 28px;
      height: 28px;
      margin: -14px 0 0 -14px;
      border-radius: 999px;
      background: radial-gradient(circle at 35% 35%, #ffffff, #7ad7ff 45%, #2866ff 75%);
      box-shadow: 0 0 0 10px rgba(122, 215, 255, 0.08), 0 0 32px rgba(90, 158, 255, 0.55);
      animation: tabOverlayOrb 5.5s ease-in-out infinite alternate;
    }

    #${OVERLAY_ID}:not([data-reminder-type="eye"]) .tab-overlay-orb {
      display: none;
    }

    .tab-overlay-timer {
      margin-top: 20px;
      font-size: clamp(2.5rem, 10vw, 4rem);
      font-weight: 700;
      letter-spacing: -0.05em;
    }

    .tab-overlay-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 18px;
    }

    .tab-overlay-button {
      border: 0;
      border-radius: 999px;
      padding: 12px 18px;
      font: inherit;
      font-weight: 600;
      background: #f5c971;
      color: #17120b;
      cursor: pointer;
    }

    .tab-overlay-button.secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #f6f1e8;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .tab-overlay-checklist {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
      color: rgba(246, 241, 232, 0.7);
      font-size: 0.94rem;
    }

    .tab-overlay-checklist span {
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
    }

    @keyframes tabOverlayOrb {
      0% {
        transform: translate(0, -32px) scale(0.95);
      }
      35% {
        transform: translate(160px, 8px) scale(1);
      }
      70% {
        transform: translate(74px, 42px) scale(1.08);
      }
      100% {
        transform: translate(240px, -18px) scale(0.98);
      }
    }

    @keyframes tabOverlayGradient {
      from {
        filter: hue-rotate(0deg) saturate(1);
      }
      to {
        filter: hue-rotate(16deg) saturate(1.2);
      }
    }
  `;

  const copy = overlay.querySelector("[data-copy]");
  const timer = overlay.querySelector("[data-timer]");
  const doneButton = overlay.querySelector('[data-action="done"]');
  const snoozeButton = overlay.querySelector('[data-action="snooze"]');

  const reminderCopy = {
    focus: "Break the loop. Close your eyes for a moment, breathe slowly, and come back with a softer focus.",
    eye: "Follow the orb for a few moments, then look far away and let your eyes relax.",
    water: "Hydrate now. A quick glass of water beats waiting until you feel the drag.",
    stretch: "Stand, reach, and move through a small reset before the next focus block.",
    stand: "Switch posture, stand up, and give your back a different angle for a minute."
  };

  const timerState = {
    remaining: 20,
    intervalId: null
  };

  function finishBreak(action) {
    clearInterval(timerState.intervalId);
    document.documentElement.style.overflow = "";
    overlay.remove();
    style.remove();
    chrome.runtime.sendMessage({
      type: action === "done" ? "reminderCompleted" : "snoozeReminder",
      reminderType
    });
  }

  function updateTimer() {
    timer.textContent = `${timerState.remaining}s`;
    if (timerState.remaining <= 0) {
      clearInterval(timerState.intervalId);
      timerState.intervalId = null;
      timer.textContent = "Ready";
      doneButton.textContent = "Done";
    }
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      finishBreak("done");
    }
  });

  doneButton.addEventListener("click", () => finishBreak("done"));
  snoozeButton.addEventListener("click", () => finishBreak("snooze"));

  copy.textContent = reminderCopy[reminderType] || reminderCopy.focus;

  document.documentElement.style.overflow = "hidden";
  document.body.appendChild(overlay);
  document.head.appendChild(style);

  timerState.intervalId = window.setInterval(() => {
    timerState.remaining -= 1;
    updateTimer();
    if (timerState.remaining <= 0) {
      clearInterval(timerState.intervalId);
    }
  }, 1000);

  updateTimer();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "showBreakOverlay") {
    createOverlay(message.reminderType || "focus");
  }
});