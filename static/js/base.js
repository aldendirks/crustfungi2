// =========================================================
// =================  BASE FUNCTIONALITY  ==================
// =========================================================

// =========================================================
// Responsive menu toggle (hamburger)
// =========================================================
function toggleMenu(hamburger) {
    hamburger.classList.toggle("change");

    const nav = document.querySelector("nav");
    nav.classList.toggle("responsive");
}

// =========================================================
// Dark mode toggle
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const navToggleBtn = document.getElementById("navDarkModeToggle");
    const footerToggleBtn = document.getElementById("footerDarkModeToggle");
    const buttons = [navToggleBtn, footerToggleBtn].filter(btn => btn !== null);

    function updateUI() {
        const isDark = document.documentElement.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    updateUI();

    // Add click handler to all available toggle buttons
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark-mode");
            updateUI();
        });
    });
});

// =========================================================
// Footer logo shake animation
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const footerLogo = document.querySelector(".footer-logo");
    if (!footerLogo) return;

    footerLogo.addEventListener("mouseenter", () => {
        footerLogo.classList.add("shake");
    });

    footerLogo.addEventListener("mouseleave", () => {
        footerLogo.classList.remove("shake");
    });
});
