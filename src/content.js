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
      <div class="tab-overlay-orb"></div>
      <div class="tab-overlay-card">
        <div class="tab-overlay-topline">
          <span class="tab-overlay-pill">Break</span>
          <span class="tab-overlay-live">Live</span>
        </div>
        <h2 id="tab-overlay-title">Take a short reset</h2>
        <p class="tab-overlay-copy" data-copy></p>
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

    .tab-overlay-orb {
      display: none;
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
  `;

  const copy = overlay.querySelector("[data-copy]");
  const timer = overlay.querySelector("[data-timer]");
  const doneButton = overlay.querySelector('[data-action="done"]');
  const snoozeButton = overlay.querySelector('[data-action="snooze"]');

  const reminderCopy = {
    focus: "Break the loop. Close your eyes for a moment, breathe slowly, and come back with a softer focus.",
    eye: "Use this reset for the 20-20-20 rule: look away, blink deliberately, and let the muscles relax.",
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