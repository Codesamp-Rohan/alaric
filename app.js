/** @typedef {import('pear-interface')} */

import Hyperswarm from 'hyperswarm';
import Hypercore from 'hypercore';
import crypto from 'hypercore-crypto';
import b4a from 'b4a';
import { createRequire } from 'module';
import { notification } from './notification';
const require = createRequire(import.meta.url);
const { exec } = require('child_process');

const swarm = new Hyperswarm();
const COMMON_GLOBAL_KEY = '45a3e8723d7368659d465871386ee74cdcd99d64b041a327f52302fc8ff1acac';
export let isAdmin = false;

let sortOrder = 'newest';
let feed = new Hypercore(Pear.config.storage + './mazeData1', {
  valueEncoding: 'json',
});
let personalAppFeed = new Hypercore(Pear.config.storage + './personalApp', {
  valueEncoding: 'json'
});
// let feed = new Hypercore(Pear.config.storage + './hyperMazeData', {
  //   valueEncoding: 'json',
  // });
  // let personalAppFeed = new Hypercore(Pear.config.storage + './hyperMazeData/personalApp1', {
    //   valueEncoding: 'json'
    // });
    const globalApps = new Map();
    const personalApps = new Map();
    
    function generateId() {
      return `${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`;
    }

// Function to highlight search term
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

const sortApps = (apps) => {
  return apps.sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();

    if (sortOrder === 'asc') {
      return nameA < nameB ? -1 : 1;
    } else {
      return nameA > nameB ? -1 : 1;
    }
  });
};

document.getElementById('sortByName').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'asc';
  listProducts();
});

document.getElementById('sortByNewest').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'newest';
  listProducts();
});

document.getElementById('sortByOldest').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'oldest';
  listProducts();
});

