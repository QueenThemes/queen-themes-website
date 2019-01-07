'use strict';
function initSmoothScroll() {
    const scroll = new SmoothScroll(); // documentation: https://github.com/cferdinandi/smooth-scroll

    const scrollOffset = function () {
        const header = document.querySelector('.header');
        const sectionNav = document.querySelector('.sectionNavigation');
        let offset = 0;

        if (header) {
            offset += 56;
        }

        if (sectionNav && window.innerWidth > 1024) {
            offset += 56;
        }

        return offset;
    };

    const scrollSettings = {
        offset: scrollOffset
    };

    const smoothScrollWithoutHash = function (selector, settings) {
        /**
         * If smooth scroll element clicked, animate scroll
         */
        const clickHandler = function (event) {
            const toggle = event.target.closest(selector);
            if (!toggle || toggle.tagName.toLowerCase() !== 'a') return;
            const anchor = document.querySelector(toggle.hash);
            if (!anchor) return;

            event.preventDefault(); // Prevent default click event
            scroll.animateScroll(anchor, toggle, settings || {}); // Animate scroll
        };

        window.addEventListener('click', clickHandler, false);
    };

// Run our function
    smoothScrollWithoutHash('a[href*="#"]', scrollSettings);
}
initSmoothScroll();