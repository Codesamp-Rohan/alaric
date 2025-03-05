import Swal from "sweetalert2";

document.getElementById("payment--form").addEventListener("click", () => displayInvoice({ name: "direct_payment", price: 5000 }));

async function generateInvoice(price) {
    try {
        Swal.fire({ title: "Generating Invoice...", text: "Please wait...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const apiEndpoint = "https://alaric-crypto.m.voltageapp.io:8080/v1/invoices";
        const requestData = { value: price, memo: "Alaric App Lightning Payment", expiry: 3600, private: true };

        const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Grpc-Metadata-macaroon": "0201036c6e6402f801030a109efb8ed5af782de76430a120d22cc8011201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620c14d9f526ee69bb72e2bfc6b538ec4e7f1acbebd024464402b16e119c581d5dc"
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        if (!data.payment_request) throw new Error("Invoice generation failed.");

        Swal.close();
        const r_hash_hex = base64ToHex(data.r_hash);
        return { payment_request: data.payment_request, r_hash: r_hash_hex };
    } catch (error) {
        Swal.fire({ title: "Error", text: error.message || "Failed to generate invoice.", icon: "error" });
        console.error("Error generating invoice:", error);
        return null;
    }
}

function base64ToHex(base64) {
    const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return [...binary].map((char) => ("0" + char.charCodeAt(0).toString(16)).slice(-2)).join("");
}

export async function displayInvoice(appData) {
    console.log("Selected App Data:", appData);

    const invoiceData = await generateInvoice(appData.price);
    if (!invoiceData) return;

    const { payment_request, r_hash } = invoiceData;
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
                    Swal.fire({ title: "Copied!", text: "Invoice copied to clipboard.", icon: "success" }).then(showQRPopup);
                }).catch(() => Swal.fire({ title: "Error", text: "Failed to copy invoice.", icon: "error" }));
            }
        });
    };

    showQRPopup();
    checkPaymentStatus(r_hash, appData.name);
}

async function checkPaymentStatus(r_hash, appName) {
    const checkEndpoint = `https://alaric-crypto.m.voltageapp.io:8080/v1/invoice/${r_hash}`;
    console.log(checkEndpoint);
    let attempts = 0;

    const interval = setInterval(async () => {
        attempts++;
        if (attempts > 12) {
            clearInterval(interval);
            console.log("Payment Timeout");
            return;
        }

        try {
            const response = await fetch(checkEndpoint, {
                method: "GET",
                headers: {
                    "Grpc-Metadata-macaroon": "0201036c6e6402f801030a109efb8ed5af782de76430a120d22cc8011201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e657261746512047265616400000620c14d9f526ee69bb72e2bfc6b538ec4e7f1acbebd024464402b16e119c581d5dc"
                }
            });

            const data = await response.json();
            console.log(data.settled);
            console.log(data.amt_paid_sat);
            if (data.amt_paid_sat > 0 || data.settled) {
                new Audio("./assets/payment_success.mp3").play();
                Swal.fire({ title: "Payment Successful!", text: `You have unlocked ${appName}!`, icon: "success" });
                unlockApp(appName);
                clearInterval(interval);
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
        }
    }, 10000);
}

function unlockApp(appName) {
    localStorage.setItem(`premium_${appName}`, "unlocked");
    Swal.fire({ title: "Access Granted", text: `Enjoy using ${appName}!`, icon: "success" });
}

function sha256(input) {
    const buffer = new TextEncoder().encode(input);
    return crypto.subtle.digest("SHA-256", buffer).then((hash) =>
        Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
    );
}


document.getElementById("payment--form").addEventListener("click", async () => {
    const price = 5000;
    const invoiceData = await generateInvoice(price);

    if (!invoiceData) return;

    const { payment_request, r_hash } = invoiceData;
    console.log("Invoice Hash:", r_hash);

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

    const r_hash_hex = base64ToHex(r_hash);
    checkPaymentStatus(r_hash_hex, "direct_payment");
});