const listProducts = async () => {
  globalApps.clear(); 

  for await (const product of feed.createReadStream()) {
    if (!globalApps.has(product.id)) {
      globalApps.set(product.id, product);
    }
  }

  const globalAppsSection = document.querySelector('#global--page .list--area');
  const globalRoomSection = document.querySelector('#room--page .list--area');
  document.querySelector('#global-apps-no').innerHTML = Array.from(globalApps.values()).filter(app => app.appType !== 'room').length;
  document.querySelector('#rooms-apps-no').innerHTML = Array.from(globalApps.values()).filter(app => app.appType === 'room').length;
  const searchTerm = document.getElementById('global--search').value.trim().toLowerCase();

  let appsToDisplay = Array.from(globalApps.values()).filter(app => app.appType !== 'room');
  let roomsToDisplay = Array.from(globalApps.values()).filter(app => app.appType === 'room');

  if (searchTerm) {
    appsToDisplay = appsToDisplay.filter(app => 
      app.name.toLowerCase().includes(searchTerm) || app.cmd.toLowerCase().includes(searchTerm)
    );
    appsToDisplay = sortApps(appsToDisplay);
  }

  document.getElementById('global--search').addEventListener('input', (e) => {
    if(e.target.value === 'hello'){
      isAdmin = true;
      console.log('Admin joined!!! : ', isAdmin);
    }
  });
   

  appsToDisplay = appsToDisplay.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    } else if (sortOrder === 'newest') {
      return b.createAt - a.createAt;
    } else if (sortOrder === 'oldest') {
      return a.createAt - b.createAt;
    }
    return 0;
  });

  globalRoomSection.innerHTML = roomsToDisplay.map(app => {
    return `
     <div style="position: relative; cursor: pointer;" class="app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.id}">
          <div class="global-list-leftContent" style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
            <div class="list--running hide"></div>
            <img 
              style="box-shadow: inset 0 0 13px #ddd;height: 60px; min-width: 60px; width: 60px; padding: 7px; background: #000; border-radius: 13px; border: 0;" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="width: 100%; display: flex; flex-direction: column;">
              <div style="display: flex; gap: 10px; align-items: center;">
                <p style="color: #333; font-size: 18px; font-weight: 900;"><strong>${app.name}</strong></p>
                <p style="font-size: 11px; font-weight: 900; color: #247538; white-space: nowrap;">${app.appType}</p>
                  <p style="font-size: 11px; font-weight: 900; color: #247538; white-space: nowrap;">|</p>
                 <p style="font-size: 9px; font-weight: 900; color: #247538; white-space: nowrap;">${formatDate(app.createAt)}</p>
                 <a href="${(app.link === undefined || app.link === '') ? 'https://github.com/Codesamp-Rohan' : app.link}" target="_blank">
                 <img src="./assets/link.png" style="width: 11px; height: 11px;" />
                 </a>
                 ${isAdmin ? 
                  `<p style="font-size: 11px; font-weight: 900; color: #247538; white-space: nowrap;">|</p>`
                   : ``}
              </div>
              <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 14px;">${app.appDescription ? app.appDescription : app.cmd}</p>
            </div>
          </div>
          <div class="list--side--menu">
            <button class="slide-menu" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 12px;" src="./assets/arrow.png" class="list--icon icon" />
            </button>
            <button class="${['holesail', 'terminal'].includes(app.appType) ? 'openholesailPopUp' : 'run-cmd'}"
        data-tooltip="Run the Pear app" 
        style="background: transparent; border: 0; width: 30px; height: 30px;">

              <img style="width: 15px;" src="./assets/run.png" class="list--icon icon" />
            </button>
            <button class="copy-pearID" data-tooltip="Copy Pear ID" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 15px;" src="./assets/copy.png" class="list--icon icon" />
            </button>
          </div>
        </div>
        `
  }).join('');

  globalAppsSection.innerHTML = appsToDisplay.map(app => {
      const name = searchTerm ? highlightSearchTerm(app.name, searchTerm) : app.name;
      const cmd = searchTerm ? highlightSearchTerm(app.cmd, searchTerm) : app.cmd;

      return `
        <div style="position: relative; cursor: pointer;" class="app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.id}">
          <div class="global-list-leftContent" style="display: flex; flex-direction: row; align-items: center; gap: 10px;">
            <div class="list--running hide"></div>
            <img 
              style="box-shadow: inset 0 0 13px #ddd;height: 60px; min-width: 60px; width: 60px; padding: 7px; background: #000; border-radius: 13px; border: 0;" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="width: 100%; display: flex; flex-direction: column;">
              <div style="display: flex; gap: 10px; align-items: center;">
                <p style="color: #333; font-size: 18px; font-weight: 900;"><strong>${name}</strong></p>
                <p style="font-size: 11px; font-weight: 900; color: #247538; white-space: nowrap;">${app.appType}</p>
                  <p style="font-size: 11px; font-weight: 900; color: #247538; white-space: nowrap;">|</p>
                 <p style="font-size: 9px; font-weight: 900; color: #247538; white-space: nowrap;">${formatDate(app.createAt)}</p>
                   <a href="${(app.link === undefined || app.link === '') ? 'https://github.com/Codesamp-Rohan' : app.link}" target="_blank">
                 <img src="./assets/link.png" style="width: 11px; height: 11px;" />
                 </a>
              </div>
              <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 14px;">${app.appDescription ? app.appDescription : cmd}</p>
            </div>
          </div>
          <div class="list--side--menu">
            <button class="slide-menu" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 12px;" src="./assets/arrow.png" class="list--icon icon" />
            </button>
                    <button class="${['holesail', 'terminal'].includes(app.appType) ? 'openholesailPopUp' : 'run-cmd'}"
        data-tooltip="Run the Pear app" 
        style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 15px;" src="./assets/run.png" class="list--icon icon" />
            </button>
            <button class="copy-pearID" data-tooltip="Copy Pear ID" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 15px;" src="./assets/copy.png" class="list--icon icon" />
            </button>
          </div>
        </div>
      `;
    })
    .join('');

    // <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 10px;">${cmd}</p>

  document.querySelectorAll('.app-item').forEach(item => {
    item.addEventListener('click', (event) => {
      if (!event.target.closest('.list--side--menu')) {
        const appId = item.getAttribute('data-id');
        const app = globalApps.get(appId);
        if (app) {
          openPopup(app);
        }
      }
    });
  })
  document.querySelectorAll('.copy-pearID').forEach(button => {
    button.addEventListener('click', (event) => {
      const parentItem = event.currentTarget.closest('.app-item'); 
      const pearCmd = parentItem?.getAttribute('data-cmd'); 
  
      if (pearCmd) {
        navigator.clipboard.writeText(pearCmd).then(() => {
          notification('Command copied to clipboard.', 'success');
        }).catch(err => {
          notification('Failed to copy command.', 'error');
          console.error('Clipboard copy error:', err);
        });
      } else {
        notification('No command found.', 'error');
      }
    });
  });
  
  
  document.querySelectorAll('.run-cmd').forEach(button => {
    button.addEventListener('click', (e) => {
      const parentItem = button.closest('.app-item');
      const pearCmd = parentItem?.getAttribute('data-cmd');
      if (pearCmd) {
        runPearCommand(pearCmd);
      }
    });
  });
  document.querySelectorAll('.openholesailPopUp').forEach(button => {
    button.addEventListener('click', (e) => {
      const parentItem = button.closest('.app-item');
      const appCmd = parentItem?.getAttribute('data-cmd');
      const parentId = parentItem?.getAttribute('data-id');
    
      if (appCmd) {
        openHolesailPopUp(parentId, appCmd);
      } else {
        notification('Failed to retrieve app command.', 'error');
      }
    });
  });
};


