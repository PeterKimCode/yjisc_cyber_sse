const root = document.documentElement;
if (root && !root.classList.contains('js-enabled')) {
    root.classList.add('js-enabled');
}

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
        return;
    }

    const track = slider.querySelector('[data-hero-track]');
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prevButton = slider.querySelector('[data-hero-prev]');
    const nextButton = slider.querySelector('[data-hero-next]');
    const interval = Number(slider.getAttribute('data-hero-interval')) || 8000;

    if (slides.length === 0 || !track) {
        return;
    }

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) {
        currentIndex = 0;
    }

    let autoplayId = null;

    function updateHeight() {
        const activeSlide = slides[currentIndex];
        if (!activeSlide || !track) {
            return;
        }

        const newHeight = `${activeSlide.offsetHeight}px`;
        track.style.height = newHeight;
    }

    function setActive(index) {
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
    }

    function goTo(index) {
        setActive(index);
    }

    function goToNext() {
        goTo(currentIndex + 1);
    }

    function goToPrev() {
        goTo(currentIndex - 1);
    }

    function stopAutoplay() {
        if (autoplayId) {
            window.clearInterval(autoplayId);
            autoplayId = null;
        }
    }

    function startAutoplay() {
        if (slides.length < 2) {
            return;
        }

        stopAutoplay();
        autoplayId = window.setInterval(() => {
            goToNext();
        }, interval);
    }

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
});
