// Routine Generator - Main JavaScript File

// Splash screen handler
window.addEventListener("load", function () {
  const splashScreen = document.getElementById("splashScreen");
  if (splashScreen) {
    setTimeout(() => {
      splashScreen.style.opacity = "0";
      splashScreen.style.pointerEvents = "none";
    }, 2500);
  }
});

// Store classes data
let classes = [];
let classIdCounter = 0;

// Color palette for different subjects
const subjectColors = {
  "C.Morphology": { bg: "#fff3cd", border: "#ffc107", text: "#856404" },
  "P.Pathology": { bg: "#f8d7da", border: "#dc3545", text: "#721c24" },
  GPB: { bg: "#d1ecf1", border: "#17a2b8", text: "#0c5460" },
  default: { bg: "#e3e8ff", border: "#667eea", text: "#667eea" },
};

// Subject map to store assigned colors
let subjectColorMap = {};

// Days order (Saturday to Thursday, with Friday as OFF)
const daysOrder = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

// Common time slots (can be customized)
const timeSlots = [
  "8:30-10:00",
  "10:00-11:30",
  "11:30-1:00",
  "1:00-2:30",
  "2:30-4:00",
  "4:00-5:30",
];

// DOM Elements
const classForm = document.getElementById("classForm");
const classesContainer = document.getElementById("classesContainer");
const classCount = document.getElementById("classCount");
const routinePreview = document.getElementById("routinePreview");
const downloadBtn = document.getElementById("downloadBtn");
const clearAllBtn = document.getElementById("clearAll");

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Load data from localStorage
  loadFromLocalStorage();

  // Form submission handler
  classForm.addEventListener("submit", handleFormSubmit);

  // Clear all button handler
  clearAllBtn.addEventListener("click", clearAllClasses);

  // Download button handler
  downloadBtn.addEventListener("click", downloadRoutine);

  // Update preview on load
  updatePreview();
});

// Save data to localStorage
function saveToLocalStorage() {
  const data = {
    classes: classes,
    classIdCounter: classIdCounter,
    subjectColorMap: subjectColorMap,
  };
  localStorage.setItem("routineData", JSON.stringify(data));
}

// Load data from localStorage
function loadFromLocalStorage() {
  const savedData = localStorage.getItem("routineData");
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      classes = data.classes || [];
      classIdCounter = data.classIdCounter || 0;
      subjectColorMap = data.subjectColorMap || {};
      updateClassesList();
      updatePreview();
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
    }
  }
}

// Helper function to get color for subject
function getSubjectColor(subjectName) {
  // Check if subject already has a color assigned
  if (subjectColorMap[subjectName]) {
    return subjectColorMap[subjectName];
  }

  // Check if it's a predefined subject
  if (subjectColors[subjectName]) {
    subjectColorMap[subjectName] = subjectColors[subjectName];
    return subjectColors[subjectName];
  }

  // Generate a unique color for new subjects
  const colorPalette = [
    { bg: "#e8f4f8", border: "#20c997", text: "#0c5460" },
    { bg: "#f0f4e8", border: "#6f42c1", text: "#383d41" },
    { bg: "#fff5e6", border: "#fd7e14", text: "#856404" },
    { bg: "#ffe6e6", border: "#e83e8c", text: "#721c24" },
    { bg: "#e6f3ff", border: "#0d6efd", text: "#004085" },
    { bg: "#f0e6ff", border: "#6610f2", text: "#4a235a" },
  ];

  const assignedCount = Object.keys(subjectColorMap).length;
  const color = colorPalette[assignedCount % colorPalette.length];
  subjectColorMap[subjectName] = color;
  return color;
}

// Convert 24-hour format to 12-hour format with AM/PM
function convertTo12Hour(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  return `${hour12}:${minutes} ${ampm}`;
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  // Validate time inputs
  if (!startTime || !endTime) {
    alert("Please select both start and end time");
    return;
  }

  // Convert to 12-hour format (e.g., "11:30 AM-1:30 PM")
  const startTime12 = convertTo12Hour(startTime);
  const endTime12 = convertTo12Hour(endTime);
  const timeSlot = `${startTime12}-${endTime12}`;

  // Update hidden field
  document.getElementById("timeSlot").value = timeSlot;

  const formData = {
    id: classIdCounter++,
    day: document.getElementById("day").value,
    timeSlot: timeSlot,
    subjectName: document.getElementById("subjectName").value,
    classType: document.getElementById("classType").value,
    roomNumber: document.getElementById("roomNumber").value,
  };

  // Validate form
  if (
    !formData.day ||
    !formData.timeSlot ||
    !formData.subjectName ||
    !formData.classType ||
    !formData.roomNumber
  ) {
    alert("Please fill in all fields");
    return;
  }

  // Add class to array
  classes.push(formData);

  // Reset form
  classForm.reset();

  // Update UI
  updateClassesList();
  updatePreview();
  saveToLocalStorage();
}

