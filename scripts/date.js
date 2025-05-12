// date.js - Handles date and time functionality

document.addEventListener("DOMContentLoaded", () => {
  // Get the current year element and set it to the current year
  const currentYearElement = document.getElementById("current-year");
  const currentYear = new Date().getFullYear();
  currentYearElement.textContent = currentYear;

  // Get the last modified element and set it to the last modified date/time
  const lastModifiedElement = document.getElementById("lastModified");
  lastModifiedElement.textContent = `Last Modified: ${document.lastModified}`;
});
