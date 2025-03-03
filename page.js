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

  const dashboardLinks = {
    ".dash-myApps": 1,
    ".dash-local": 2,
    ".dash-apps": 3,
    ".dash-rooms": 4,
    ".dash-premiumApps": 5
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

document.querySelectorAll('.my-apps-btn').forEach((button, index) => {
  button.addEventListener('click', () => {
    const slider = document.getElementById('slider');
    slider.style.transform = `translateX(${index * 116}px)`; // 100px + 10px gap
  });
});
