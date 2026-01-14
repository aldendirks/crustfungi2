// =========================================================
// ==================  SPECIES PAGE  =======================
// =========================================================

// =========================================================
// Taxonomy sidebar toggle
// =========================================================
const taxonomySidebar = document.querySelector(".taxonomy-sidebar");
if (taxonomySidebar) {
    taxonomySidebar.addEventListener("click", (ev) => {
        const toggleButton = ev.target.closest(".sidebar-toggle");
        if (!toggleButton) return;

        taxonomySidebar.classList.toggle("active");
        toggleButton.classList.toggle("active");
    });
}

// =========================================================
// Species list image size toggle
// =========================================================
document.addEventListener("click", (e) => {
    const btn = e.target.closest(".image-size-btn");
    if (!btn) return;

    const speciesList = document.querySelector(".species-list");
    if (!speciesList) return;

    const size = btn.dataset.size;

    speciesList.classList.toggle("large-images", size === "large");

    document
        .querySelectorAll(".image-size-btn")
        .forEach((b) => b.classList.toggle("active", b === btn));

    // Persist preference
    localStorage.setItem("speciesImageSize", size);

    if (typeof resizeSpeciesListContainer === "function") {
        resizeSpeciesListContainer();
    }
});

// =========================================================
// Apply stored species image size (small / large)
// =========================================================
function applyStoredImageSize() {
    const speciesList = document.querySelector(".species-list");
    if (!speciesList) return;

    const size = localStorage.getItem("speciesImageSize") || "small";

    speciesList.classList.toggle("large-images", size === "large");

    document.querySelectorAll(".image-size-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.size === size);
    });

    // Recalculate container width after applying the size class
    if (typeof resizeSpeciesListContainer === "function") {
        resizeSpeciesListContainer();
    }
}
document.addEventListener("DOMContentLoaded", applyStoredImageSize);

// =========================================================
// Resize species list container
// =========================================================
function resizeSpeciesListContainer() {
    const header = document.querySelector(".species-list-header");
    const container = document.querySelector(".species-list-container");
    if (!header || !container) return;

    const windowWidth = window.innerWidth;
    const speciesList = document.querySelector(".species-list");
    const gap = 20;
    
    // Mobile layout: 2 columns side by side
    if (windowWidth <= 768) {
        const padding = 20;
        const availableWidth = windowWidth - padding - padding;
        const itemWidth = (availableWidth - gap) / 2;
        const containerWidth = itemWidth * 2 + gap;
        
        speciesList.style.setProperty('--species-img-size', `${itemWidth}px`);
        header.style.width = `${containerWidth}px`;
        container.style.width = `${containerWidth}px`;
        return;
    }

    const itemWidth = speciesList?.classList.contains("large-images") ? 460 : 220;

    // Sidebar width only counts on large screens (>960px)
    const sidebarWidth = windowWidth > 960 ? 400 : 0;

    // Compute available width for species container
    const availableWidth = windowWidth - sidebarWidth - 40;

    // Compute number of columns that fit
    const numCols = Math.floor((availableWidth + gap) / (itemWidth + gap)) || 1;

    // Compute container width
    let containerWidth = numCols * itemWidth + (numCols - 1) * gap;

    // Make sure container width doesn't exceed availableWidth
    if (containerWidth > availableWidth) containerWidth = availableWidth;

    speciesList.style.setProperty('--species-img-size', `${itemWidth}px`);
    header.style.width = `${containerWidth}px`;
    container.style.width = `${containerWidth}px`;
}

// Initial sizing
resizeSpeciesListContainer();

// Reveal after initial layout
document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".species-list-header");
    const container = document.querySelector(".species-list-container");
    if (!header || !container) return;

    requestAnimationFrame(() => {
        header.style.visibility = "visible";
        container.style.visibility = "visible";
    });
});

// Recalculate on resize
window.addEventListener("resize", resizeSpeciesListContainer);

