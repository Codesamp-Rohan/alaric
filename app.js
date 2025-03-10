/** @typedef {import('pear-interface')} */

import Hyperswarm from 'hyperswarm';
import Hypercore from 'hypercore';
import crypto from 'hypercore-crypto';
import b4a from 'b4a';
import { createRequire } from 'module';
import { notification } from './notification';
import Swal from 'sweetalert2';
import { displayInvoice } from './generateInvoice';
import { getPearBinaryPath } from './config';
import { ENV } from './env';
const require = createRequire(import.meta.url);
const { exec } = require('child_process');

const swarm = new Hyperswarm();
const COMMON_GLOBAL_KEY = ENV.globalKey;

let pearBinary = getPearBinaryPath();
console.log(pearBinary);
let sortOrder = 'oldest';
let feed = new Hypercore(Pear.config.storage + ENV.globalHyperCore, {
    valueEncoding: 'json',
});
let personalAppFeed = new Hypercore(Pear.config.storage + ENV.personalHyperCore, {
      valueEncoding: 'json'
});
let pinAppFeed = new Hypercore(Pear.config.storage + ENV.pinHyperCore, {
  valueEncoding: 'json'
})
    export const globalApps = new Map();
    const personalApps = new Map();
    export const premiumApps = new Map();
    const pinApps = new Map();
    
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


document.querySelectorAll('.sort-button').forEach(button => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    sortOrder = button.dataset.sort;
    if (button.dataset.type === 'premium') {
      listPremiumApps();
    } else {
      listProducts();
    }
  });
});



