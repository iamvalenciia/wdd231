// course.js - Handles course information display and filtering

document.addEventListener("DOMContentLoaded", () => {
  // Course data array
  const courses = [
    {
      code: "CSE 110",
      name: "Intro to Programming",
      credits: 2,
      completed: true,
      type: "CSE",
    },
    {
      code: "WDD 130",
      name: "Web Fundamentals",
      credits: 2,
      completed: true,
      type: "WDD",
    },
    {
      code: "CSE 111",
      name: "Programming with Functions",
      credits: 2,
      completed: true,
      type: "CSE",
    },
    {
      code: "CSE 210",
      name: "Programming with Classes",
      credits: 2,
      completed: true,
      type: "CSE",
    },
    {
      code: "WDD 131",
      name: "Dynamic Web Fundamentals",
      credits: 2,
      completed: true,
      type: "WDD",
    },
    {
      code: "WDD 231",
      name: "Web Frontend Development I",
      credits: 2,
      completed: false,
      type: "WDD",
    },
  ];

  // Elements
  const courseCardsContainer = document.getElementById(
    "course-cards-container"
  );
  const creditCountElement = document.getElementById("credit-count");
  const totalCreditsElement = document.getElementById("total-credits");

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Function to create course card with animation
  function createCourseCard(course, index) {
    const courseCard = document.createElement("div");
    courseCard.className = `course-card ${course.completed ? "completed" : ""}`;
    courseCard.style.opacity = "0";
    courseCard.style.transform = "translateY(20px)";

    courseCard.innerHTML = `
      <div class="course-header">
        <h3>${course.name}</h3>
        <span class="course-credits">${course.credits} credits</span>
      </div>
      <p class="course-code">${course.code}</p>
      <div class="course-status">
        <span class="status-indicator ${
          course.completed ? "completed" : "pending"
        }">
          ${course.completed ? "✓ Completed" : "○ Not completed"}
        </span>
      </div>
    `;

    // Animate card entrance
    setTimeout(() => {
      courseCard.style.transition = "all 0.5s ease";
      courseCard.style.opacity = "1";
      courseCard.style.transform = "translateY(0)";
    }, index * 100);

    return courseCard;
  }

  // Function to display courses with animations
  function displayCourses(coursesToDisplay) {
    // Clear previous cards with fade-out
    courseCardsContainer.style.opacity = "0";

    setTimeout(() => {
      courseCardsContainer.innerHTML = "";

      // Create and append new cards
      coursesToDisplay.forEach((course, index) => {
        const card = createCourseCard(course, index);
        courseCardsContainer.appendChild(card);
      });

      // Fade in container
      courseCardsContainer.style.transition = "opacity 0.5s ease";
      courseCardsContainer.style.opacity = "1";

      // Update credits count with animation
      const totalCredits = coursesToDisplay.reduce(
        (total, course) => total + course.credits,
        0
      );
      animateNumber(
        creditCountElement,
        parseInt(creditCountElement.textContent),
        totalCredits
      );

      // Update total credits text
      totalCreditsElement.innerHTML = `
        <span>Total Credits: <strong>${totalCredits}</strong></span>
      `;
    }, 300);
  }

  // Animate number counting
  function animateNumber(element, start, end) {
    const duration = 1000;
    const steps = 20;
    const increment = (end - start) / steps;
    let current = start;

    const updateNumber = () => {
      current += increment;
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        element.textContent = end;
        return;
      }
      element.textContent = Math.round(current);
      requestAnimationFrame(updateNumber);
    };

    requestAnimationFrame(updateNumber);
  }

  // Handle filter button clicks
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Filter courses
      const filterType = button.dataset.filter;
      const filteredCourses =
        filterType === "all"
          ? courses
          : courses.filter((course) => course.type === filterType);

      // Display filtered courses
      displayCourses(filteredCourses);
    });
  });

  // Initialize with all courses
  displayCourses(courses);
});