// =========================================================
// AJAX taxonomy filters (no full reload)
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".taxonomy-sidebar");
    const listContainer = document.querySelector(".species-list-container");
    const header = document.querySelector(".species-list-header");

    if (!sidebar || !listContainer || !header) return;

    function fetchAndUpdate(url, pushState = true) {
        fetch(url, {
            headers: { "X-Requested-With": "XMLHttpRequest" },
        })
            .then((response) => {
                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    window.location.href = url;
                    throw new Error("Non-JSON response");
                }
                return response.json();
            })
            .then((data) => {
                // Hide during update to avoid flashes
                listContainer.style.visibility = "hidden";
                header.style.visibility = "hidden";
                sidebar.style.visibility = "hidden";

                if (data.header_html) {
                    header.innerHTML = data.header_html;
                }

                if (data.list_items_html) {
                    listContainer.innerHTML = data.list_items_html;
                }

                applyStoredImageSize();

                if (data.sidebar_html) {
                    const temp = document.createElement("div");
                    temp.innerHTML = data.sidebar_html;

                    const innerSidebar =
                        temp.querySelector(".taxonomy-sidebar")?.innerHTML;

                    sidebar.innerHTML =
                        innerSidebar || data.sidebar_html;
                }

                if (typeof resizeSpeciesListContainer === "function") {
                    resizeSpeciesListContainer();
                }

                if (pushState && data.canonical_url) {
                    history.pushState(null, "", data.canonical_url);
                }

                requestAnimationFrame(() => {
                    listContainer.style.visibility = "visible";
                    header.style.visibility = "visible";
                    sidebar.style.visibility = "visible";
                });
            })
            .catch((err) => {
                console.error("AJAX filter update failed:", err);
                window.location.href = url;
            });
    }

    // Sidebar navigation
    sidebar.addEventListener("click", (ev) => {
        const link = ev.target.closest("a");
        if (!link) return;

        const url = new URL(link.href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        ev.preventDefault();
        fetchAndUpdate(url.href, true);
    });

    // Back / forward navigation
    window.addEventListener("popstate", () => {
        fetchAndUpdate(window.location.href, false);
    });
});


// =========================================================
// ================  SPECIES PROFILES  =====================
// =========================================================

// =========================================================
// Fade in species page after carousel to avoid flashing
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const speciesProfile = document.querySelector(".species-profile");
    if (!speciesProfile) return;
    
    const speciesCarousel = document.getElementById("speciesCarousel");
    if (speciesCarousel) {
        Carousel(speciesCarousel, {}, { Lazyload, Arrows, Thumbs }).init();
        Fancybox.bind("[data-fancybox]", {});
    }

    // Fade in the gallery after initializing carousel
    speciesProfile.classList.add("ready");
});

// =========================================================
// Prepend profile description text
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const profileFields = {
        "profile-ecology": "Ecology",
        "profile-morphology": "Morphology",
        "profile-taste_odor": "Taste and odor",
        "profile-chemical_reactions": "Chemical reactions",
        "profile-spore_print": "Spore print",
        "profile-distribution": "Distribution",
    };

    Object.entries(profileFields).forEach(([className, label]) => {
        const container = document.querySelector(`.${className}`);
        if (!container) return;

        const p = container.querySelector("p");
        if (!p) return;

        // Prevent double-prepending
        if (p.querySelector("strong")) return;

        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;

        p.prepend(strong);
    });
});

// =========================================================
// Copy citation with visual feedback
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("copy-citation-btn");
    const citation = document.getElementById("citation-text");
    if (!btn || !citation) return;

    btn.addEventListener("click", async () => {
        try {
            const text = citation.innerText.trim();
            await navigator.clipboard.writeText(text);

            btn.classList.add("copied");
            btn.textContent = "Copied";

            setTimeout(() => {
                btn.classList.remove("copied");
                btn.textContent = "Copy citation";
            }, 1400);
        } catch (err) {
            console.error("Failed to copy citation:", err);
        }
    });
});
