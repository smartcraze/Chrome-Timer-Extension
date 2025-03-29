// Default settings
let targetDate = null; // Null means current time by default
let gridColor = "#0B3710"; // Default grid color
let completedColor = "#4CAF50"; // Default completed day color
let clockDirection = "countup"; // Default direction is count up
let motivationalText = "The clock is ticking, go faster!";
let totalDays = 30; // Default challenge length
let challengeName = "DSA Preparation"; // Default challenge name
let startDate = null; // Challenge start date
let sessionDuration = 60; // Default session duration in minutes

// Session timer variables
let sessionTimeLeft = 0;
let sessionTimerInterval = null;
let sessionTimerActive = false;
let sessionTimerPaused = false;

// Initialize the grid with dynamic sizing
function initGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = ""; // Clear existing squares

  const squareSize = 40; // Size of each square (in pixels)
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const numColumns = Math.ceil(screenWidth / squareSize);
  const numRows = Math.ceil(screenHeight / squareSize);

  grid.style.gridTemplateColumns = `repeat(${numColumns}, ${squareSize}px)`;
  grid.style.gridTemplateRows = `repeat(${numRows}, ${squareSize}px)`;

  const numSquares = numColumns * numRows;

  // Create grid squares
  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement('div');
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;
    square.style.backgroundColor = gridColor;
    square.dataset.index = i;
    grid.appendChild(square);
  }

  // Update the completed days
  updateCompletedDays();
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

// Calculate days elapsed in challenge
function getDaysElapsed() {
  if (!startDate) return 0;

  const now = new Date();
  const start = new Date(startDate);

  // Reset hours to compare just dates
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate the time difference in milliseconds
  const timeDiff = today - start;

  // Calculate days and add 1 (since the start day counts as day 1)
  let daysElapsed = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  // Cap at total days
  return Math.min(daysElapsed, totalDays);
}

// Update the completed days on the grid
function updateCompletedDays() {
  const daysElapsed = getDaysElapsed();

  if (daysElapsed <= 0) return;

  const gridSquares = document.querySelectorAll('.grid div');
  const squaresToColor = Math.min(daysElapsed, totalDays, gridSquares.length);

  // Update the day tracker display
  document.getElementById('current-day').textContent = daysElapsed;
  document.getElementById('total-days-display').textContent = totalDays;
  document.getElementById('challenge-name-display').textContent = challengeName;

  // Update progress bar
  const progressPercent = (daysElapsed / totalDays) * 100;
  document.getElementById('progress-bar').style.width = `${progressPercent}%`;

  // Color the squares for completed days
  for (let i = 0; i < squaresToColor; i++) {
    gridSquares[i].style.backgroundColor = completedColor;
    gridSquares[i].classList.add('completed');
  }
}

// Start session timer
function startSessionTimer() {
  // Reset if already running
  if (sessionTimerInterval) {
    clearInterval(sessionTimerInterval);
  }

  sessionTimerActive = true;
  sessionTimerPaused = false;
  sessionTimeLeft = sessionDuration * 60; // Convert to seconds

  // Update flip timer display immediately
  updateFlipTimer();

  // Start countdown
  sessionTimerInterval = setInterval(() => {
    if (!sessionTimerPaused) {
      sessionTimeLeft--;
      updateFlipTimer();

      if (sessionTimeLeft <= 0) {
        clearInterval(sessionTimerInterval);
        sessionTimerActive = false;

        // Play notification sound or vibrate
        navigator.vibrate && navigator.vibrate(200);

        alert("Study session completed!");
      }
    }
  }, 1000);

  // Show session timer modal
  document.getElementById('session-timer-modal').style.display = 'flex';
}

// Update flip timer display
function updateFlipTimer() {
  const minutes = Math.floor(sessionTimeLeft / 60);
  const seconds = sessionTimeLeft % 60;

  document.getElementById('session-minutes-top').textContent = String(minutes).padStart(2, '0');
  document.getElementById('session-minutes-bottom').textContent = String(minutes).padStart(2, '0');
  document.getElementById('session-seconds-top').textContent = String(seconds).padStart(2, '0');
  document.getElementById('session-seconds-bottom').textContent = String(seconds).padStart(2, '0');
}

// Pause/resume session timer
function toggleSessionPause() {
  sessionTimerPaused = !sessionTimerPaused;
  document.getElementById('pause-session').textContent = sessionTimerPaused ? 'Resume' : 'Pause';
}

// Reset session timer
function resetSessionTimer() {
  sessionTimeLeft = sessionDuration * 60;
  updateFlipTimer();
}

