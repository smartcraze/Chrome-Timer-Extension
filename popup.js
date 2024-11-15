// Default settings
let targetDate = null; // Null means current time by default
let gridColor = "#3a1369"; // Default grid color
let clockDirection = "countup"; // Default direction is count up
let motivationalText = "The clock is ticking, go faster!";

// Initialize the grid with dynamic sizing
function initGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = ""; // Clear existing squares

  const squareSize = 20; // Size of each square (in pixels)
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const numColumns = Math.ceil(screenWidth / squareSize);
  const numRows = Math.ceil(screenHeight / squareSize);

  grid.style.gridTemplateColumns = `repeat(${numColumns}, ${squareSize}px)`;
  grid.style.gridTemplateRows = `repeat(${numRows}, ${squareSize}px)`;

  const numSquares = numColumns * numRows;

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement('div');
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;
    square.style.backgroundColor = gridColor;
    grid.appendChild(square);
  }
}

// Update the timer display
function updateTimer() {
  const now = new Date();
  let displayDate = targetDate || now; // Show current time if targetDate is null

  if (targetDate) {
    let timeDifference = clockDirection === "countdown" ? targetDate - now : now - targetDate;

    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    timeDifference %= 1000 * 60 * 60;
    const minutes = Math.floor(timeDifference / (1000 * 60));
    timeDifference %= 1000 * 60;
    const seconds = Math.floor(timeDifference / 1000);

    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  } else {
    let hours = displayDate.getHours();
    const minutes = displayDate.getMinutes();
    const seconds = displayDate.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    document.getElementById('ampm').textContent = ampm;
  }
}

// Load saved settings from storage
function loadSettings() {
  chrome.storage.local.get(['targetDate', 'gridColor', 'clockDirection', 'motivationalText'], (result) => {
    if (result.targetDate) {
      targetDate = new Date(result.targetDate);
      console.log("Loaded targetDate:", targetDate);
    }
    if (result.gridColor) gridColor = result.gridColor;
    if (result.clockDirection) clockDirection = result.clockDirection;
    if (result.motivationalText) motivationalText = result.motivationalText;

    document.getElementById('motivational-text-display').textContent = motivationalText;
    initGrid(); // Reinitialize grid with loaded color
  });
}

// Modal open/close functionality
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'flex';
});
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'none';
});

// Apply settings and save to storage
document.getElementById('apply-settings').addEventListener('click', () => {
  const dateInput = document.getElementById('target-date').value;
  if (dateInput) {
    targetDate = new Date(dateInput);
    chrome.storage.local.set({ targetDate: targetDate.toISOString() }); // Save target date as string
    console.log("Saved targetDate:", targetDate);
  } else {
    targetDate = null; // Reset to show current time
    chrome.storage.local.remove('targetDate'); // Clear saved date in storage
  }

  gridColor = document.getElementById('grid-color').value;
  clockDirection = document.getElementById('clock-direction').value;
  motivationalText = document.getElementById('motivational-text').value || motivationalText;

  chrome.storage.local.set({
    gridColor: gridColor,
    clockDirection: clockDirection,
    motivationalText: motivationalText
  });

  document.getElementById('motivational-text-display').textContent = motivationalText;

  initGrid(); // Update grid color
  document.getElementById('settings-modal').style.display = 'none';
});

// Event listener to resize grid dynamically
window.addEventListener('resize', initGrid);

// Initialize the grid, load settings, and start the timer
loadSettings(); // Load settings from storage
initGrid(); // Initialize grid for the first time
setInterval(updateTimer, 1000); // Start timer