const runPearCommand = (cmd) => {
  const parentItem = document.querySelector(`.app-item[data-cmd="${cmd}"]`);
  const rumCommand = parentItem?.querySelector('.run-cmd');
  const slideList = parentItem?.querySelector('.global-list-leftContent');
  const appRunning = parentItem?.querySelector('.list--running');
  
  if (appRunning) {
    slideList.style.paddingLeft = '10px';
    appRunning.classList.remove('hide');
  }

  console.log("Pear Command : ", cmd);
  exec(cmd, (error, stdout, stderr) => {
    if (appRunning) {
      slideList.style.paddingLeft = '0';
      appRunning.classList.add('hide');
    }
    if (error) {
      console.error('Error executing pear run:', error.message);
      notification('Failed to run the pear app. Check the console for details.', 'error');
      return;
    }
    console.log('Pear run output:', stdout);
  });

  notification(cmd, 'success');
};

// Adding the search functionality:
document.getElementById('global--search').addEventListener('input', (e) => {
  const searchQuery = e.target.value.trim();
  if (searchQuery === 'hello') {
    isAdmin = true;
    console.log('Admin joined!!! : ', isAdmin);
    document.getElementById('app-heading').innerText = 'Alaric.app Admin';
    document.getElementById('dashboard--menu').classList.remove('hide');
    document.getElementById('admin--page').classList.remove('hide');
  }
  listProducts(searchQuery);
});

document.getElementById('close--admin').addEventListener('click', (e) => {
  e.preventDefault();
  isAdmin = false;
  console.log('Admin Left!!! : ', isAdmin);
  document.getElementById('app-heading').innerText = 'Alaric.app';
  document.getElementById('dashboard--menu').classList.add('hide');
  document.getElementById('admin--page').classList.add('hide');

  listProducts();
})

const addProduct = async (product, fromPeer = false) => {
  if (!globalApps.has(product.id)) {
    globalApps.set(product.id, product);
    if (!fromPeer) {
      await feed.append(product);
      swarm.connections.forEach((conn) => {
        conn.write(JSON.stringify({ type: 'app-data', data: product }));
      });
    }
    listProducts();
  }
};

const joinSwarm = () => {
  const topic = crypto.discoveryKey(b4a.from(COMMON_GLOBAL_KEY, 'hex'));
  console.log('Pear joined!!!')
  swarm.join(topic, { lookup: true, announce: true });

  swarm.on('connection', (connection, details) => {
    console.log('New connection:', details);
    feed.replicate(connection);

    globalApps.forEach(app => {
      connection.write(JSON.stringify({ type: 'app-data', data: app }));
    });

    connection.on('data', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'app-data') {
          console.log('Received app data from peer:', message.data);
          await addProduct(message.data);
        }
      } catch (err) {
        notification('Failed to parse incoming data:', 'error');
        // console.log('Raw data received:', data.toString());
      } 
    });

    // connection.on('error', (err) => {
      // console.error('Connection error:', err);
    // });

    // connection.on('close', () => {
      // console.log('Connection closed');
    // });
  });

  listProducts();

  swarm.flush(() => {
    console.log('Swarm ready and topic announced:', COMMON_GLOBAL_KEY);
  });
};

