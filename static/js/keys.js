function measureDotWidth(font) {
  // Create a canvas to measure text precisely
  const canvas = measureDotWidth.canvas || (measureDotWidth.canvas = document.createElement("canvas"));
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(".").width;
}

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

    // Compute exact dot width
    const style = window.getComputedStyle(statement);
    const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const dotWidth = measureDotWidth(font);

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

const debouncedUpdateLeaderDots = debounce(updateLeaderDots, 250);

// Run initially
document.addEventListener("DOMContentLoaded", updateLeaderDots);
window.addEventListener("resize", debouncedUpdateLeaderDots);
if (document.fonts) document.fonts.ready.then(updateLeaderDots);
