const togglePage = (index) => {
  const menuItems = document.querySelectorAll(".sideMenu li");
  const pages = document.querySelectorAll(".page");

  menuItems.forEach((item, i) => {
    item.classList.remove("active");
    const dot = item.querySelector(".dot");
    if (dot) dot.classList.add("dot-hide");

    if (pages[i]) {
      pages[i].classList.add("hide");
    }
  });

  if (index !== undefined) {
    menuItems[index].classList.add("active");
    const activeDot = menuItems[index].querySelector(".dot");
    if (activeDot) activeDot.classList.remove("dot-hide");

    if (pages[index]) {
      pages[index].classList.remove("hide");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sideMenu li");

  menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      togglePage(index);
    });
  });

  // Show the home page initially
  document.querySelector("#home--page").classList.remove("hide");
  togglePage(0); // Default to Dashboard

  // ** Dashboard Click Events **
  const dashboardLinks = {
    ".dash-myApps": 1, // My Apps
    ".dash-local": 2, // System Pear Apps
    ".dash-apps": 3, // Apps Directory
    ".dash-rooms": 4 // Rooms Directory
  };

  Object.entries(dashboardLinks).forEach(([selector, index]) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.cursor = "pointer";
      element.addEventListener("click", () => {
        togglePage(index);
      });
    }
  });
});

// ** Form Close Button Event **
const formCloseButton = document.querySelector('.form-close-button');
if (formCloseButton) {
  formCloseButton.addEventListener('click', (e) => {
    e.preventDefault();
    togglePage(0);
  });
}

// Gradient color change.

const elements = [
  { selector: ".dash-myApps", colors: ["#ff7eb390", "#fff"] },
  { selector: ".dash-local", colors: ["#ff9a8b90", "#fff"] },
  { selector: ".dash-apps", colors: ["#a18cd190", "#fff"] },
  { selector: ".dash-rooms", colors: ["#fad0c4", "#fff"] }
];

let angle = 0;

function updateGradients() {
  angle = (angle + 1) % 360;
  elements.forEach(({ selector, colors }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.background = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
    }
  });
}

setInterval(updateGradients, 100);

