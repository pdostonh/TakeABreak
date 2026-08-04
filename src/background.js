import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  REMINDER_DEFINITIONS,
  normalizeSettings,
  normalizeStats
} from "./shared.js";

const RECORDED_ALARM_PREFIX = "reminder:";
const SNOOZE_ALARM_PREFIX = "snooze:";

async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return normalizeSettings(stored);
}

async function getStats() {
  const stored = await chrome.storage.local.get({ stats: DEFAULT_STATS });
  return normalizeStats(stored.stats);
}

async function saveStats(stats) {
  await chrome.storage.local.set({ stats: normalizeStats(stats) });
}

function alarmName(type) {
  return `${RECORDED_ALARM_PREFIX}${type}`;
}

function snoozeAlarmName(type) {
  return `${SNOOZE_ALARM_PREFIX}${type}:${Date.now()}`;
}

function createRepeatingAlarm(type, minutes) {
  chrome.alarms.create(alarmName(type), {
    delayInMinutes: minutes,
    periodInMinutes: minutes
  });
}

async function rescheduleRecurringAlarms() {
  const settings = await getSettings();
  const alarms = await chrome.alarms.getAll();

  await Promise.all(
    alarms
      .filter((alarm) => alarm.name.startsWith(RECORDED_ALARM_PREFIX))
      .map((alarm) => chrome.alarms.clear(alarm.name))
  );

  if (!settings.enabled) {
    return;
  }

  createRepeatingAlarm("focus", settings.breakInterval);

  if (settings.eyeReminderEnabled) {
    createRepeatingAlarm("eye", settings.eyeInterval);
  }

  if (settings.waterReminderEnabled) {
    createRepeatingAlarm("water", settings.waterInterval);
  }

  if (settings.stretchReminderEnabled) {
    createRepeatingAlarm("stretch", settings.stretchInterval);
  }

  if (settings.standReminderEnabled) {
    createRepeatingAlarm("stand", settings.standInterval);
  }
}

async function sendBreakMessage(type, source) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  if (activeTab?.id) {
    try {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: "showBreakOverlay",
        reminderType: type,
        source
      });
    } catch {
      // Ignore pages that cannot receive messages.
    }
  }
}

async function showReminder(type, source = "schedule") {
  const reminder = REMINDER_DEFINITIONS[type] || REMINDER_DEFINITIONS.focus;
  const settings = await getSettings();
  const stats = await getStats();

  stats.remindersShown += 1;
  await saveStats(stats);

  const notificationId = `${type}:${Date.now()}`;
  await chrome.notifications.create(notificationId, {
    type: "basic",
    iconUrl: chrome.runtime.getURL("src/icons/icon128.png"),
    title: reminder.title,
    message: reminder.message,
    buttons: [
      { title: "Start break" },
      { title: `Snooze ${settings.snoozeMinutes}m` }
    ]
  });

  await sendBreakMessage(type, source);
}

function parseAlarmType(alarmName) {
  if (alarmName.startsWith(RECORDED_ALARM_PREFIX)) {
    return alarmName.slice(RECORDED_ALARM_PREFIX.length);
  }

  if (alarmName.startsWith(SNOOZE_ALARM_PREFIX)) {
    return alarmName.slice(SNOOZE_ALARM_PREFIX.length).split(":")[0];
  }

  return null;
}

async function handleNotificationAction(notificationId, buttonIndex) {
  const [type] = notificationId.split(":");
  const settings = await getSettings();

  if (buttonIndex === 0) {
    await sendBreakMessage(type, "notification");
    return;
  }

  chrome.alarms.create(snoozeAlarmName(type), {
    delayInMinutes: settings.snoozeMinutes
  });
}

async function markCompleted(type) {
  const stats = await getStats();
  stats.breaksCompleted += 1;
  stats.completedByType[type] = (stats.completedByType[type] || 0) + 1;
  stats.lastCompletedAt = new Date().toISOString();
  await saveStats(stats);
}

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.get(DEFAULT_SETTINGS);
  await chrome.storage.local.get({ stats: DEFAULT_STATS });
  await rescheduleRecurringAlarms();
});

chrome.runtime.onStartup.addListener(async () => {
  await rescheduleRecurringAlarms();
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === "sync" && Object.keys(changes).some((key) => key in DEFAULT_SETTINGS)) {
    await rescheduleRecurringAlarms();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  const type = parseAlarmType(alarm.name);
  if (!type) {
    return;
  }

  const settings = await getSettings();
  if (!settings.enabled) {
    return;
  }

  if (alarm.name.startsWith(SNOOZE_ALARM_PREFIX) || settings[`${type}ReminderEnabled`] !== false || type === "focus") {
    await showReminder(type, alarm.name.startsWith(SNOOZE_ALARM_PREFIX) ? "snooze" : "schedule");
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  void handleNotificationAction(notificationId, buttonIndex);
});

chrome.notifications.onClicked.addListener((notificationId) => {
  void handleNotificationAction(notificationId, 0);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "triggerReminderNow") {
    void showReminder(message.reminderType || "focus", "manual");
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "snoozeReminder") {
    const reminderType = message.reminderType || "focus";
    void getSettings().then((settings) => {
      chrome.alarms.create(snoozeAlarmName(reminderType), {
        delayInMinutes: settings.snoozeMinutes
      });
    });
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "reminderCompleted") {
    void markCompleted(message.reminderType || "focus");
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "getState") {
    void Promise.all([getSettings(), getStats()]).then(([settings, stats]) => {
      sendResponse({ settings, stats });
    });
    return true;
  }

  return false;
});