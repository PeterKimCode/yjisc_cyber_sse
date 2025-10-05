const root = document.documentElement;
if (root && !root.classList.contains('js-enabled')) {
    root.classList.add('js-enabled');
}

const initialize = () => {
    if (initialize.hasRun) {
        return;
    }
    initialize.hasRun = true;

    const isStorageAvailable = (() => {
        try {
            const key = '__sdu-storage-check__';
            window.localStorage.setItem(key, key);
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            return false;
        }
    })();

    const ensureHeaderCtaGroup = () => {
        const headerContainer = document.querySelector('.site-header .container');
        if (!headerContainer) {
            return null;
        }

        let ctaGroup = headerContainer.querySelector('.cta-group');
        if (!ctaGroup) {
            ctaGroup = document.createElement('div');
            ctaGroup.className = 'cta-group';
            headerContainer.appendChild(ctaGroup);
        }

        return ctaGroup;
    };

    const setupMegaMenuForTouch = () => {
        const nav = document.querySelector('.main-nav');
        if (!nav) {
            return;
        }

        const navItems = Array.from(nav.querySelectorAll('li.has-mega'));
        if (navItems.length === 0) {
            return;
        }

        const coarseQuery =
            typeof window.matchMedia === 'function'
                ? window.matchMedia('(hover: none) and (pointer: coarse)')
                : null;

        const detectTouchEnvironment = () => {
            const hasTouchEvent =
                'ontouchstart' in window ||
                (typeof navigator !== 'undefined' && Number(navigator.maxTouchPoints) > 0);
            return Boolean((coarseQuery && coarseQuery.matches) || hasTouchEvent);
        };

        let touchEnabled = detectTouchEnvironment();

        const closeAll = () => {
            navItems.forEach((item) => {
                item.classList.remove('is-open');
                const trigger = item.querySelector(':scope > a');
                if (trigger) {
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        };

        const updateTouchState = () => {
            const nextState = detectTouchEnvironment();
            if (touchEnabled === nextState) {
                return;
            }

            touchEnabled = nextState;
            if (!touchEnabled) {
                closeAll();
            }
        };

        navItems.forEach((item) => {
            const trigger = item.querySelector(':scope > a');
            if (!trigger) {
                return;
            }

            trigger.setAttribute('aria-expanded', 'false');

            trigger.addEventListener('click', (event) => {
                if (!touchEnabled) {
                    closeAll();
                    return;
                }

                const isOpen = item.classList.contains('is-open');
                if (!isOpen) {
                    event.preventDefault();
                    closeAll();
                    item.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });

            item.addEventListener('focusout', (event) => {
                if (!touchEnabled) {
                    return;
                }

                if (!item.contains(event.relatedTarget)) {
                    item.classList.remove('is-open');
                    trigger.setAttribute('aria-expanded', 'false');
                }
            });
        });

        const megaLinks = nav.querySelectorAll('.mega-menu a');
        megaLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (!touchEnabled) {
                    return;
                }

                closeAll();
            });
        });

        document.addEventListener('click', (event) => {
            if (!touchEnabled) {
                return;
            }

            if (!nav.contains(event.target)) {
                closeAll();
            }
        });

        if (coarseQuery) {
            const handleChange = () => {
                updateTouchState();
            };

            if (typeof coarseQuery.addEventListener === 'function') {
                coarseQuery.addEventListener('change', handleChange);
            } else if (typeof coarseQuery.addListener === 'function') {
                coarseQuery.addListener(handleChange);
            }
        }

        window.addEventListener('resize', updateTouchState);
    };

    const ensureTranslationButton = () => {
        let translationButton = document.querySelector('[data-translate-toggle]');
        if (translationButton) {
            return translationButton;
        }

        const ctaGroup = ensureHeaderCtaGroup();
        if (!ctaGroup) {
            return null;
        }

        translationButton = document.createElement('button');
        translationButton.type = 'button';
        translationButton.className = 'btn ghost translation-toggle';
        translationButton.setAttribute('data-translate-toggle', '');
        translationButton.setAttribute('data-toggle-label-en', 'English');
        translationButton.setAttribute('data-toggle-label-ko', '한국어');
        translationButton.setAttribute('aria-pressed', 'false');
        translationButton.textContent = 'English';
        ctaGroup.appendChild(translationButton);

        return translationButton;
    };

    const ensureScrollButton = () => {
        let scrollButton = document.querySelector('[data-scroll-top]');
        if (scrollButton) {
            return scrollButton;
        }

        scrollButton = document.createElement('button');
        scrollButton.type = 'button';
        scrollButton.className = 'scroll-to-top';
        scrollButton.setAttribute('data-scroll-top', '');
        scrollButton.setAttribute('aria-label', '맨 위로');
        scrollButton.innerHTML =
            '<svg viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">' +
            '<path d="M12 5.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 7.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '<path d="M12 11.5a1 1 0 0 1 .7.3l6 6a1 1 0 0 1-1.4 1.4L12 13.91l-5.3 5.29a1 1 0 0 1-1.4-1.42l6-6a1 1 0 0 1 .7-.28Z" />' +
            '</svg>';
        document.body.appendChild(scrollButton);

        return scrollButton;
    };

    const ensureDarkModeToggle = () => {
        let themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
            return themeToggle;
        }

        themeToggle = document.createElement('button');
        themeToggle.type = 'button';
        themeToggle.className = 'dark-mode-toggle';
        themeToggle.setAttribute('data-theme-toggle', '');
        themeToggle.setAttribute('aria-pressed', 'false');
        themeToggle.innerHTML =
            '<span class="dark-mode-toggle__icon" aria-hidden="true">🌙</span>' +
            '<span class="dark-mode-toggle__label">다크 모드</span>';
        document.body.appendChild(themeToggle);

        return themeToggle;
    };

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('theme-dark', isDark);
        document.documentElement.dataset.theme = theme;
    };

    const getStoredTheme = () => {
        if (!isStorageAvailable) {
            return null;
        }

        return window.localStorage.getItem('preferred-theme');
    };

    const storeTheme = (theme) => {
        if (!isStorageAvailable) {
            return;
        }

        window.localStorage.setItem('preferred-theme', theme);
    };

    setupMegaMenuForTouch();

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const track = slider.querySelector('[data-hero-track]');
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prevButton = slider.querySelector('[data-hero-prev]');
        const nextButton = slider.querySelector('[data-hero-next]');
        const interval = Number(slider.getAttribute('data-hero-interval')) || 8000;

        if (slides.length > 0 && track) {
            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const updateHeight = () => {
                const activeSlide = slides[currentIndex];
                if (!activeSlide) {
                    return;
                }

                const newHeight = `${activeSlide.offsetHeight}px`;
                track.style.height = newHeight;
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;
                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
                updateHeight();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-hero-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            setActive(currentIndex);
            startAutoplay();
            updateHeight();

            window.addEventListener('resize', () => {
                window.requestAnimationFrame(updateHeight);
            });

            window.addEventListener('load', updateHeight);
        }
    }

    const videoSliders = document.querySelectorAll('[data-video-slider]');
    if (videoSliders.length > 0) {
        const initVideoSlider = (slider) => {
            const track = slider.querySelector('[data-video-track]');
            const slides = Array.from(slider.querySelectorAll('[data-video-slide]'));
            if (!track || slides.length === 0) {
                return;
            }

            const dots = Array.from(slider.querySelectorAll('[data-video-dot]'));
            const prevButton = slider.querySelector('[data-video-prev]');
            const nextButton = slider.querySelector('[data-video-next]');
            const interval = Number(slider.getAttribute('data-video-interval')) || 12000;

            let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
            if (currentIndex < 0) {
                currentIndex = 0;
            }

            let autoplayId = null;

            const updateHeight = () => {
                const activeSlide = slides[currentIndex];
                if (!activeSlide) {
                    return;
                }

                track.style.height = `${activeSlide.offsetHeight}px`;
            };

            const setActive = (index) => {
                const targetIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, idx) => {
                    const isActive = idx === targetIndex;
                    slide.classList.toggle('is-active', isActive);
                    slide.setAttribute('aria-hidden', String(!isActive));
                });

                dots.forEach((dot, idx) => {
                    const isActive = idx === targetIndex;
                    dot.classList.toggle('is-active', isActive);
                    dot.setAttribute('aria-selected', String(isActive));
                    if (isActive) {
                        dot.setAttribute('aria-current', 'true');
                    } else {
                        dot.removeAttribute('aria-current');
                    }
                });

                currentIndex = targetIndex;
                updateHeight();
            };

            const goTo = (index) => {
                setActive(index);
            };

            const goToNext = () => {
                goTo(currentIndex + 1);
            };

            const goToPrev = () => {
                goTo(currentIndex - 1);
            };

            const stopAutoplay = () => {
                if (autoplayId) {
                    window.clearInterval(autoplayId);
                    autoplayId = null;
                }
            };

            const startAutoplay = () => {
                if (slides.length < 2) {
                    return;
                }

                stopAutoplay();
                autoplayId = window.setInterval(() => {
                    goToNext();
                }, interval);
            };

            prevButton?.addEventListener('click', () => {
                goToPrev();
                startAutoplay();
            });

            nextButton?.addEventListener('click', () => {
                goToNext();
                startAutoplay();
            });

            dots.forEach((dot) => {
                dot.addEventListener('click', () => {
                    const target = Number(dot.getAttribute('data-video-dot'));
                    if (Number.isNaN(target)) {
                        return;
                    }

                    goTo(target);
                    startAutoplay();
                });
            });

            slider.addEventListener('pointerenter', stopAutoplay);
            slider.addEventListener('pointerleave', startAutoplay);
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', (event) => {
                if (!slider.contains(event.relatedTarget)) {
                    startAutoplay();
                }
            });

            slider.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    goToPrev();
                    startAutoplay();
                } else if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    goToNext();
                    startAutoplay();
                }
            });

            setActive(currentIndex);
            startAutoplay();
            updateHeight();

            window.addEventListener('resize', () => {
                window.requestAnimationFrame(updateHeight);
            });

            window.addEventListener('load', updateHeight);
        };

        videoSliders.forEach((slider) => {
            initVideoSlider(slider);
        });
    }

    const translationButton = ensureTranslationButton();
    if (translationButton) {
        const defaultLabel =
            translationButton.dataset.translateLabelEn ||
            translationButton.dataset.toggleLabelEn ||
            translationButton.textContent.trim() ||
            'English';
        const targetLang = translationButton.dataset.translateTarget || 'en';
        const sourceLang = translationButton.dataset.translateSource || 'ko';
        const ariaLabel =
            translationButton.dataset.translateAriaLabel ||
            '현재 페이지를 영어로 번역된 새 창에서 보기';

        translationButton.dataset.toggleLabelEn = defaultLabel;
        translationButton.textContent = defaultLabel;
        translationButton.setAttribute('aria-pressed', 'false');
        translationButton.setAttribute('aria-label', ariaLabel);

        translationButton.addEventListener('click', () => {
            const translateUrl = new URL('https://papago.naver.net/website');
            translateUrl.searchParams.set('locale', targetLang);
            translateUrl.searchParams.set('source', sourceLang);
            translateUrl.searchParams.set('target', targetLang);
            translateUrl.searchParams.set('url', window.location.href);
            window.open(translateUrl.toString(), '_blank', 'noopener');
        });
    }

    const darkModeToggle = ensureDarkModeToggle();
    if (darkModeToggle) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = getStoredTheme();
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

        const updateDarkToggleLabel = () => {
            const isDark = document.body.classList.contains('theme-dark');
            darkModeToggle.setAttribute('aria-pressed', String(isDark));
            darkModeToggle.innerHTML =
                `<span class="dark-mode-toggle__icon" aria-hidden="true">${isDark ? '☀️' : '🌙'}</span>` +
                `<span class="dark-mode-toggle__label">${isDark ? '라이트 모드' : '다크 모드'}</span>`;
        };

        applyTheme(initialTheme);
        updateDarkToggleLabel();

        darkModeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('theme-dark');
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
            storeTheme(nextTheme);
            updateDarkToggleLabel();
        });

        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleMediaChange = (event) => {
                if (getStoredTheme()) {
                    return;
                }

                applyTheme(event.matches ? 'dark' : 'light');
                updateDarkToggleLabel();
            };

            if (typeof mediaQuery.addEventListener === 'function') {
                mediaQuery.addEventListener('change', handleMediaChange);
            } else if (typeof mediaQuery.addListener === 'function') {
                mediaQuery.addListener(handleMediaChange);
            }
        }
    }

    const scrollButton = ensureScrollButton();
    if (scrollButton) {
        const toggleVisibility = () => {
            const shouldShow = window.scrollY > 240;
            scrollButton.classList.toggle('is-visible', shouldShow);
        };

        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        toggleVisibility();
    }
};

const runWhenReady = () => {
    if (initialize.hasRun) {
        return;
    }

    if (document.querySelector('.site-header .container') || window.__includesReady) {
        initialize();
        return;
    }

    const handleIncludesReady = () => {
        initialize();
    };

    document.addEventListener('includes:ready', handleIncludesReady, { once: true });
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWhenReady);
} else {
    runWhenReady();
}