// Update classes list display
function updateClassesList() {
  classCount.textContent = classes.length;

  if (classes.length === 0) {
    classesContainer.innerHTML =
      '<p style="color: #999; text-align: center; padding: 20px;">No classes added yet</p>';
    return;
  }

  classesContainer.innerHTML = classes
    .map(
      (classItem) => `
        <div class="class-item ${classItem.classType.toLowerCase()}" data-id="${
          classItem.id
        }">
            <div class="class-info">
                <strong>${classItem.subjectName}</strong>
                <span>${classItem.day} • ${classItem.timeSlot} • ${
                  classItem.classType
                } • Room ${classItem.roomNumber}</span>
            </div>
            <button type="button" class="btn-remove" onclick="removeClass(${
              classItem.id
            })">Remove</button>
        </div>
    `,
    )
    .join("");
}

// Remove a class
function removeClass(id) {
  classes = classes.filter((c) => c.id !== id);
  updateClassesList();
  updatePreview();
  saveToLocalStorage();
}

// Clear all classes
function clearAllClasses() {
  if (classes.length === 0) {
    alert("No classes to clear");
    return;
  }

  if (confirm("Are you sure you want to clear all classes?")) {
    classes = [];
    classIdCounter = 0;
    subjectColorMap = {};
    updateClassesList();
    updatePreview();
    saveToLocalStorage();
  }
}

// Update routine preview
function updatePreview() {
  if (classes.length === 0) {
    routinePreview.innerHTML =
      '<div class="preview-placeholder"><p>Add classes to see the routine preview</p></div>';
    downloadBtn.disabled = true;
    return;
  }

  downloadBtn.disabled = false;

  // Get all unique time slots from classes and sort them chronologically
  const allTimeSlots = sortTimeSlots([
    ...new Set(classes.map((c) => c.timeSlot)),
  ]);

  // Build grid HTML (div based)
  let gridHTML = '<div class="routine-grid">';

  // Add header row
  gridHTML += '<div class="grid-row grid-header">';
  gridHTML += '<div class="grid-cell grid-header-cell">Day/Time</div>';
  allTimeSlots.forEach((slot) => {
    gridHTML += `<div class="grid-cell grid-header-cell">${slot}</div>`;
  });
  gridHTML += "</div>";

  // Add rows for each day
  daysOrder.forEach((day) => {
    gridHTML += '<div class="grid-row">';
    gridHTML += `<div class="grid-cell grid-day-cell">${day}</div>`;

    allTimeSlots.forEach((slot) => {
      // Find classes for this day and time slot
      const dayClasses = classes.filter(
        (c) => c.day === day && c.timeSlot === slot,
      );

      if (dayClasses.length > 0) {
        // Multiple classes in same slot
        let cellContent = '<div class="grid-cell-content">';
        dayClasses.forEach((cls) => {
          const colors = getSubjectColor(cls.subjectName);
          cellContent += `
            <div class="class-cell ${cls.classType.toLowerCase()}" style="background-color: ${colors.bg}; border-color: ${colors.border}; color: ${colors.text};">
              <div class="class-cell-subject">${cls.subjectName}</div>
              <div class="class-cell-type">${cls.classType}</div>
              <div class="class-cell-room">Room ${cls.roomNumber}</div>
            </div>
          `;
        });
        cellContent += "</div>";
        gridHTML += `<div class="grid-cell">${cellContent}</div>`;
      } else {
        gridHTML += '<div class="grid-cell empty-cell">-</div>';
      }
    });

    gridHTML += "</div>";
  });

  // Add OFF day row (Friday)
  gridHTML += '<div class="grid-row">';
  gridHTML += '<div class="grid-cell grid-day-cell">Friday</div>';
  allTimeSlots.forEach(() => {
    gridHTML += '<div class="grid-cell off-day">OFF</div>';
  });
  gridHTML += "</div>";

  gridHTML += "</div>";

  // Build card view for mobile
  let cardHTML = '<div class="routine-cards">';

  daysOrder.forEach((day) => {
    const dayClasses = classes.filter((c) => c.day === day);
    cardHTML += `<div class="day-card">
      <h3 class="day-title">${day}</h3>
      <div class="classes-in-day">`;

    if (dayClasses.length === 0) {
      cardHTML += '<p class="no-class">No classes</p>';
    } else {
      dayClasses.forEach((cls) => {
        const colors = getSubjectColor(cls.subjectName);
        cardHTML += `
          <div class="class-card" style="border-left: 4px solid ${colors.border}; background-color: ${colors.bg};">
            <div class="class-card-time">${cls.timeSlot}</div>
            <div class="class-card-subject" style="color: ${colors.text};">${cls.subjectName}</div>
            <div class="class-card-type">${cls.classType}</div>
            <div class="class-card-room">Room ${cls.roomNumber}</div>
          </div>
        `;
      });
    }

    cardHTML += "</div></div>";
  });

  cardHTML +=
    '<div class="day-card off-day-card"><h3 class="day-title">Friday</h3><div class="no-class">OFF</div></div>';
  cardHTML += "</div>";

  routinePreview.innerHTML = `<div class="table-wrapper">${gridHTML}</div><div class="card-view">${cardHTML}</div>`;
}