const appDescription = document.getElementById('app-description');
const charCount = document.getElementById("charCount");

appDescription.addEventListener("input", () => {
    let text = appDescription.value;
    if (text.length > 70) {
        appDescription.value = text.slice(0, 70);
    }
    charCount.textContent = `${appDescription.value.length}/70`;
});


const addApp = async () => {
  const appName = document.getElementById('app-name').value.trim();
  const appCmd = document.getElementById('app-cmd').value.trim();
  const appLogo = document.getElementById('app-image').files[0];
  const appType = document.getElementById('app-type').value;
  const appLink = document.getElementById('app-link').value.trim();

  if (!appName || !appCmd) {
    notification('Please fill in the required fields.', 'error');
    return;
  }

  const getDefaultLogoBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const processLogo = async () => {
    if(appType !== 'room'){
      if (appLogo) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(appLogo);
        });
      } else {
        return await getDefaultLogoBase64('./assets/alaric.png');
      }
    } else {
      if (appLogo) {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(appLogo);
        });
      } else {
        return await getDefaultLogoBase64('./assets/alaric.png');
      }
    }
  };

  const logoBase64 = await processLogo();

  const appData = {
    type: 'app-data',
    id: generateId(),
    name: appName,
    createAt: Date.now(),
    appType: appType,
    appDescription: appDescription.value, // Use .value here to get the text
    logo: logoBase64,
    link: appLink || 'https://github.com/Codesamp-Rohan',
    cmd: appCmd
  };  

  console.log(appLogo, appData);

  await addProduct(appData);
  addPersonalApp(appData);

  document.getElementById('app-name').value = '';
  document.getElementById('app-image').value = '';
  document.getElementById('app-description').value = '';
  document.getElementById('app-cmd').value = '';
  document.getElementById('app-link').value = '';
  charCount.textContent = "0/70";
};

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await swarm.destroy();
  feed.close();
  process.exit(0);
});

joinSwarm();
document.getElementById('submit-btn').addEventListener('click', addApp);
document.getElementById('reload--app').addEventListener('click', listProducts);

const openHolesailPopUp = (parentId, appCmd) => {
  document.querySelector('.overlay').classList.remove('hide');
  const existingPopup = document.querySelector('#holesail-popup');
  if (existingPopup) existingPopup.remove();

  const popupContainer = document.createElement('div');
  popupContainer.id = 'holesail-popup';
  popupContainer.innerHTML = `
    <form id="add-holesail-details" style="background-color: #000;display: flex; flex-direction: column; gap: 15px;">
      <label for="custom-command">Enter other commands like --live, --host, --public, etc.</label>
      <p style="color: yellow; font-weight: 900; font-size: 10px;">If you do not want to add anything, leave it empty 😊</p>
      <input 
        type="text" 
        id="custom-command" 
        placeholder="Eg: --live 5173 --host localhost" 
        style="padding: 10px; border-radius: 5px; border: 1px solid #555; background: #333; color: #fff;"/>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="button" id="add-holesail-btn" style="padding: 8px 15px; border: none; background: #50fa7b; color: #000; border-radius: 5px; cursor: pointer;">Add</button>
        <button class="button" id="close-popup-btn" style="padding: 8px 15px; border: none; background: #ff5555; color: #fff; border-radius: 5px; cursor: pointer;">Cancel</button>
      </div>
    </form>
  `;

  document.body.appendChild(popupContainer);
  document.getElementById('add-holesail-btn').addEventListener('click', (e) => {
    e.preventDefault();
  document.querySelector('.overlay').classList.add('hide');
    const customCommand = document.getElementById('custom-command').value.trim();

    if (customCommand) {
      const fullCommand = `${appCmd} ${customCommand}`;
      console.log('Executing command:', fullCommand);
      runPearCommand(fullCommand);
      notification('Holesail command added and executed.', 'success');
    } else {
      console.log('No additional commands provided. Running default command:', appCmd);
      runPearCommand(appCmd);
      notification('Default Holesail command executed.', 'success');
    }
    popupContainer.remove();
  });

  document.getElementById('close-popup-btn').addEventListener('click', (e) => {
    e.preventDefault();
  document.querySelector('.overlay').classList.add('hide');
    popupContainer.remove();
    notification('Holesail popup closed.', 'info');
  });
};

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

