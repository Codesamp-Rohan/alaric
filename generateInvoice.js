import Swal from "sweetalert2";

document.getElementById("payment--form").addEventListener("click", () => displayInvoice());

async function generateInvoice(price) {
    try {
        Swal.fire({ title: "Generating Invoice...", text: "Please wait...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const apiEndpoint = "https://alaric-crypto.m.voltageapp.io:8080/v1/invoices";
        const requestData = { value: price, memo: "Alaric App Lightning Payment", expiry: 3600 };

        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Grpc-Metadata-macaroon": "0201036c6e64026c030a10a2fb8ed5af782de76430a120d22cc8011207383635383234331a160a0761646472657373120472656164120577726974651a0c0a04696e666f1204726561641a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620b37ed2b6dec6580aa800fa6bb64b1855820e53ad34357f60db604974181e6baa"
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        if (!data.payment_request) throw new Error("Invoice generation failed.");

        Swal.close();
        return { payment_request: data.payment_request, r_hash: data.r_hash }; // Return invoice ID too
    } catch (error) {
        Swal.fire({ title: "Error", text: error.message || "Failed to generate invoice.", icon: "error" });
        console.error("Error generating invoice:", error);
        return null;
    }
}


export async function displayInvoice(appData) {
    console.log("Selected App Data:", appData);

    const invoiceData = await generateInvoice(appData.price);
    if (!invoiceData) return;

    const { payment_request, r_hash } = invoiceData;
    console.log(r_hash);
    const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=lightning:${payment_request}`;

    const showQRPopup = () => {
        Swal.fire({
            title: `Purchase ${appData.name}`,
            text: `Pay ${appData.price} sats to access ${appData.name}.`,
            html: `<img src="${qrCodeImage}" alt="QR Code" />`,
            showCancelButton: true,
            confirmButtonText: "OK",
            cancelButtonText: "Copy Invoice",
            customClass: { confirmButton: "custom-confirm-button", cancelButton: "custom-cancel-button", popup: "font" }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel) {
                navigator.clipboard.writeText(payment_request).then(() => {
                    Swal.fire({ title: "Copied!", text: "Invoice copied to clipboard.", icon: "success", confirmButtonText: "Back to QR Code",  customClass: { confirmButton: "custom-confirm-button"} })
                        .then(showQRPopup);
                }).catch(() => Swal.fire({ title: "Error", text: "Failed to copy invoice.", icon: "error" }));
            }
        });
    };

    showQRPopup();
    checkPaymentStatus(r_hash, appData.name);
}


async function checkPaymentStatus(r_hash, appName) {
    const r_hash_hex = base64ToHex(r_hash);
    const checkEndpoint = `https://alaric-crypto.m.voltageapp.io:8080/v1/invoices/${r_hash_hex}`;

    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;
        if (attempts > 12) { // Stop polling after 60 seconds
            clearInterval(interval);
            return;
        }

        try {
            const response = await fetch(checkEndpoint, {
                method: "GET",
                headers: { "Grpc-Metadata-macaroon": "0201036c6e64026c030a10a2fb8ed5af782de76430a120d22cc8011207383635383234331a160a0761646472657373120472656164120577726974651a0c0a04696e666f1204726561641a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620b37ed2b6dec6580aa800fa6bb64b1855820e53ad34357f60db604974181e6baa" }
            });

            const data = await response.json();
            console.log("Payment Data:", data);
            if (data.settled) {
                clearInterval(interval);
                Swal.fire({
                    title: "Payment Successful!",
                    text: `You have unlocked ${appName}.`,
                    icon: "success"
                });
                unlockApp(appName); // Unlock access to the app
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        }
    }, 5000); // Check every 5 seconds
}

function unlockApp(appName) {
    localStorage.setItem(`premium_${appName}`, "unlocked");
    Swal.fire({ title: "Access Granted", text: `Enjoy using ${appName}!`, icon: "success" });
}

function base64ToHex(base64) {
    const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return [...binary].map((char) =>
        ("0" + char.charCodeAt(0).toString(16)).slice(-2)
    ).join("");
}

document.getElementById("payment--form").addEventListener("click", async () => {
    const price = 5000;
    const invoiceData = await generateInvoice(price);

    if (!invoiceData) return;

    const { payment_request, r_hash } = invoiceData;
    console.log("Invoice Hash:", r_hash);

    // const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=lightning:${payment_request}`;

    Swal.fire({
        title: `Donation QR Code`,
        text: `Pay ${price} sats via Lightning Network.`,
        html: `<img src="./assets/electrum.jpeg" style="width: 256px; height: 256px;" alt="Payment QR Code" />`,
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Copy Invoice",
        customClass: { confirmButton: "custom-confirm-button", cancelButton: 'custom-cancel-button', popup: "font" }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            navigator.clipboard.writeText(payment_request).then(() => {
                Swal.fire({ title: "Copied!", text: "Invoice copied to clipboard.", icon: "success" });
            });
        }
    });

    checkPaymentStatus(r_hash, "direct_payment");
});
