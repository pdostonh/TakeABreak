import { formatMinutes, formatSettingsLabel, getPresetDescription, getPresetLabel, normalizeSettings, normalizeStats } from "./shared.js";

const REMINDER_ORDER = ["focus", "eye", "water", "stretch", "stand"];

const REMINDER_COPY = {
  focus: "Short reset between focus blocks.",
  eye: "Follow the moving dot and relax distance vision.",
  water: "Hydrate before the next task runs long.",
  stretch: "Stand, reach, and move through your shoulders.",
  stand: "Switch posture and break up long sitting stretches."
};

function getReminderState(settings, type) {
  if (type === "focus") {
    return settings.enabled;
  }

  return settings.enabled && settings[`${type}ReminderEnabled`];
}

function getReminderInterval(settings, type) {
  if (type === "focus") {
    return settings.breakInterval;
  }

  return settings[`${type}Interval`];
}

async function triggerReminderNow(reminderType) {
  await chrome.runtime.sendMessage({ type: "triggerReminderNow", reminderType });
}

async function getState() {
  return chrome.runtime.sendMessage({ type: "getState" });
}

async function init() {
  const response = await getState();
  const settings = normalizeSettings(response?.settings || {});
  const stats = normalizeStats(response?.stats || {});
  const reminderStatus = REMINDER_ORDER.map((type) => ({
    type,
    active: getReminderState(settings, type),
    interval: getReminderInterval(settings, type)
  }));

  const completedByType = stats.completedByType || {};

  document.getElementById("preset").textContent = getPresetLabel(settings.preset);
  document.getElementById("summary").textContent = formatSettingsLabel(settings);
  document.getElementById("details").textContent = `${getPresetDescription(settings.preset)} Snooze: ${settings.snoozeMinutes}m.`;
  document.getElementById("mode").textContent = settings.enabled ? "Reminder engine active" : "Reminders paused";
  document.getElementById("completed").textContent = String(stats.breaksCompleted);
  document.getElementById("shown").textContent = String(stats.remindersShown);
  document.getElementById("enabled-count").textContent = String(reminderStatus.filter((item) => item.active).length);

  const statusGrid = document.getElementById("status-grid");
  statusGrid.replaceChildren(
    ...reminderStatus.map((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `status-chip ${item.active ? "active" : "paused"}`;
      chip.innerHTML = `<strong>${item.type}</strong><span>${item.active ? `every ${formatMinutes(item.interval)}` : "paused"}</span>`;
      chip.disabled = !item.active;
      chip.addEventListener("click", async () => {
        await triggerReminderNow(item.type);
        window.close();
      });
      return chip;
    })
  );

  const quickActions = document.getElementById("quick-actions");
  quickActions.replaceChildren(
    ...REMINDER_ORDER.map((type) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary action-button";
      button.textContent = `Start ${type} break`;
      button.addEventListener("click", async () => {
        await triggerReminderNow(type);
        window.close();
      });
      return button;
    })
  );

  const breakDetails = document.getElementById("break-details");
  breakDetails.replaceChildren(
    ...REMINDER_ORDER.map((type) => {
      const card = document.createElement("article");
      card.className = "break-card";
      card.innerHTML = `
        <div class="break-card-topline">
          <span>${type}</span>
          <strong>${completedByType[type] || 0} done</strong>
        </div>
        <p>${REMINDER_COPY[type]}</p>
      `;
      return card;
    })
  );

  document.getElementById("open-options").addEventListener("click", async () => {
    await chrome.runtime.openOptionsPage();
    window.close();
  });
}

init().catch((error) => {
  document.getElementById("summary").textContent = `Unable to load state: ${error.message}`;
});