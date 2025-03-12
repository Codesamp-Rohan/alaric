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
    ".dash-myApps": 2,
    ".dash-local": 3,
    ".dash-apps": 4,
    ".dash-rooms": 5,
    ".dash-premiumApps": 6
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

document.querySelectorAll('.my-apps-btn').forEach(button => {
  button.addEventListener('click', (e) => {
    const index = Number(e.currentTarget.getAttribute('data-value'));
    console.log(index);

    const personalArea = document.querySelector('.personal--list--area');
    const pinnedArea = document.querySelector('.pinned--list--area');

    if (index === 0) {
      pinnedArea.classList.add('slide-out-right');  // Slide out Pinned Apps
      personalArea.classList.remove('hide', 'slide-out-left');  
      personalArea.classList.add('slide-in-left');  // Slide in Personal Apps

      setTimeout(() => {
        pinnedArea.classList.add('hide');
        pinnedArea.classList.remove('slide-out-right', 'slide-in-right');
      }, 300);

      document.getElementById('my-pin-li-text').innerText = 'My Apps';
      document.getElementById('personal-apps-no').classList.remove('hide');
      document.getElementById('pinned-apps-no').classList.add('hide');
      document.getElementById('my-apps-icon').src = './assets/my.png';
    }
    
    if (index === 1) {
      personalArea.classList.add('slide-out-left'); // Slide out Personal Apps
      pinnedArea.classList.remove('hide', 'slide-out-right');  
      pinnedArea.classList.add('slide-in-right');  // Slide in Pinned Apps

      setTimeout(() => {
        personalArea.classList.add('hide');
        personalArea.classList.remove('slide-out-left', 'slide-in-left');
      }, 300);

      document.getElementById('my-pin-li-text').innerText = 'Pinned Apps';
      document.getElementById('personal-apps-no').classList.add('hide');
      document.getElementById('pinned-apps-no').classList.remove('hide');
      document.getElementById('my-apps-icon').src = './assets/pin.png';
    }
  });
});

const roomDetailPopUp = document.querySelector('#room--detail');
const roomClosePopUp = document.querySelector('#close--room--detail');
const overlay = document.querySelector('.overlay');

document.querySelector('#detail--btn').addEventListener('click', () => {
  roomDetailPopUp.classList.toggle('room--active');
  overlay.classList.remove('hide');
})
document.querySelector('#close--room--detail').addEventListener('click', () => {
  roomDetailPopUp.classList.toggle('room--active');
  overlay.classList.add('hide');
})
overlay.addEventListener('click', () => {
  roomDetailPopUp.classList.remove('room--active');
  overlay.classList.add('hide');
});