// Download routine as image
function downloadRoutine() {
  if (classes.length === 0) {
    alert("Please add some classes before downloading");
    return;
  }

  // Show loading state
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = `
        <svg class="icon icon-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M4.755 10.761a8.25 8.25 0 0 1 14.49-2.022M15 3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V4.81A8.25 8.25 0 0 0 3.306 9.67a.75.75 0 0 1-1.55.372A9.75 9.75 0 0 1 13.5 2.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1 0-1.5h1.743A6.75 6.75 0 0 0 4.755 10.76ZM4.755 10.761l.002-.001h.002Z" clip-rule="evenodd" />
        </svg>
        Downloading...
    `;
  // Add spin animation to spinner
  const spinner = downloadBtn.querySelector(".icon-spinner");
  if (spinner) {
    spinner.style.animation = "spin 1s linear infinite";
  }

  // Get the routine preview element
  const element = routinePreview;

  // Store original display states
  const tableWrapper = element.querySelector(".table-wrapper");
  const cardView = element.querySelector(".card-view");
  const originalTableDisplay = tableWrapper ? tableWrapper.style.display : "";
  const originalCardDisplay = cardView ? cardView.style.display : "";

  // Show table view for download
  if (tableWrapper) tableWrapper.style.display = "block";
  if (cardView) cardView.style.display = "none";

  // Use html2canvas to convert to image
  html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
    useCORS: true,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  })
    .then((canvas) => {
      // Create download link
      const link = document.createElement("a");
      link.download = `routine-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Restore original display states
      if (tableWrapper) tableWrapper.style.display = originalTableDisplay;
      if (cardView) cardView.style.display = originalCardDisplay;

      // Reset button
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `
            <svg class="icon icon-download" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75ZM6.75 15a.75.75 0 0 1 .75.75v2.25a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25V15.75a.75.75 0 0 1 1.5 0v2.25A3.75 3.75 0 0 1 15.75 21h-6a3.75 3.75 0 0 1-3.75-3.75V15.75a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
            </svg>
            Download Routine
        `;
    })
    .catch((error) => {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");

      // Restore original display states
      if (tableWrapper) tableWrapper.style.display = originalTableDisplay;
      if (cardView) cardView.style.display = originalCardDisplay;

      downloadBtn.disabled = false;
      downloadBtn.innerHTML = `
            <svg class="icon icon-download" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75ZM6.75 15a.75.75 0 0 1 .75.75v2.25a2.25 2.25 0 0 0 2.25 2.25h6a2.25 2.25 0 0 0 2.25-2.25V15.75a.75.75 0 0 1 1.5 0v2.25A3.75 3.75 0 0 1 15.75 21h-6a3.75 3.75 0 0 1-3.75-3.75V15.75a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
            </svg>
            Download Routine
        `;
    });
}

// Helper function to convert 12-hour time string to minutes (e.g., "11:30 AM" -> 690, "1:30 PM" -> 810)
function time12ToMinutes(timeStr) {
  if (!timeStr) return 0;
  // Handle format like "11:30 AM" or "1:30 PM"
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  // Convert to 24-hour format
  if (ampm === "PM" && hours !== 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

// Helper function to sort time slots chronologically
function sortTimeSlots(timeSlots) {
  return timeSlots.sort((a, b) => {
    // Extract start time from slot (e.g., "11:30 AM-1:30 PM" -> "11:30 AM")
    const startTimeA = a.split("-")[0].trim();
    const startTimeB = b.split("-")[0].trim();

    // Convert to minutes for comparison
    const minutesA = time12ToMinutes(startTimeA);
    const minutesB = time12ToMinutes(startTimeB);

    return minutesA - minutesB;
  });
}

// Make removeClass available globally for onclick handlers
window.removeClass = removeClass;
