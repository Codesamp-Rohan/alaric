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
      document.querySelector("#home--page").classList.add("hide");
    });
  });

  // Show the home page initially
  document.querySelector("#home--page").classList.remove("hide");
  togglePage();
});