function revealOnScroll(){
  let listArea = document.querySelector('#global--page')
  const globalList = document.querySelectorAll('.app-item');

  if (!listArea) return;

  let containerRect = listArea.getBoundingClientRect();

  globalList.forEach(item => {
    let itemRect = item.getBoundingClientRect();
    if (itemRect.top >= containerRect.top && itemRect.bottom <= containerRect.bottom) {
      item.classList.add('reveal');
    } else {
      item.classList.remove('reveal');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const listArea = document.querySelector('#global--page');
  if (listArea) {
    listArea.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
  }
});


// Personal App Code.
const listPersonalApps = async () => {
  personalApps.clear();

  for await (const app of personalAppFeed.createReadStream()) {
    if (!personalApps.has(app.id)) {
      personalApps.set(app.id, app);
      // console.log(app);
    }
  }

  const personalAppsSection = document.querySelector('#personal--page .personal--list--area');
  document.querySelector('#personal-apps-no').innerHTML = personalApps.size;

  if (personalApps.size === 0) {
    personalAppsSection.innerHTML = `<p>No apps are yet added by you.</p>`;
  } else {
  personalAppsSection.innerHTML = Array.from(personalApps.values())
    .map(app => `
        <div style="position: relative; cursor: pointer; width: 20%;height: 180px;border-radius: 20px; background-color: #000; box-shadow: 0 0 10px #bbb; overflow: hidden; box-shadow: 6px 7px 10px #a5a5a5;" class="personal-app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.appId}">
          <div class="personal-list" style="display: flex;flex-direction: column;align-items: center;gap: 10px;position: relative;background-color: #000000;width: 100%;height: 100%;box-shadow: inset 0 0 30px #ddd;">
            <img 
              style="transition: 300ms;padding: 7px;border-radius: 13px;border: 0;width: 160%;height: 130%;position: absolute;top: 50%;right: 0;filter: blur(7px);transform: translateY(-61%);" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="width: 100%;display: flex;flex-direction: column;position: absolute;
    bottom: 0;height: 100%;background: linear-gradient(0deg, rgb(0 0 0) 0%, rgb(0 0 0) 19%, rgb(0 0 0 / 0%) 75%, rgba(255, 255, 255, 0) 100%);padding: 1.5rem 1rem;justify-content: flex-end;">
            <p style="color: #fff; font-size: 12px; font-weight: 900;"><strong>${app.name}</strong></p>
            <div style="display: flex; gap: 3px; align-items: center;">
                <p style="font-size: 8px; font-weight: 900; color:#61ff88; white-space: nowrap;">${app.appType}</p>
                <p style="font-size: 8px; font-weight: 900; color: #61ff88; white-space: nowrap;">|</p>
                <p style="font-size: 8px; font-weight: 900; color: #61ff88; white-space: nowrap;">${formatDate(app.createAt)}</p>
              </div>
              </div>
              </div>
              </div>
              `)
              .join('');
            };
          }
            // <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 14px;">${app.cmd}</p>

const addPersonalApp = async (app) => {
  if (!personalApps.has(app.id)) {
    await personalAppFeed.append(app);
    personalApps.set(app.id, app);
    listPersonalApps();
    console.log('Personal app added:', app);
  } else {
    console.log('Duplicate personal app ID ignored:', app.id);
  }
};

// Call this function to fetch and display personal apps
listPersonalApps();


const openPopup = (app) => {
  console.log("App PopUp : ", app);
  const popup = document.getElementById('global--popUp');
  const overlay = document.querySelector('.overlay');
  const popupContent = document.getElementById('popUp--pearContent');

  popup.classList.toggle('hide');
  overlay.classList.remove('hide');

  let runButtonHTML = '';

  if (app.appType === 'room') {
    runButtonHTML = `<a href="${app.cmd}" target="_blank" class="button" id="open-room-link" style="padding: 8px 15px; border: none; background:#ac0009; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0; box-shadow: inset 0 0 11px #FFF; text-decoration: none; text-align: center;">Open Room</a>`;
  } else {
    runButtonHTML = `<button class="button" id="run-command-btn" style="padding: 8px 15px; border: none; background:#ac0009; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0; box-shadow: inset 0 0 11px #FFF">Run</button>`;
  }

  popupContent.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 1rem;">
      <img style="box-shadow: inset 0 0 13px #ddd;height: 60px; min-width: 60px; width: 60px; padding: 7px; background: #000; border-radius: 13px; border: 0;" src="${app.logo || './assets/alaric.png'}" alt="App Logo"/>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; flex-direction: column;">
          <h2 class="popUp--name">${app.name}</h2>
          <div style="display: flex; gap: 4px; align-items: center;">
          <p>${app.appType}</p>
          <p>${formatDate(app.createAt)}</p>
          </div>
        </div>
        <p>${app.appDescription || "No description available"}</p>
      </div>
    </div>
    <p style="overflow-wrap: break-word;width: 360px;"><strong>Command:</strong> <span id="appCommand">${app.cmd}</span></p>

    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 1rem;">
      ${runButtonHTML}
      <button class="button" id="copy-command-btn" style="padding: 8px 15px; border: none; background: #00236e; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0; box-shadow: inset 0 0 11px #FFF">Copy</button>
      <button class="button" style="margin-top: 0; width: fit-content;" id="close-global--popUp">Close</button>
    </div>
  `;

  // Close popup
  document.getElementById('close-global--popUp').addEventListener('click', () => {
    popup.classList.add('hide');
    overlay.classList.add('hide');
  });

  overlay.addEventListener('click', () => {
    popup.classList.add('hide');
    overlay.classList.add('hide');
  });

  // Run command button (only if appType is not 'room')
  if (app.appType !== 'room') {
    document.getElementById('run-command-btn').addEventListener('click', () => {
      if(['holesail', 'terminal'].includes(app.appType)){
        openHolesailPopUp(app.id, app.cmd);
      } else {
        runPearCommand(app.cmd);
      }
    });
  }

  // Copy command button
  document.getElementById('copy-command-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(app.cmd).then(() => {
      notification('Command copied to clipboard.', 'success');
    }).catch(err => {
      notification('Failed to copy command.', 'error');
      console.error('Clipboard copy error:', err);
    });
  });
};

// Trending Apps
const displayTrendingApps = () => {
  const trendingAppsContainer = document.getElementById('trending--apps');
  if (!trendingAppsContainer) return;

  const appsArray = Array.from(globalApps.values());
  if (appsArray.length === 0) return;

  const selectedApps = appsArray.sort(() => 0.5 - Math.random()).slice(0, 6);

  trendingAppsContainer.innerHTML = selectedApps.map(app => `
    <div class="trending-app-card">
      <div class="blurred-bg" style="background-image: url('${app.logo || './assets/alaric.png'}');"></div>
      <img src="${app.logo || './assets/alaric.png'}" />
      <h3 style="font-weight: 900; margin-bottom: 4px;">${app.name}</h3>
      <p style="position: absolute;font-weight: 900;margin-bottom: 4px;top: 1rem;right: 1rem;color: #adff2fc7;font-size: 10px;">${formatDate(app.createAt)}</p>
      <p style="white-space: break-spaces; color: #ddd; font-size: 12px; font-weight: 900;">${app.appDescription ? app.appDescription : app.appType}</p>
    </div>
  `).join('');

  document.querySelectorAll('.run-cmd').forEach(button => {
    button.addEventListener('click', (e) => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      runPearCommand(cmd);
    });
  });
};


listProducts().then(displayTrendingApps);
