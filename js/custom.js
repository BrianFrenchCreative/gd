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
     * Dynamically update the mobile status bar theme-color meta tag.
     * Respects dark hero banners when unscrolled, and mirrors the active theme.
     * @param {'light' | 'dark'} [theme]
     */
    function updateThemeColor(theme) {
        var currentTheme = theme || document.documentElement.getAttribute('data-theme') || 'light';
        var heroTheme = document.documentElement.getAttribute('data-hero-theme');
        var color;

        if (document.documentElement.classList.contains('uk-lightbox-page')) {
            color = '#000000';
        } else if (heroTheme === 'dark' && window.scrollY < 80) {
            color = '#0e0e10';
        } else {
            color = currentTheme === 'dark' ? '#1c1c1e' : '#f9fafb';
        }

        var metas = document.querySelectorAll('meta[name="theme-color"]');
        if (metas.length) {
            metas[0].removeAttribute('media');
            metas[0].setAttribute('content', color);
            for (var i = 1; i < metas.length; i++) {
                metas[i].remove();
            }
        } else {
            var newMeta = document.createElement('meta');
            newMeta.setAttribute('name', 'theme-color');
            newMeta.setAttribute('content', color);
            document.head.appendChild(newMeta);
        }
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
        updateThemeColor(theme);
    }

    // Apply preferred theme immediately upon script evaluation
    var initialTheme = getPreferredTheme();
    applyTheme(initialTheme, false);

    // Initialize DOM interactions when ready
    document.addEventListener('DOMContentLoaded', function () {
        var toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile, .theme-toggle-btn');
        updateToggleButtons(document.documentElement.getAttribute('data-theme') || initialTheme);
        updateThemeColor(document.documentElement.getAttribute('data-theme') || initialTheme);

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
        // and sync theme-color on hero pages
        window.addEventListener('scroll', function () {
            if (document.documentElement.getAttribute('data-hero-theme') === 'dark') {
                updateThemeColor();
            }
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

        // Sync mobile status bar theme-color when UIkit lightboxes or modals open and close
        document.addEventListener('shown', function (e) {
            if (e.target && e.target.classList && (e.target.classList.contains('uk-lightbox') || e.target.classList.contains('uk-modal'))) {
                updateThemeColor();
            }
        });
        document.addEventListener('hidden', function (e) {
            if (e.target && e.target.classList && (e.target.classList.contains('uk-lightbox') || e.target.classList.contains('uk-modal'))) {
                updateThemeColor();
            }
        });
    });
})();
