/** @typedef {import('pear-interface')} */

import Hyperswarm from 'hyperswarm';
import Hypercore from 'hypercore';
import crypto from 'hypercore-crypto';
import b4a from 'b4a';
import { createRequire } from 'module';
import { notification } from './notification';
import Swal from 'sweetalert2';
const require = createRequire(import.meta.url);
const { exec } = require('child_process');

const swarm = new Hyperswarm();
const COMMON_GLOBAL_KEY = '7ea84e502381b03fdba9039fb2b714e49daa9184740c35c8b07bf13d13bd6ef8';

let sortOrder = 'newest';
// let feed = new Hypercore(Pear.config.storage + './mazeData1', {
//   valueEncoding: 'json',
// });
// let personalAppFeed = new Hypercore(Pear.config.storage + './personalApp1', {
//   valueEncoding: 'json'
// });
let feed = new Hypercore(Pear.config.storage + './alaricAppData', {
    valueEncoding: 'json',
  });
  let personalAppFeed = new Hypercore(Pear.config.storage + './alaricAppData/personalData', {
      valueEncoding: 'json'
    });
    export const globalApps = new Map();
    const personalApps = new Map();
    
    function generateId() {
      return `${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`;
    }

// Function to highlight search term
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text || ''; 
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};


const cleanup = async () => {
  console.log("Closing connections...");
  await swarm.destroy();
  feed.close();
  process.exit(0);
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

document.getElementById('sortRoomByName').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'asc';
  listProducts();
});

document.getElementById('sortRoomByNewest').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'newest';
  listProducts();
});

document.getElementById('sortRoomByOldest').addEventListener('click', (e) => {
  e.preventDefault();
  sortOrder = 'oldest';
  listProducts();
});

const listProducts = async () => {
  await feed.update();
  globalApps.clear();

  for await (const product of feed.createReadStream()) {
    if (!globalApps.has(product.id)) {
      globalApps.set(product.id, product);
    }
  }

  const globalAppsSection = document.querySelector('#global--page .list--area');
  const globalRoomSection = document.querySelector('#room--page .list--area');
  
  const globalAppsNo = document.querySelector('#global-apps-no');
  const globalRoomsNo = document.querySelector('#global-rooms-no');
  const appCount = Array.from(globalApps.values()).filter(app => app.appType !== 'room').length;
  console.log(appCount);
  globalAppsNo.innerHTML = appCount;
  document.querySelector('#dash-apps-no').innerHTML = globalAppsNo.innerHTML;
  document.querySelector('#dash-rooms-no').innerHTML = globalRoomsNo.innerHTML;
  if(appCount === 0){
    document.getElementById('global-msg').classList.remove('hide');
  } else {
    document.getElementById('global-msg').classList.add('hide');
  }

  const roomCount = Array.from(globalApps.values()).filter(app => app.appType === 'room').length;
  document.querySelector('#global-rooms-no').innerHTML = roomCount;
  if(roomCount === 0){
    document.getElementById('room-msg').classList.remove('hide');
  } else {
    document.getElementById('room-msg').classList.add('hide');
  }
  const searchTerm = document.getElementById('global--search').value.trim().toLowerCase();
  const roomSearch = document.getElementById('room--search').value.trim().toLowerCase();
  console.log("Room search term:", roomSearch);  

  let appsToDisplay = Array.from(globalApps.values()).filter(app => app.appType !== 'room');
  let roomsToDisplay = Array.from(globalApps.values()).filter(app => app.appType === 'room');

  if (searchTerm) {
    appsToDisplay = appsToDisplay.filter(app => {
      const appName = app.name?.toLowerCase() || "";
      const appCmd = app.cmd?.toLowerCase() || "";
      return appName.includes(searchTerm) || appCmd.includes(searchTerm);
    });
  } 
  if (roomSearch) {
    console.log(roomSearch);
    roomsToDisplay = roomsToDisplay.filter(app => {
      const appName = app.name?.toLowerCase() || "";
      const appCmd = app.cmd?.toLowerCase() || "";
      return appName.includes(roomSearch) || appCmd.includes(roomSearch);
    });    
  }  

  appsToDisplay = appsToDisplay.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    } else if (sortOrder === 'newest') {
      return b.createAt - a.createAt ;
    } else if (sortOrder === 'oldest') {
      return a.createAt - b.createAt;
    }
    return 0;
  });
  roomsToDisplay = roomsToDisplay.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    } else if (sortOrder === 'newest') {
      return b.createAt - a.createAt ;
    } else if (sortOrder === 'oldest') {
      return a.createAt - b.createAt;
    }
    return 0;
  });

