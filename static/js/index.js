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
        
        // Auto-advance carousel at 5-second intervals
        let autoAdvanceInterval;
        let isHovering = false;

        const startAutoAdvance = () => {
            if (!isHovering) {
                autoAdvanceInterval = setInterval(() => {
                    if (!isHovering) {
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

        startAutoAdvance();
    }

    // Fade in the home page after initializing carousel
    index.classList.add("ready");
});