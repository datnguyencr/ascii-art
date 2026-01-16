/**
 * Handles Dark/Light mode toggling.
 * Uses 'dark' class on the document element (<html>).
 */

const themeToggleBtn = document.getElementById('themeToggle');
const html = document.documentElement;

// Icons
const sunIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
</svg>`;

const moonIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
</svg>`;

function updateIcon(isDark) {
    if (themeToggleBtn) {
        themeToggleBtn.innerHTML = isDark ? sunIcon : moonIcon;
        // Optional: Tooltip or aria-label update
        themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
}

function setTheme(isDark) {
    if (isDark) {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
    updateIcon(isDark);
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Default to dark if no preference, or respect system
    const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark) || (!savedTheme && true); // Defaulting to dark as per request 'keep current as dark'

    // Explicitly set class
    if (isDark) {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    updateIcon(isDark);
}

// Initial check
initTheme();

// Event Listener
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = html.classList.contains('dark');
        setTheme(!isDark);
    });
}
