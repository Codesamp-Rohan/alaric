document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".sideMenu li");
  const pages = document.querySelectorAll(".page");

  const togglePage = (index) => {
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

  menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      togglePage(index);
    });
  });

  // Show the home page initially
  document.querySelector("#home--page").classList.remove("hide");
  togglePage(7); // Default to Dashboard

  // ** Dashboard Click Events **
  const dashboardLinks = {
    ".dash-myApps": 0, // My Apps
    ".dash-local": 1, // System Pear Apps
    ".dash-apps": 2, // Apps Directory
    ".dash-myGames": 4, // Only Games
    ".dash-liveCrypto": 5, // Live Crypto
    ".dash-addApp": 6, // Add App
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
