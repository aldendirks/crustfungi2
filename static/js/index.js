// =========================================================
// ====================  HOME PAGE  ========================
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const index = document.querySelector(".index");
    if (!index) return;

    const homeCarousel = document.getElementById("homeCarousel");
    const options = {
        Dots: { clickable: true },
        Arrows: true,
    };

    if (homeCarousel) {
        const carousel = Carousel(homeCarousel, options, { Arrows, Dots }).init();
        
        // Auto-advance carousel at 4-second intervals
        let autoAdvanceInterval;
        let isHovering = false;

        const startAutoAdvance = () => {
            if (!isHovering && !document.hidden) {
                autoAdvanceInterval = setInterval(() => {
                    if (!isHovering && !document.hidden) {
                        carousel.next();
                    }
                }, 4000);
            }
        };

        const stopAutoAdvance = () => {
            clearInterval(autoAdvanceInterval);
        };

        // Pause on hover, resume on mouse leave
        homeCarousel.addEventListener("mouseenter", () => {
            isHovering = true;
            stopAutoAdvance();
        });

        homeCarousel.addEventListener("mouseleave", () => {
            isHovering = false;
            startAutoAdvance();
        });

        // Pause carousel when tab becomes hidden, resume when visible
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoAdvance();
            } else {
                startAutoAdvance();
            }
        });

        startAutoAdvance();
    }

    // Fade in the home page after initializing carousel
    index.classList.add("ready");
});