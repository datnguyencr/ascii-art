import * as Utils from "./utils.js";

const asciiChars = "@&$%#x+:-. "; // dense → thin

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const convertBtn = document.getElementById("convertBtn");
const asciiOut = document.getElementById("ascii");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const MAX_COLS = 120;
let loadedImage = new Image();

const downloadImageBtn = document.getElementById("downloadImageBtn");
const downloadTextBtn = document.getElementById("downloadTextBtn");

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    loadedImage.onload = () => {
      const aspect = loadedImage.height / loadedImage.width;

      document.getElementById("asciiWidth").value = MAX_COLS;
      document.getElementById("asciiHeight").value = Math.round(
        MAX_COLS * aspect
      );

      if (convertBtn) convertBtn.click();
    };
    loadedImage.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", (e) => {
  if (e.target.files[0]) loadImage(e.target.files[0]);
});

dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("bg-white/10");
});
dropZone.addEventListener("dragleave", () =>
  dropZone.classList.remove("bg-white/10")
);
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("bg-white/10");
  if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
});

function scaleImageTo(w, h) {
  const temp = document.createElement("canvas");
  temp.width = w;
  temp.height = h;
  const tctx = temp.getContext("2d");
  tctx.drawImage(loadedImage, 0, 0, w, h);
  return temp;
}

convertBtn.addEventListener("click", () => {
  if (!loadedImage.src) {
    alert("Load an image first");
    return;
  }

  const asciiW = parseInt(document.getElementById("asciiWidth").value);
  const asciiH = parseInt(document.getElementById("asciiHeight").value);
  const mode = document.getElementById("mode").value;

  const scaled = scaleImageTo(asciiW, asciiH);

  canvas.width = asciiW;
  canvas.height = asciiH;
  ctx.drawImage(scaled, 0, 0);

  const imgData = ctx.getImageData(0, 0, asciiW, asciiH).data;
  let asciiText = "";

  for (let y = 0; y < asciiH; y++) {
    for (let x = 0; x < asciiW; x++) {
      const i = (y * asciiW + x) * 4;
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];

      const brightness = (r + g + b) / 3;
      const index = Math.floor((brightness / 255) * (asciiChars.length - 1));
      const char = asciiChars[index];

      asciiText +=
        mode === "color"
          ? `<span style="color:rgb(${r},${g},${b})">${char}</span>`
          : char;
    }
    asciiText += "\n";
  }

  asciiOut.innerHTML = asciiText;

  const dragTarget = asciiOut;
  dragTarget.style.cursor = "grab";

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  dragTarget.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragTarget.style.cursor = "grabbing";
    offsetX = e.clientX - dragTarget.offsetLeft;
    offsetY = e.clientY - dragTarget.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    dragTarget.style.left = `${e.clientX - offsetX}px`;
    dragTarget.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    dragTarget.style.cursor = "grab";
  });
});

downloadImageBtn.addEventListener("click", () => {
  if (!asciiOut.textContent) {
    alert("Convert an image to ASCII first!");
    return;
  }

  const asciiText = asciiOut.innerHTML;
  const mode = document.getElementById("mode").value;

  const asciiW = parseInt(document.getElementById("asciiWidth").value);
  const asciiH = parseInt(document.getElementById("asciiHeight").value);

  const maxW = window.innerWidth - 40;
  const maxH = window.innerHeight - 40;

  // compute font size that fits viewport
  const fontSize = Math.floor(Math.min(maxW / asciiW, maxH / asciiH));

  if (fontSize < 4) {
    alert("ASCII resolution too large for screen");
    return;
  }

  const asciiCanvas = document.createElement("canvas");
  asciiCanvas.width = asciiW * fontSize;
  asciiCanvas.height = asciiH * fontSize;

  const asciiCtx = asciiCanvas.getContext("2d");

  asciiCtx.fillStyle = "#ffffff";
  asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);
  asciiCtx.font = `${fontSize}px monospace`;
  asciiCtx.textBaseline = "top";

  if (mode === "color") {
    const lines = asciiText.split("\n");

    let y = 0;
    for (const line of lines) {
      let xOffset = 0;

      const spanRegex =
        /<span style="color:rgb\((\d+),(\d+),(\d+)\)">(.?)<\/span>/g;
      let match;

      while ((match = spanRegex.exec(line)) !== null) {
        const r = match[1],
          g = match[2],
          b = match[3];
        const char = match[4];
        asciiCtx.fillStyle = `rgb(${r},${g},${b})`;
        asciiCtx.fillText(char, xOffset, y);
        xOffset += fontSize;
      }

      y += fontSize;
    }
  } else {
    asciiCtx.fillStyle = "#000000";
    asciiOut.textContent.split("\n").forEach((line, i) => {
      asciiCtx.fillText(line, 0, i * fontSize);
    });
  }

  const link = document.createElement("a");
  link.href = asciiCanvas.toDataURL("image/png");
  link.download = `ascii_image_${Date.now()}.png`;
  link.click();
});

downloadTextBtn.addEventListener("click", () => {
  const text = asciiOut.textContent;
  const blob = new Blob([text], { type: "text/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ascii_${Date.now()}.txt`;
  link.click();
});
if (Utils.isProduction()) {
  Utils.enableContentProtection();
}
