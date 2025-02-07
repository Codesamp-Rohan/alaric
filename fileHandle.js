document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("app-image");

  fileInput.addEventListener("change", async (e) => {
    await handleFileUpload(e);
  });

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateFile(file) || !validateFileSize(file)) {
      fileInput.value = ""; // Clear the input field if invalid
      return;
    }

    alert("File is valid! ✅");
  }

  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

  function validateFile(file) {
    if (!allowedTypes.includes(file.type)) {
      alert("Only PNG, JPG, and WebP images are allowed!");
      return false;
    }
    return true;
  }

  const maxSize = 500 * 1024;

  function validateFileSize(file) {
    if (file.size > maxSize) {
      alert("File size must be under 500KB!");
      return false;
    }
    return true;
  }
});