const listProducts = async () => {
  await feed.update();
  globalApps.clear();
  for await (const product of feed.createReadStream()) {
    if (!globalApps.has(product.id)) {
      globalApps.set(product.id, product);
    }
  }

  // premiumAppsSection.innerHTML = "";
  
  const globalAppsSection = document.querySelector('#global--page .list--area');
  const globalRoomSection = document.querySelector('#room--page .list--area');
  
  const globalAppsNo = document.querySelector('#global-apps-no');
  const globalRoomsNo = document.querySelector('#global-rooms-no');
  const appCount = Array.from(globalApps.values()).filter(app => app.appType !== 'room' && app.appType !== 'premium').length;
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
  let appsToDisplay = Array.from(globalApps.values()).filter(app => app.appType !== 'room' && app.appType !== 'premium');
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

              <img style="width: 15px;" src="./assets/run.png" class="icon" />
            </button>
            <button class="copy-pearID" data-tooltip="Copy Pear ID" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 15px;" src="./assets/copy.png" class="icon" />
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
              <img style="width: 15px;" src="./assets/run.png" class="icon" />
            </button>
            <button class="copy-pearID" data-tooltip="Copy Pear ID" style="background: transparent; border: 0; width: 30px; height: 30px;">
              <img style="width: 15px;" src="./assets/copy.png" class="icon" />
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
        console.log(app);
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
  console.log(product.appType);
  console.log(product.imageUrl);
    if (!globalApps.has(product.id)) {
      globalApps.set(product.id, product);
      if (!fromPeer) {
        await feed.append(product);
        swarm.connections.forEach((conn) => {
          conn.write(JSON.stringify({ type: 'app-data', data: product }));
        });
      }
      listProducts();
      listPremiumApps();
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

    premiumApps.forEach(app => {
      connection.write(JSON.stringify({ type: 'premium-app-data', data: app }));
    })

    connection.on('data', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'app-data') {
          console.log('Received app data from peer:', message.data);
          await addProduct(message.data);
        }
        // if(message.type === 'premium-app-data'){
        //   console.log('Receive a premium app from peer:', message.data);
        //   await addProduct(message.data);
        // }
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
  if(appType === 'pear'){
    command = `pear run ${command}`;
    const isCommandExists = Array.from(globalApps.values()).some(app => app.cmd === command);

    if (isCommandExists) {
      Swal.fire({
        title: 'Warning!',
        text: 'This Pear command already exists in global apps!',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: "custom-confirm-button",
        }
      });
      return; // Prevent adding the duplicate command
    }
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
    price: false
  };

  if (appType === 'pear') {
    const filteredCmd = command.replace(/^pear run /, '');
    const dumpCommand = `${pearBinary} dump ${filteredCmd}/package.json -`;
    console.log('Executing dump command:', dumpCommand);
    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing dump command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Dump command stderr: ${stderr}`);
        return;
      }
      try {
        // Extract JSON data from stdout using regex
        const jsonMatch = stdout.match(/{[\s\S]*}/);
        if (jsonMatch) {
          const packageData = JSON.parse(jsonMatch[0]);
          console.log(`Package.json Data for ${appName}:`, packageData);
          appData.name = packageData.name || appName;
          appData.appDescription = packageData.description || appDescription;
          if(packageData.payments){
            appData.price = packageData.payments.price || false;
            appData.appType = 'premium';
            console.log(appData.price);
          }
          console.log('Updated App Data:', appData);
          addProduct(appData);
          addPersonalApp(appData);
        } else {
          notification('the command you entered is not correct', 'error');
          console.error('No JSON found in dump output');
          Swal.fire({
            title: 'Something went wrong!!!',
            text: 'I think you entered the wrong command.',
            icon: 'error',
            confirmButton: true,
            customClass: {
              confirmButton: "custom-confirm-button",
            }
          });
        }
      } catch (parseError) {
        console.error('Failed to parse package.json data:', parseError);
      }
    });
  } else {
    await addProduct(appData);
    addPersonalApp(appData);
  }

  await Swal.fire({
    title: 'App Created!',
    html: `<strong>Type:</strong> ${appType} <br>
           <strong>Command:</strong> ${command}`,
    icon: 'success',
  });
};

document.getElementById('add--app--form').addEventListener('click', async (e) => {
  e.preventDefault();

  const { value: appType } = await Swal.fire({
    title: 'Choose Type',
    input: 'select',
    inputOptions: {
      pear: 'Pear',
      room: 'Room',
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

  let command = '';
  const { value: appCommand } = await Swal.fire({
    title: `Enter ${appType} Command`,
    input: 'text',
    inputPlaceholder: `${appType === 'pear' ? 'pear://<pearKey>' : 'pear://keet/...'}`,
    showCancelButton: true,
    customClass: {
      input: 'input',
      confirmButton: "custom-confirm-button",
      cancelButton: "custom-cancel-button",
      popup: "font"
    }
  });

  if (!appCommand) return;
  command = appCommand;

  let imageUrl = '';
  while (true) {
    const { value: file, isDismissed } = await Swal.fire({
      title: 'Upload an Icon (Max 500KB)',
      input: 'file',
      inputAttributes: {
        accept: 'image/*',
      },
      showCancelButton: true,
      customClass: {
        input: 'input',
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
        popup: "font"
      }
    }).then((result) => ({
      value: result.value,
      isDismissed: result.isDismissed || result.dismiss === Swal.DismissReason.cancel,
    }));
    if(isDismissed){
      await Swal.fire({
        title: 'Cancelled',
        text: 'App creation was cancelled.',
        icon: 'warning',
        customClass: {
          cancelButton: "custom-cancel-button",
        }
      });
      return;
    };
    if (!file) break;

    if (file.size > 500 * 1024) {
      await Swal.fire({
        title: 'Error',
        text: 'File size exceeds 500KB. Please upload a smaller file.',
        icon: 'error',
      });
      continue;
    }

    const reader = new FileReader();
    imageUrl = await new Promise((resolve) => {
      reader.onload = () => resolve(reader.result.trim());
      reader.readAsDataURL(file);
    });
    if (imageUrl) break;
  }

  if (appType === 'room') {
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

    console.log(appName);
    console.log(description);
    console.log(imageUrl);
    await addApp(appName, appType, command, description, imageUrl);
  } else {
    console.log(command);
    await addApp('', appType, command, '', imageUrl);
  }
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
  let premiumArea = document.querySelector('#premium--page')
  let roomArea = document.querySelector('#room--page');
  const globalList = document.querySelectorAll('.app-item');
  const roomList = document.querySelectorAll('.room-item');
  const premiumList = document.querySelectorAll('.premium-app-item');

  if (!listArea || !roomArea || !premiumArea) return;

  let containerRect = listArea.getBoundingClientRect();
  let roomRect = roomArea.getBoundingClientRect();
  let premiumRect = premiumArea.getBoundingClientRect();

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
  premiumList.forEach(item => {
    let itemRect = item.getBoundingClientRect();
    if (itemRect.top >= premiumRect.top && itemRect.bottom <= premiumRect.bottom) {
      item.classList.add('reveal');
    } else {
      item.classList.remove('reveal');
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const globalListArea = document.querySelector('#global--page');
  const roomListArea = document.querySelector('#room--page');
  const premiumListArea = document.querySelector('#premium--page');

  if (globalListArea) {
    globalListArea.addEventListener('scroll', revealOnScroll);
  }
  if (roomListArea) {
    roomListArea.addEventListener('scroll', revealOnScroll);
  }
  if(premiumListArea){
    premiumListArea.addEventListener('scroll', revealOnScroll);
  }

  revealOnScroll();
});

// List Premium App
const listPremiumApps = async () => {
  await feed.update();
  premiumApps.clear();

  for await (const appData of feed.createReadStream()) {
    try {
      const app = appData;
      console.log(app.price);

      if (app.hasOwnProperty('price') && app.price !== false && !premiumApps.has(app.id) && app.appType === 'premium') {
        premiumApps.set(app.id, app);
      }
    } catch (error) {
      console.error('Failed to parse premium app data:', error);
    }
  }

  console.log("Filtered Premium Apps:", Array.from(premiumApps.values()));

  const premiumAppsSection = document.querySelector('#premium--page .list--area');
  const premiumAppsNo = document.querySelector('#premium-apps-no');
  premiumAppsNo.innerHTML = premiumApps.size;
  document.querySelector('#dash-premium-no').innerHTML = premiumAppsNo.innerHTML;

  if (premiumApps.size === 0) {
    document.getElementById('premium-msg').classList.remove('hide');
  } else {
    document.getElementById('premium-msg').classList.add('hide');

    const premiumSearch = document.getElementById('premium--search').value.trim().toLowerCase();
    let premiumToDisplay = Array.from(premiumApps.values());

    if (premiumSearch) {
      premiumToDisplay = premiumToDisplay.filter(app => {
        const appName = app.name?.toLowerCase() || "";
        const appCmd = app.cmd?.toLowerCase() || "";
        return appName.includes(premiumSearch) || appCmd.includes(premiumSearch);
      });
    }

    premiumToDisplay = premiumToDisplay.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      } else if (sortOrder === 'newest') {
        return b.createAt - a.createAt;
      } else if (sortOrder === 'oldest') {
        return a.createAt - b.createAt;
      }
      return 0;
    });

    premiumAppsSection.innerHTML = premiumToDisplay.map(app => {
      const name = premiumSearch ? highlightSearchTerm(app.name, premiumSearch) : app.name;
      const cmd = premiumSearch ? highlightSearchTerm(app.cmd, premiumSearch) : app.cmd;

      return `
      <div style="display: flex;position: relative;cursor: pointer; align-items: center;justify-content: space-between;" class="premium-app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.id}">
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
            </div>
            <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-size: 14px;">${app.appDescription ? app.appDescription : cmd}</p>
          </div>
        </div>
        <button id="pay-btn" class="button buy-button" data-app='${JSON.stringify(app)}'>${app.price} sats</button>
      </div>
      `;
    }).join('');

    // Payment button functionality
    document.querySelectorAll(".buy-button").forEach(button => {
      button.addEventListener("click", (event) => {
        const appData = JSON.parse(event.target.getAttribute("data-app"));
        console.log("Selected Premium App:", appData);
        displayInvoice(appData);
      });
    });
  }

  // Event Listener for search
  document.getElementById('premium--search').addEventListener('input', listPremiumApps);
};

const listPinnedApps = async () => {
  pinApps.clear();

  for await (const app of pinAppFeed.createReadStream()) {
    if (!pinApps.has(app.id)) {
      pinApps.set(app.id, app);
    }
  }

  const pinAppsSection = document.querySelector('#personal--page .pinned--list--area');
  const pinAppsNo = document.querySelector('#pinned-apps-no');
  pinAppsNo.innerHTML = pinApps.size;
  // document.querySelector('#dash-myApps-no').innerHTML = pinAppsNo.innerHTML;

  if (pinApps.size === 0) {
    pinAppsSection.innerHTML = `<p>No apps/rooms are yet pinned by you.</p>`;
  } else {
  pinAppsSection.innerHTML = Array.from(pinApps.values()).reverse()
    .map(app => `
        <div style="position: relative; cursor: pointer; width: 20%;height: 180px;border-radius: 20px; background-color: #000; box-shadow: 0 0 10px #bbb; box-shadow: 6px 7px 10px #a5a5a5;" class="pinned-app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.appId}">
         ${app.hasOwnProperty('price') && app.price !== false && app.appType === 'premium' ? `<img src="./assets/star.png" class="premium-badge"/>` : ''}
          <div class="personal-list" style="display: flex;flex-direction: column;align-items: center;gap: 10px;position: relative;background-color: #000000;width: 100%;height: 100%;box-shadow: inset 0 0 30px #ddd; border-radius: 20px;">
            <img 
              style="transition: 300ms;border-radius: 13px;border: 0;width: 85%;position: absolute;top: 48%;transform: translateY(-61%);" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="border-radius: 20px; width: 100%;display: flex;flex-direction: column;position: absolute;
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
    personalAppsSection.innerHTML = `<p>No apps/rooms are yet added by you.</p>`;
  } else {
  personalAppsSection.innerHTML = Array.from(personalApps.values()).reverse()
    .map(app => `
        <div style="position: relative; cursor: pointer; width: 20%;height: 180px;border-radius: 20px; background-color: #000; box-shadow: 0 0 10px #bbb; box-shadow: 6px 7px 10px #a5a5a5;" class="personal-app-item reveal" data-cmd="${app.cmd}" data-id="${app.id}" id="${app.appId}">
         ${app.hasOwnProperty('price') && app.price !== false && app.appType === 'premium' ? `<img src="./assets/star.png" class="premium-badge"/>` : ''}
          <div class="personal-list" style="display: flex;flex-direction: column;align-items: center;gap: 10px;position: relative;background-color: #000000;width: 100%;height: 100%;box-shadow: inset 0 0 30px #ddd; border-radius: 20px;">
            <img 
              style="transition: 300ms;border-radius: 13px;border: 0;width: 85%;height: 67%;object-fit: cover;position: absolute;top: 48%;transform: translateY(-61%);" 
              src="${app.logo || './assets/alaric.png'}" 
              alt="App Logo"/>
            <div style="border-radius: 20px; width: 100%;display: flex;flex-direction: column;position: absolute;
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

// Call this function to fetch and display personal and premium apps
listPersonalApps();
listPremiumApps();
listPinnedApps();

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
      <li id="run-option"><img src="./assets/run.png" class="icon" />Run</li>
      <li id="copy-option"><img src="./assets/copy.png" class="icon" />Copy Pear ID</li>
      <li id="pin-option"><img src="./assets/pin.png" class="icon" />Pin</li>
      <li id="renew-option" style="display: none !important;"><img src="./assets/reload.png" class="icon" style="filter: invert(1) !important;" />Renew</li>
    </ul>
  `;
  document.body.appendChild(contextMenu);

  let selectedElement = null;

  document.addEventListener('contextmenu', (event) => {
    const targetItem = event.target.closest('.app-item, .room-item, .pinned-app-item, .personal-app-item');
    if (!targetItem) return;

    event.preventDefault();
    selectedElement = targetItem;

    const appId = selectedElement.getAttribute('data-id');
    if (pinApps.has(appId)) {
      document.getElementById('pin-option').innerHTML = '<img src="./assets/unpin.png" class="icon" />Unpin';
    } else {
      document.getElementById('pin-option').innerHTML = '<img src="./assets/pin.png" class="icon" />Pin';
    }

    if(personalApps.has(appId)){
      const app = personalApps.get(appId);
      const renewOption = document.getElementById('renew-option');
      if (app.appType === 'room') {
        renewOption.style.display = 'flex';
      } else {
        renewOption.style.display = 'none';
      }
    }

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
      const appId = selectedElement.getAttribute('data-id');
      const app = globalApps.get(appId);
      if (app.appType === 'pear') {
        runPearCommand(app.cmd);
      } else if (app.appType === 'holesail') {
        console.log('click', app.id, app.cmd);
        openHolesailPopUp(app.id, app.cmd);
      } else if (app.appType === 'room') {
        window.location.href = app.cmd;
      }
    }
    contextMenu.classList.remove('active');
  });

  document.getElementById('copy-option').addEventListener('click', () => {
    if (selectedElement) {
      const pearCmd = selectedElement.dataset.cmd;
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

  document.getElementById('pin-option').addEventListener('click', async () => {
    if (selectedElement) {
        const appId = selectedElement.getAttribute('data-id');
        const app = globalApps.get(appId);

        if (app) {
            if (pinApps.has(app.id)) {
                pinApps.delete(app.id);
                const newPinApps = [];
                for await (const pinnedApp of pinAppFeed.createReadStream()) {
                    if (pinnedApp.id !== app.id) {
                        newPinApps.push(pinnedApp);
                    }
                }
                await pinAppFeed.truncate(0); // Clear the feed
                for (const newApp of newPinApps) {
                    await pinAppFeed.append(newApp);
                }
                selectedElement.remove();
                notification(`${app.name} unpinned successfully.`, 'info');
            } else {
                await pinAppFeed.append(app);
                pinApps.set(app.id, app);
                notification(`${app.name} pinned successfully.`, 'success');
            }
        }
    }
    contextMenu.classList.remove('active');
    listPinnedApps();
});

document.getElementById('renew-option').addEventListener('click', async () => {
  if (selectedElement) {
    const appId = selectedElement.getAttribute('data-id');
    const app = personalApps.get(appId);
    console.log(app);

    if (app && app.appType === 'room') {
      await renewKeetRoomKey(app);
    }
  }
  contextMenu.classList.remove('active');
});

});

listProducts().then(displayTrendingApps);

const openPopup = (app, type = 'global') => {
  if(app.appType === 'premium') return;
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

  const renewKeetRoomKey = async (app) => {
    console.log(`Renewing Keet room key for ${app.name}...`);
  
    if (!app || app.appType !== 'room') {
      console.error('Invalid app for renewal.');
      notification('Error: Invalid room for renewal.', 'error');
      return;
    }
  
    // Ask the user for a new Keet room key
    const { value: newKeetKey } = await Swal.fire({
      title: 'Renew Keet Room Key',
      input: 'text',
      inputPlaceholder: 'Enter new Keet room key (pear://keet/...)',
      showCancelButton: true,
      customClass: {
        input: 'input',
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
        popup: "font",
      }
    });
  
    // If user cancels, do nothing
    if (!newKeetKey) {
      notification('Room key renewal cancelled.', 'info');
      return;
    }
  
    // Validate the input (it should start with "pear://keet/")
    if (!newKeetKey.startsWith('pear://keet/')) {
      notification('Invalid Keet room key format!', 'error');
      return;
    }
  
    // Update the app object in personalApps
    app.cmd = newKeetKey;
    app.createAt = Date.now(); // Update timestamp
  
    console.log(`Updated Keet room key: ${newKeetKey}`);
  
    // ✅ Update in personalApps and globalApps
    personalApps.set(app.id, app);
    globalApps.set(app.id, app); // Update globally so UI refreshes correctly
  
    // ✅ Persist the update in personalAppFeed (store the new key)
    const newPersonalApps = [];
    for await (const savedApp of personalAppFeed.createReadStream()) {
      if (savedApp.id === app.id) {
        newPersonalApps.push(app); // Add updated app
      } else {
        newPersonalApps.push(savedApp); // Keep other apps unchanged
      }
    }
  
    await personalAppFeed.truncate(0); // Clear the feed
    for (const updatedApp of newPersonalApps) {
      await personalAppFeed.append(updatedApp); // Re-save all apps with the updated room
    }
  
    // ✅ Persist update in global Hypercore storage (if needed)
    const newGlobalApps = [];
    for await (const savedApp of feed.createReadStream()) {
      if (savedApp.id === app.id) {
        newGlobalApps.push(app); // Add updated app
      } else {
        newGlobalApps.push(savedApp); // Keep others unchanged
      }
    }
  
    await feed.truncate(0); // Clear global storage
    for (const updatedApp of newGlobalApps) {
      await feed.append(updatedApp); // Save new apps list
    }
  
    // ✅ Notify the user
    notification(`Keet room key updated globally: ${newKeetKey}`, 'success');
  
    // ✅ Refresh UI
    listPersonalApps();
    listProducts(); // Refresh global apps list
  };
  
  