//   <button class="edit-app" style="background: transparent; border: 0; width: 30px; height: 30px;position: absolute;right: 0;top: 50%;transform: translateY(-50%);">
//   <img style="width: 12px;" src="./assets/edit.png" class="list--icon icon" />
// </button>  

  globalRoomSection.innerHTML = roomsToDisplay.map(app => {
    const name = roomSearch ? highlightSearchTerm(app.name, roomSearch) : app.name;
    const cmd = roomSearch ? highlightSearchTerm(app.cmd, roomSearch) : app.cmd;

    return `
     <div style="position: relative; cursor: pointer;" class="room-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.id}">
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
            <button class="${['holesail'].includes(app.appType) ? 'openholesailPopUp' : 'run-cmd'}"
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

  document.querySelectorAll('.app-item, .room-item').forEach(item => {
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
      const roomParentItem = button.closest('.room-item');
      const pearCmd = parentItem?.getAttribute('data-cmd');
      const roomCmd = roomParentItem?.getAttribute('data-cmd');
  
      if (pearCmd) {
        runPearCommand(pearCmd);
      } else if (roomCmd) {
        window.location.href = roomCmd;
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

document.getElementById('global--search').addEventListener('input', listProducts);
document.getElementById('room--search').addEventListener('input', listProducts);

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
  const match = cmd.match(/^pear run (pear:\/\/\S+)$/);
  if (match) {
    const pearUrl = match[1];
    window.location.href = pearUrl; // Open the extracted pear URL
    notification(`Running ${pearUrl}`, 'success');
  } else {
    console.error('Invalid Pear command:', cmd);
    notification('Invalid Pear command. Make sure it starts with "pear run pear://".', 'error');
  }
  // exec(cmd, (error, stdout, stderr) => {
  //   if (appRunning) {
  //     slideList.style.paddingLeft = '0';
  //     appRunning.classList.add('hide');
  //   }
  //   if (error) {
  //     console.error('Error executing pear run:', error.message);
  //     notification('Failed to run the pear app. Check the console for details.', 'error');
  //     return;
  //   }
  //   console.log('Pear run output:', stdout);
  // });

  notification(cmd, 'success');
};

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

  });

  listProducts();

  swarm.flush(() => {
    console.log('Swarm ready and topic announced:', COMMON_GLOBAL_KEY);
  });
};

process.on('exit', cleanup);


const addApp = async (appName, appType, command, appDescription, imageUrl) => {
  if (!appName || !command) {
    notification('Please fill in the required fields.', 'error');
    return;
  }

  if(appType === 'pear'){
    command = `pear run ${command}`;
  }
  if(appType === 'holesail'){
    command = `holesail ${command}`;
  }

  if (appType === 'room' && !command.includes('pear://keet/')) {
    notification('Wrong command input for Room', 'error');
    return;
  }
  if (appType === 'pear' && !command.includes('pear://')) {
    notification('Wrong command input for Pear', 'error');
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

  let logoBase64 = imageUrl;
  if (!logoBase64) {
    logoBase64 = await getDefaultLogoBase64(
      appType === 'room' ? './assets/keet.png' : './assets/alaric.png'
    );
  }

  const appData = {
    type: 'app-data',
    id: generateId(),
    name: appName,
    createAt: Date.now(),
    appType: appType,
    appDescription: appDescription,
    logo: logoBase64,
    cmd: command,
  };

  await addProduct(appData);
  addPersonalApp(appData);
};

document.getElementById('add--app--form').addEventListener('click', async (e) => {
  e.preventDefault();

  const { value: appType } = await Swal.fire({
    title: 'Choose Type',
    input: 'select',
    inputOptions: {
      pear: 'Pear',
      room: 'Room',
      premium: 'Premium',
    },
    inputPlaceholder: 'Choose an option',
    showCancelButton: true,
    customClass: {
      input: 'input',
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    popup: "font"
    }
  });

  if (!appType) return;

  const { value: appName } = await Swal.fire({
    title: `Name of the ${appType}`,
    input: 'text',
    inputPlaceholder: `${appType} Name`,
    showCancelButton: true,
    customClass: {
      input: 'input',
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    popup: "font"
    }
  });

  if (!appName) return;

  if(appType === 'premium'){
    const {value : premiumAppPrice} = await Swal.fire({
      title: `Enter the price of ${appName} in sats/min`,
      input: 'number',
      inputPlaceholder: `eg : 100sats/min`,
      showCancelButton: true,
      customClass: {
        input: 'input',
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      popup: "font"
    });

    if(!premiumAppPrice) return;
    price = premiumAppPrice;
  }

  let command = '';
  while (true) {
    const inputPlaceholder = appType === 'room' 
    ? 'Enter Room Link (e.g., pear://keet/...)' 
    : appType === 'pear' 
      ? 'Enter Pear Key (e.g., pear://<pearKey>)' 
      : 'Enter Holesail Connector (e.g., <connection string>)';

      const inputLabel = appType === 'room' 
      ? 'do not add pear run' 
      : appType === 'pear' 
        ? 'do not add pear run' 
        : 'just add the key or connection string';
  
  const { value } = await Swal.fire({
    title: `Enter ${appType} Command`,
    input: 'text',
    inputLabel,
    inputPlaceholder,
    showCancelButton: true,
    customClass: {
      input: 'input',
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
    popup: "font"
    }
  });
  

    if (!value) return;

    if (appType === 'room' && !value.includes('pear://keet/')) {
      await Swal.fire({ title: 'Error', text: 'Wrong command input for Room. Please enter a valid command.', icon: 'error' });
      continue;
    }
    command = value;
    break;
  }

  let description = '';
  await Swal.fire({
    title: 'Enter Description',
    input: 'textarea',
    inputLabel: 'Words limit 0/70',
    inputPlaceholder: 'Describe your app',
    showCancelButton: true,
    customClass: {
      textarea: 'textarea',
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
      popup: "font"
    },
    didOpen: () => {
      const textarea = Swal.getPopup().querySelector('textarea');
      const label = Swal.getPopup().querySelector('.swal2-input-label');
  
      textarea.addEventListener('input', () => {
        if (textarea.value.length > 70) {
          textarea.value = textarea.value.slice(0, 70);
        }
        if (label) {
          label.textContent = `Words limit ${textarea.value.length}/70`;
        }
      });
    }
  }).then(({ value }) => {
    description = value || '';
  });

  let imageUrl = '';
  while (true) {
    const { value: file } = await Swal.fire({
      title: 'Upload an Icon (Max 500KB)',
      input: 'file',
      inputAttributes: {
        accept: 'image/*',
      },
      showCancelButton: true,
    });
  
    if (!file) break;

    if (file.size > 500 * 1024) { // 500KB limit
      await Swal.fire({
        title: 'Error',
        text: 'File size exceeds 500KB. Please upload a smaller file.',
        icon: 'error',
      });
      continue;
    }
  
    const reader = new FileReader();
    imageUrl = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    break;
  }

  await addApp(appName, appType, command, description, imageUrl);

  await Swal.fire({
    title: 'App Created!',
    html: `<strong>Type:</strong> ${appType} <br>
           <strong>Name:</strong> ${appName} <br>
           <strong>Command:</strong> ${command} <br>
           <strong>Description:</strong> ${description} <br>
           ${imageUrl ? `<img src="${imageUrl}" alt="App Icon" style="max-width: 100px; display: block; margin: 10px auto;">` : 'No icon uploaded'}`,
    icon: 'success',
  });
});


process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await swarm.destroy();
  feed.close();
  process.exit(0);
});

joinSwarm();


const reloadApp = () => {
  console.log('Reloading...');
  feed.close();
  personalAppFeed.close();
  Pear.reload();
}

document.querySelectorAll('.reload--app').forEach(reloadBtn => {
  reloadBtn.addEventListener('click', () => reloadApp());
});


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

function revealOnScroll(){
  let listArea = document.querySelector('#global--page')
  let roomArea = document.querySelector('#room--page');
  const globalList = document.querySelectorAll('.app-item');
  const roomList = document.querySelectorAll('.room-item');

  if (!listArea || !roomArea) return;

  let containerRect = listArea.getBoundingClientRect();
  let roomRect = roomArea.getBoundingClientRect();

  globalList.forEach(item => {
    let itemRect = item.getBoundingClientRect();
    if (itemRect.top >= containerRect.top && itemRect.bottom <= containerRect.bottom) {
      item.classList.add('reveal');
    } else {
      item.classList.remove('reveal');
    }
  });
  roomList.forEach(item => {
    let itemRect = item.getBoundingClientRect();
    if (itemRect.top >= roomRect.top && itemRect.bottom <= roomRect.bottom) {
      item.classList.add('reveal');
    } else {
      item.classList.remove('reveal');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const globalListArea = document.querySelector('#global--page');
  const roomListArea = document.querySelector('#room--page');

  if (globalListArea) {
    globalListArea.addEventListener('scroll', revealOnScroll);
  }
  if (roomListArea) {
    roomListArea.addEventListener('scroll', revealOnScroll);
  }

  revealOnScroll();
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
  const personalAppsNo = document.querySelector('#personal-apps-no');
  personalAppsNo.innerHTML = personalApps.size;
  document.querySelector('#dash-myApps-no').innerHTML = personalAppsNo.innerHTML;

  if (personalApps.size === 0) {
    personalAppsSection.innerHTML = `<p>No apps are yet added by you.</p>`;
  } else {
  personalAppsSection.innerHTML = Array.from(personalApps.values())
    .map(app => `
        <div style="position: relative; cursor: pointer; width: 20%;height: 180px;border-radius: 20px; background-color: #000; box-shadow: 0 0 10px #bbb; overflow: hidden; box-shadow: 6px 7px 10px #a5a5a5;" class="personal-app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.appId}">
          <div class="personal-list" style="display: flex;flex-direction: column;align-items: center;gap: 10px;position: relative;background-color: #000000;width: 100%;height: 100%;box-shadow: inset 0 0 30px #ddd;">
            <img 
              style="transition: 300ms;border-radius: 13px;border: 0;width: 85%;position: absolute;top: 48%;transform: translateY(-61%);" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="width: 100%;display: flex;flex-direction: column;position: absolute;
    bottom: 0;height: 100%;background: linear-gradient(0deg, rgb(0 0 0) 0%, rgb(0 0 0) 19%, rgb(0 0 0 / 0%) 95%, rgba(255, 255, 255, 0) 100%);padding: 1.5rem 1rem;justify-content: flex-end;">
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

// Trending Apps
const displayTrendingApps = () => {
  const trendingAppsContainer = document.getElementById('trending--apps');
  if (!trendingAppsContainer) return;

  const appsArray = Array.from(globalApps.values());
  if (appsArray.length === 0) return;

  const selectedApps = appsArray.sort(() => 0.5 - Math.random()).slice(0, 6);

  trendingAppsContainer.innerHTML = selectedApps.map(app => `
    <div class="trending-app-card" id="${app.cmd}">
      <div class="blurred-bg" style="background-image: url('${app.logo || './assets/alaric.png'}');"></div>
      <img src="${app.logo || './assets/alaric.png'}" />
      <h3 style="font-weight: 900; margin-bottom: 4px;">${app.name}</h3>
      <p style="position: absolute;font-weight: 900;margin-bottom: 4px;top: 1rem;right: 1rem;color: #adff2fc7;font-size: 10px;">${formatDate(app.createAt)}</p>
      <p style="white-space: break-spaces; color: #ddd; font-size: 12px; font-weight: 900;">${app.appDescription ? app.appDescription : app.appType}</p>
    </div>
  `).join('');

  document.querySelectorAll('.trending-app-card').forEach(card => {
    card.addEventListener('click', () => {
      const cleanedCmd = card.id.replace('pear run ', '');
        window.location.href = cleanedCmd;
    });
  });

  document.querySelectorAll('.run-cmd').forEach(button => {
    button.addEventListener('click', (e) => {
      const cmd = e.currentTarget.getAttribute('data-cmd');
      runPearCommand(cmd);
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  let contextMenu = document.createElement('div');
  contextMenu.className = 'context-menu';
  contextMenu.innerHTML = `
    <ul>
      <li id="run-option">Run</li>
      <li id="copy-option">Copy Pear ID</li>
    </ul>
  `;
  document.body.appendChild(contextMenu);

  let selectedElement = null;

  document.addEventListener('contextmenu', (event) => {
    const targetItem = event.target.closest('.app-item, .room-item');
    if (!targetItem) return;

    event.preventDefault();
    selectedElement = targetItem;

    contextMenu.style.top = `${event.pageY}px`;
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.classList.add('active');
  });

  document.addEventListener('click', (event) => {
    if (!contextMenu.contains(event.target)) {
      contextMenu.classList.remove('active');
    }
  });

  document.getElementById('run-option').addEventListener('click', () => {
    if (selectedElement) {
      const appId = selectedElement.getAttribute('data-id'); // ✅ Using `data-id`
      const app = globalApps.get(appId);
      if(app.appType === 'pear'){
        runPearCommand(app.cmd);
      } else if(app.appType === 'holesail'){
        console.log('click', app.id, app.cmd);
        openHolesailPopUp(app.id, app.cmd);
      }  else if (app.appType === 'room') {
        window.location.href = app.cmd; // ✅ Open the URL in the browser
      }
    }
    contextMenu.classList.remove('active');
  });

  document.getElementById('copy-option').addEventListener('click', () => {
    if (selectedElement) {
      const pearCmd = selectedElement.dataset.cmd; // ✅ Correctly fetching `data-cmd`
      if (pearCmd) {
        navigator.clipboard.writeText(pearCmd).then(() => {
          notification(`Pear ID "${pearCmd}" copied!`, 'success');
        }).catch(() => {
          notification('Failed to copy Pear ID.', 'error');
        });
      }
    }
    contextMenu.classList.remove('active');
  });
});

listProducts().then(displayTrendingApps);



const openPopup = (app, type = 'global') => {
  console.log("App PopUp : ", app);
  const popup = document.getElementById('global--popUp');
  const overlay = document.querySelector('.overlay');
  const popupContent = document.getElementById('popUp--pearContent');

  popup.classList.toggle('hide');
  overlay.classList.remove('hide');

  let runButtonHTML = '';

  if (app.appType === 'room') {
    runButtonHTML = `<a href="${app.cmd}" target="_blank" class="button" id="open-room-link" style="padding: 8px 15px; border: none; background:#ac0009; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0; text-decoration: none; text-align: center;">Open Room</a>`;
  } else {
    runButtonHTML = `<button class="button" id="run-command-btn" style="padding: 8px 15px; border: none; background:#ac0009; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0;">Run</button>`;
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
      <button class="button" id="copy-command-btn" style="padding: 8px 15px; border: none; background: #00236e; color: #fff; border-radius: 5px; cursor: pointer; margin-top: 0;">Copy</button>
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
      if(['holesail'].includes(app.appType)){
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

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }