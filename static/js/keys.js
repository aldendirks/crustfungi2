function measureDotWidth(font) {
  // Create a canvas to measure text precisely
  const canvas = measureDotWidth.canvas || (measureDotWidth.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(".").width;
}

// Cache for dot width to avoid recalculation
let cachedDotWidth = null;
let cachedFont = null;

function updateLeaderDots() {
  // Skip dots calculation on mobile
  if (window.innerWidth <= 768) return;

  document.querySelectorAll(".choice").forEach(choice => {
    const statementContainer = choice.querySelector(".statement-container");
    const statement = choice.querySelector(".statement");
    const destination = choice.querySelector(".destination");
    if (!statement || !destination || !statementContainer) return;

    let dotsSpan = statementContainer.querySelector(".leader-dots");
    if (!dotsSpan) {
      dotsSpan = document.createElement("span");
      dotsSpan.className = "leader-dots";
      statementContainer.appendChild(dotsSpan);
    }

    dotsSpan.textContent = "";

    // Measure last line of statement
    const range = document.createRange();
    range.selectNodeContents(statement);
    const clientRects = range.getClientRects();
    if (!clientRects.length) return;

    const lastRect = clientRects[clientRects.length - 1];
    const containerRect = statementContainer.getBoundingClientRect();
    const destRect = destination.getBoundingClientRect();

    const availableWidth = destRect.left - lastRect.right - 8; // padding
    if (availableWidth <= 0) return;

    // Compute exact dot width (use cache if font hasn't changed)
    const style = window.getComputedStyle(statement);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    let dotWidth = cachedDotWidth;
    if (!dotWidth || font !== cachedFont) {
      dotWidth = measureDotWidth(font);
      cachedDotWidth = dotWidth;
      cachedFont = font;
    }

    const numDots = Math.floor(availableWidth / dotWidth);
    dotsSpan.textContent = ".".repeat(numDots);

    // Position dot span at end of last line
    // Offset upward to align with text
    const fontSize = parseFloat(style.fontSize);
    const verticalOffset = -fontSize * 0.15;
    dotsSpan.style.top = (lastRect.top - containerRect.top + verticalOffset) + "px";
    dotsSpan.style.left = lastRect.right + 5 - containerRect.left + "px";
  });
}

// Debounce helper
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

const debouncedUpdateLeaderDots = debounce(updateLeaderDots, 200);

// Run initially
document.addEventListener("DOMContentLoaded", updateLeaderDots);
window.addEventListener("resize", () => {
  // Clear dots immediately on resize
  document.querySelectorAll(".leader-dots").forEach(dotsSpan => {
    dotsSpan.textContent = "";
  });
  // Recalculate after debounce
  debouncedUpdateLeaderDots();
});
if (document.fonts) {
  document.fonts.ready.then(() => {
    // Clear cache when fonts load (they may have changed)
    cachedDotWidth = null;
    cachedFont = null;
    updateLeaderDots();
  });
}

// Table of Contents - Active Link Highlighting
function updateActiveTocLink() {
  const sections = document.querySelectorAll('.key-section');
  const tocLinks = document.querySelectorAll('.toc-link');

  let activeSection = null;
  let closestToTop = Infinity;

  // Find the section closest to the top of the viewport that's visible
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible && rect.top < closestToTop) {
      closestToTop = rect.top;
      activeSection = section;
    }
  });

  // Update active state
  tocLinks.forEach(link => {
    link.classList.remove('active');
  });

  if (activeSection) {
    const activeSectionId = activeSection.id;
    const activeLink = document.querySelector(`.toc-link[href="#${activeSectionId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', updateActiveTocLink);
window.addEventListener('scroll', updateActiveTocLink);

