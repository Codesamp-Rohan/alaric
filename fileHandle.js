document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("app-image");

  fileInput.addEventListener("change", async (e) => {
    await handleFileUpload(e);
  });

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!validateFile(file) || !validateFileSize(file) || !(await validateImageDimensions(file))) {
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

  function validateImageDimensions(file, maxWidth = 256, maxHeight = 256) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = function () {
        if (img.width > maxWidth || img.height > maxHeight) {
          alert(`Image must be ${maxWidth}x${maxHeight} pixels or smaller!`);
          resolve(false);
        } else {
          resolve(true);
        }
      };
    });
  }
});