// End session timer
function endSessionTimer() {
  clearInterval(sessionTimerInterval);
  sessionTimerActive = false;
  document.getElementById('session-timer-modal').style.display = 'none';
}

// Load saved settings from storage
function loadSettings() {
  chrome.storage.local.get([
    'targetDate',
    'gridColor',
    'completedColor',
    'clockDirection',
    'motivationalText',
    'totalDays',
    'challengeName',
    'startDate',
    'sessionDuration'
  ], (result) => {
    if (result.targetDate) {
      targetDate = new Date(result.targetDate);
    }
    if (result.gridColor) gridColor = result.gridColor;
    if (result.completedColor) completedColor = result.completedColor;
    if (result.clockDirection) clockDirection = result.clockDirection;
    if (result.motivationalText) motivationalText = result.motivationalText;
    if (result.totalDays) totalDays = result.totalDays;
    if (result.challengeName) challengeName = result.challengeName;
    if (result.startDate) startDate = result.startDate;
    if (result.sessionDuration) sessionDuration = result.sessionDuration;

    // Update UI with loaded settings
    document.getElementById('motivational-text-display').textContent = motivationalText;
    document.getElementById('total-days').value = totalDays;
    document.getElementById('challenge-name').value = challengeName;
    document.getElementById('grid-color').value = gridColor;
    document.getElementById('completed-color').value = completedColor;
    document.getElementById('clock-direction').value = clockDirection;
    document.getElementById('motivational-text').value = motivationalText;
    document.getElementById('session-duration').value = sessionDuration;

    if (startDate) {
      document.getElementById('start-date').value = new Date(startDate).toISOString().split('T')[0];
    }

    if (targetDate) {
      const dateTimeStr = targetDate.toISOString().slice(0, 16);
      document.getElementById('target-date').value = dateTimeStr;
    }

    initGrid(); // Reinitialize grid with loaded color
    updateCompletedDays(); // Update challenge progress
  });
}

// Modal open/close functionality
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'none';
});

document.getElementById('close-session-timer').addEventListener('click', () => {
  document.getElementById('session-timer-modal').style.display = 'none';
});


document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("settings-modal");

  // Close modal when clicking outside of modal content
  modal.addEventListener("click", function (event) {
    if (!event.target.closest(".modal-content")) {
      modal.style.display = "none";
    }
  });
});


// Apply settings and save to storage
document.getElementById('apply-settings').addEventListener('click', () => {
  const dateInput = document.getElementById('target-date').value;
  if (dateInput) {
    targetDate = new Date(dateInput);
    chrome.storage.local.set({ targetDate: targetDate.toISOString() });
  } else {
    targetDate = null;
    chrome.storage.local.remove('targetDate');
  }

  // Get challenge settings
  const totalDaysInput = document.getElementById('total-days').value;
  if (totalDaysInput) {
    totalDays = parseInt(totalDaysInput);
  }

  challengeName = document.getElementById('challenge-name').value || challengeName;

  const startDateInput = document.getElementById('start-date').value;
  if (startDateInput) {
    startDate = startDateInput;
  }

  sessionDuration = parseInt(document.getElementById('session-duration').value) || sessionDuration;

  // Get visual settings
  gridColor = document.getElementById('grid-color').value;
  completedColor = document.getElementById('completed-color').value;
  clockDirection = document.getElementById('clock-direction').value;
  motivationalText = document.getElementById('motivational-text').value || motivationalText;

  // Save all settings
  chrome.storage.local.set({
    gridColor,
    completedColor,
    clockDirection,
    motivationalText,
    totalDays,
    challengeName,
    startDate,
    sessionDuration
  });

  // Update UI
  document.getElementById('motivational-text-display').textContent = motivationalText;
  initGrid();
  updateCompletedDays();

  document.getElementById('settings-modal').style.display = 'none';
});

// Session timer controls
document.getElementById('start-session').addEventListener('click', () => {
  document.getElementById('settings-modal').style.display = 'none';
  startSessionTimer();
});

document.getElementById('pause-session').addEventListener('click', toggleSessionPause);
document.getElementById('reset-session').addEventListener('click', resetSessionTimer);
document.getElementById('end-session').addEventListener('click', endSessionTimer);

// Event listener to resize grid dynamically
window.addEventListener('resize', initGrid);

// Initialize the grid, load settings, and start the timer
loadSettings(); // Load settings from storage
initGrid(); // Initialize grid for the first time
setInterval(updateTimer, 1000); // Start timer