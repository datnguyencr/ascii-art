const savedTheme = localStorage.getItem("theme");
const html = document.documentElement;
if (savedTheme === "dark") {
  html.classList.add("dark");
}

export const translations = {
  en: {
    english: "English",
    vietnamese: "Vietnamese",
    back: "Back",
  },
  vi: {
    english: "Tiếng Anh",
    vietnamese: "Tiếng Việt",
    back: "Trở lại",
  },
};

export function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}
export function language() {
  return localStorage.getItem("language") || "en";
}

// Cache for multiple templates
const templateCache = new Map();

/**
 * Load a template from an external HTML file.
 * @param {string} url - URL of the HTML file containing a <template>.
 * @returns {HTMLTemplateElement} - The <template> element from the file.
 */
export async function loadTemplate(url) {
  if (templateCache.has(url)) {
    return templateCache.get(url);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load template: ${url}`);

  const html = await res.text();
  const container = document.createElement("div");
  container.innerHTML = html;

  const template = container.querySelector("template");
  if (!template) throw new Error(`No <template> found in ${url}`);
  const clonedTemplate = template.cloneNode(true);
  templateCache.set(url, clonedTemplate);
  return clonedTemplate;
}
// Cache to track loaded dialogs
const dialogCache = new Map();

/**
 * Load a dialog from external HTML and append it to the body.
 * Only loads once.
 * @param {string} url - URL of the HTML file containing a <template> or dialog HTML.
 * @param {string} dialogId - The id of the dialog element inside the HTML.
 * @returns {HTMLElement} - The dialog element in the DOM.
 */
export async function loadDialog(url, dialogId) {
  if (dialogCache.has(dialogId)) {
    return dialogCache.get(dialogId);
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load dialog: ${url}`);

  const html = await res.text();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  let dialog = wrapper.querySelector(`#${dialogId}`);
  if (!dialog) {
    const tpl = wrapper.querySelector("template");
    if (!tpl) throw new Error(`No dialog or template found in ${url}`);
    dialog = tpl.content.firstElementChild;
  }
  const clonedDialog = dialog.cloneNode(true);
  document.body.appendChild(clonedDialog);
  dialogCache.set(dialogId, clonedDialog);
  return clonedDialog;
}

let devToolsOpen = false;
let hostile = false;
export function enableContentProtection() {
  // ================= Right-Click Block =================
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  loadDevToolsWarningAndDetect();
  // ================= Detection Loop =================
  setInterval(() => {
    const before = new Date();
    debugger;

    const after = new Date();
    if (after - before > 100) {
      onHostile("debugger timing");
      if (!devToolsOpen) {
        devToolsOpen = true;
        showWarning();
      }
    } else {
      if (devToolsOpen) {
        devToolsOpen = false;
        hideWarning();
      }
    }
  }, 1000);
  //  ================= Optional Keyboard Block =================
  // Prevent F12 / Ctrl+Shift+I / Ctrl+Shift+C
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && ["I", "C", "J"].includes(e.key))
    )
      e.preventDefault();
  });
}
async function loadDevToolsWarningAndDetect() {
  try {
    const dialog = await loadDialog(
      "templates/devtools-warning.html",
      "devtoolsWarning"
    );
  } catch (err) {
    console.error("Failed to load DevTools warning or start detection:", err);
  }
}

function onHostile(reason) {
  if (hostile) return;
  hostile = true;

  console.warn("Hostile detected:", reason);

  wipeContent();
}

function wipeContent() {}

function showWarning() {
  const banner = document.getElementById("devtools-warning");
  banner.classList.remove("hidden");
  banner.classList.add("animate-bounce");
}

function hideWarning() {
  const banner = document.getElementById("devtools-warning");
  banner.classList.add("hidden");
  banner.classList.remove("animate-bounce");
}
