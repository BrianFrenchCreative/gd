/**
 * Custom JavaScript for theme switching (light/dark mode) and site interactions.
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'theme';

    /**
     * Determine the user's preferred theme.
     * Checks localStorage first, then falls back to OS preference.
     * @returns {'light' | 'dark'}
     */
    function getPreferredTheme() {
        var savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    /**
     * Apply the theme to the document and optionally persist to localStorage.
     * @param {'light' | 'dark'} theme
     * @param {boolean} [persist=false]
     */
    /**
     * Update accessibility labels and visual state on all toggle buttons (desktop & mobile).
     * @param {'light' | 'dark'} theme
     */
    function updateToggleButtons(theme) {
        var toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, .theme-toggle-btn');
        if (!toggleBtns.length) return;

        var isDark = theme === 'dark';
        var nextLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';

        toggleBtns.forEach(function (btn) {
            btn.setAttribute('aria-label', nextLabel);
            btn.setAttribute('title', nextLabel);
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        });
    }

    /**
     * Apply the theme to the document and optionally persist to localStorage.
     * @param {'light' | 'dark'} theme
     * @param {boolean} [persist=false]
     */
    function applyTheme(theme, persist) {
        document.documentElement.setAttribute('data-theme', theme);
        if (persist) {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        updateToggleButtons(theme);
    }

    // Apply preferred theme immediately upon script evaluation
    var initialTheme = getPreferredTheme();
    applyTheme(initialTheme, false);

    // Initialize DOM interactions when ready
    document.addEventListener('DOMContentLoaded', function () {
        var toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, .theme-toggle-btn');
        updateToggleButtons(document.documentElement.getAttribute('data-theme') || initialTheme);

        toggleBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
                var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyTheme(newTheme, true);
            });
        });

        // Listen for system appearance changes if user hasn't explicitly set a preference
        if (window.matchMedia) {
            var colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            var handleSystemThemeChange = function (e) {
                var savedTheme = localStorage.getItem(STORAGE_KEY);
                if (!savedTheme) {
                    applyTheme(e.matches ? 'dark' : 'light', false);
                }
            };

            if (colorSchemeQuery.addEventListener) {
                colorSchemeQuery.addEventListener('change', handleSystemThemeChange);
            } else if (colorSchemeQuery.addListener) {
                colorSchemeQuery.addListener(handleSystemThemeChange);
            }
        }

        // Ensure sticky navbar returns cleanly to its unscrolled state when scrolled back to top
        window.addEventListener('scroll', function () {
            if (window.scrollY <= 0) {
                var headerStickyEl = document.querySelector('header [uk-sticky]');
                if (headerStickyEl && window.UIkit && window.UIkit.sticky) {
                    var stickyInst = window.UIkit.sticky(headerStickyEl);
                    if (stickyInst && stickyInst.isFixed) {
                        stickyInst.hide();
                    }
                }
            }
        }, { passive: true });
    });
})();
