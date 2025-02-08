import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';
import { notification } from './notification';
const require = createRequire(import.meta.url);
const { exec } = require('child_process');

let permitsPath;
let pearBinaryPath;
let pearAppType;

if (os.platform() === 'darwin') {
  permitsPath = path.join(os.homedir(), 'Library', 'Application Support', 'pear', 'permits.json');
  pearBinaryPath = path.join(os.homedir(), 'Library', 'Application Support', 'pear', 'bin', 'pear');
} else if (os.platform() === 'linux') {
  permitsPath = path.join(os.homedir(), '.config', 'pear', 'permits.json');
  pearBinaryPath = 'pear';
} else if (os.platform() === 'win32') {
  permitsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pear', 'permits.json');
  pearBinaryPath = path.join(os.homedir(), 'AppData', 'Roaming', 'pear', 'bin', 'pear');
} else {
  console.error('Unsupported OS');
  permitsPath = null;
  pearBinaryPath = null;
}

function getPearInfo(pearId) {
  return new Promise((resolve) => {
    if (!pearBinaryPath) {
      console.error('Pear binary path not defined.');
      resolve(null);
      return;
    }

    exec(`"${pearBinaryPath}" dump pear://${pearId}/package.json -`, (error, stdout) => {
      if (error || !stdout.trim()) {
        console.warn(`Skipping ${pearId}: Error or no package.json found.`);
        resolve(null);
        return;
      }

      try {
        const jsonStartIndex = stdout.indexOf('{');
        const jsonEndIndex = stdout.lastIndexOf('}');
        if (jsonStartIndex === -1 || jsonEndIndex === -1) {
          console.warn(`Skipping ${pearId}: No valid JSON found.`);
          resolve(null);
          return;
        }

        const jsonString = stdout.slice(jsonStartIndex, jsonEndIndex + 1);
        const packageData = JSON.parse(jsonString);

        const pearName = packageData.name || 'Unknown';
        const pearType = packageData.pear?.type || 'Desktop';
        pearAppType = pearType;

        resolve({ pearId, pearName, pearType });
      } catch (parseErr) {
        console.warn(`Skipping ${pearId}: Error parsing JSON.`);
        resolve(null);
      }
    });
  });
}

function showLoader() {
  document.querySelector('.loader').classList.remove('hide');
}

function hideLoader() {
  document.querySelector('.loader').classList.add('hide');
}

function runPearApp(pearId) {
  const parentItem = document.querySelector(`.local-list-item[data-id="${pearId}"]`);
  const slideLoader = parentItem?.querySelector('.slide-loader');
  const appRunning = parentItem?.querySelector('.list--running');

  if (slideLoader) {
    slideLoader.classList.remove('loading');
    parentItem.classList.add('list-item-active');
    appRunning.classList.toggle('hide');
  }

  const command = `"${pearBinaryPath}" run pear://${pearId}`;
  exec(command, (error, stdout, stderr) => {
    if (slideLoader) {
      slideLoader.classList.remove('loading');
      parentItem.classList.remove('list-item-active');
      appRunning.classList.toggle('hide');
    }
    if (error) {
      console.error('Error executing pear run:', error.message);
      notification('Failed to run the pear app. Check the console for details.', 'error');
      return;
    }
    console.log('Pear run output:', stdout);
    notification(`Pear app with ID ${pearId} is removed.`, 'warning');
  });
}

