import { displayInvoice } from "./generateInvoice";

document.addEventListener("DOMContentLoaded", () => {
    const premiumApps = [
        { name: "Alaric Pro", description: "Advanced features for power users.", price: '1 sat/min' },
        { name: "P2P Share Plus", description: "Enhanced peer-to-peer file sharing.", price: '1 sat/min' },
        { name: "Holesail Pro", description: "Secure decentralized web hosting.", price: '1 sat/min' },
        { name: "DrawSync", description: "Real-time collaborative drawing.", price: '1 sat/min' },
        { name: "TradeBoost", description: "P2P marketplace premium tools.", price: '1 sat/min' },
        { name: "Memory Vault", description: "Encrypted data storage & backup.", price: '1 sat/min' }
    ];

    const listArea = document.querySelector("#premium--page .list--area");
    listArea.innerHTML = "";

    const premiumNo = document.getElementById('premium-apps-no');
    premiumNo.innerText = premiumApps.length;
    document.getElementById('dash-premium-no').innerHTML = premiumNo.innerText;

    premiumApps.forEach(app => {
        const appCard = document.createElement("div");
        appCard.classList.add("premium-app");
        appCard.innerHTML = `
        <img src="./assets/alaric.png" style="height: 60px;min-width: 60px;width: 60px;border-radius: 18px;border: 0;background: #262626;padding: 4px;" />
        <div style="display: flex; flex-direction: column; justify-content: space-between; width: 100%;">
        <div style="display: flex; flex-direction: column; justify-content: space-between;">
           <p style="color: #333; font-size: 18px; font-weight: 900;">${app.name}</p>
           <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 14px;">${app.description}</p>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between;">
           <p style="font-weight: 100; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%; font-size: 14px;">Price: ${app.price}</p>
           <button class="button buy-button" data-app='${JSON.stringify(app)}' style="width: fit-content;" onclick="displayInvoice(${app.price})">1 sat/min</button>
        </div>
        </div>
        `;
        listArea.appendChild(appCard);
    });

    document.querySelectorAll(".buy-button").forEach(button => {
        button.addEventListener("click", (event) => {
            const appData = JSON.parse(event.target.getAttribute("data-app"));
            console.log(appData);
            displayInvoice(appData);
        });
    });
});