async function loadPermits() {
  showLoader();

  fs.readFile(permitsPath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error reading permits.json:', err.message);
      document.querySelector('.message').classList.remove('hide');
      hideLoader();
      return;
    }

    try {
      const permits = JSON.parse(data);
      const trustedPermits = permits.trusted || [];
      const listArea = document.querySelector('.list--area');
      listArea.innerHTML = '';

      if (trustedPermits.length === 0) {
        listArea.innerHTML = '<p>No Local Pear App found.</p>';
        hideLoader();
        return;
      }

      let displayedCount = 0;
      let processedCount = 0;
      const totalPromises = trustedPermits.length;

      const pearInfoPromises = trustedPermits.map((pearId) => {
        return new Promise(async (resolve) => {
          try {
            const pear = await getPearInfo(pearId);
            if (pear) {
              const permitDiv = document.createElement('div');
              permitDiv.className = 'local-list-item';
              permitDiv.classList.add('reveal');
              permitDiv.setAttribute('data-id', pearId);
              permitDiv.innerHTML = `
              <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; cursor: pointer;">
              <div class="list--running hide"></div>
                <img style="box-shadow: inset 0 0 13px #ddd;height: 60px;width: 60px;padding: 8px;background: #000000;border-radius: 13px;border: 0" src="./assets/pear.svg" />
                <div style="display: flex; flex-direction: column;">
                  <div style="display: flex; align-items: center;gap: 10px;">
                    <p style="font-size: 18px; font-weight: 900; color: #333; white-space: nowrap;"><strong>${pear.pearName}</strong></p>
                    <p style="font-size: 11px; font-weight: 900; color:rgb(36, 117, 56); white-space: nowrap;">${pear.pearType}</p>
                  </div>
                  <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; font-size: 14px;">${pearId}</p>
                </div>
              </div>
              <div class="slide-loader">
                <svg viewBox="25 25 50 50">
                 <circle r="20" cy="50" cx="50"></circle>
                </svg>
                <!-- <p>Loading, great things take time.</p> -->
              </div>
              <div class="list--side--menu">
               <button class="slide-menu" style="background: transparent; border: 0; width: 30px; height: 30px;"><img style="width: 12px;" src="./assets/arrow.png" class="list--icon icon" /></button>
               <button class="run-cmd" data-tooltip="Run the Pear app" style="${pearAppType === 'desktop' ? `` : `opacity: 0; pointer-events: none;`}background: transparent; border: 0; width: 30px; height: 30px;">
                  <img src="./assets/run.png" style="width: 15px;" class="list--icon icon" />
                  </button>
                <button class="copy-pearID" data-tooltip="Copy Pear ID" style="background: transparent; border: 0; width: 30px; height: 30px;">
                <img src="./assets/copy.png" style="width: 15px;" class="list--icon icon" />
                </button>
              </div>
              `;

              displayedCount++;
              const localAppsNo = document.querySelector('#local-apps-no');
              localAppsNo.innerHTML = displayedCount;
              document.querySelector('#dash-local-no').innerHTML = localAppsNo.innerHTML;
              listArea.appendChild(permitDiv);
            }
          } catch (err) {
            console.error(`Failed to fetch info for pear ID: ${pearId}`, err);
          }
          processedCount++;
          if (processedCount >= totalPromises) {
            hideLoader();
          }
          resolve();
        });
      });

      await Promise.all(pearInfoPromises);
    } catch (parseErr) {
      console.error('Error parsing permits.json:', parseErr.message);
      document.querySelector('.list--area').innerHTML = `<p style="color: red;">Error parsing permits.json: ${parseErr.message}</p>`;
      hideLoader();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadPermits();

  document.addEventListener('click', (event) => {
    if (event.target.closest('.slide-menu')) {
      const clickedMenu = event.target.closest('.list--side--menu');

      document.querySelectorAll('.list--side--menu').forEach((menu) => {
        if (menu !== clickedMenu) {
          menu.classList.remove('slide-active');
          const icon = menu.querySelector('.list--icon');
          if (icon) {
            icon.style.rotate = '0deg';
          }
        }
      });

      if (clickedMenu) {
        clickedMenu.classList.toggle('slide-active');
        const icon = clickedMenu.querySelector('.list--icon');
        if (icon) {
          icon.style.rotate = clickedMenu.classList.contains('slide-active') ? '180deg' : '0deg';
        }
      }
    }
    if (event.target.closest('.run-cmd')) {
      const parentItem = event.target.closest('.local-list-item');
      if (parentItem) {
        const pearId = parentItem.getAttribute('data-id');
        runPearApp(pearId);
      }
    }
    if (event.target.closest('.copy-pearID')) {
      const parentItem = event.target.closest('.local-list-item');
      if (parentItem) {
        const pearId = parentItem.getAttribute('data-id');
        navigator.clipboard.writeText(pearId).then(
          () => {
            notification(`Pear ID ${pearId} copied to clipboard.`, 'success');
          },
          (err) => {
            console.error('Failed to copy Pear ID:', err);
            notification('Failed to copy Pear ID. Please try again.', 'error');
          }
        );
      }
    }
  });
});

function revealOnScroll() {
  let listArea = document.querySelector('#local--page');
  const localList = document.querySelectorAll('.local-list-item');

  if (!listArea) return;

  let containerRect = listArea.getBoundingClientRect();

  localList.forEach(item => {
    let itemRect = item.getBoundingClientRect();
    if (itemRect.top >= containerRect.top && itemRect.bottom <= containerRect.bottom) {
      item.classList.add('reveal');
    } else {
      item.classList.remove('reveal');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const listArea = document.querySelector('#local--page');
  if (listArea) {
    listArea.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once initially
  }
});
