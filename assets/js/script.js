const asciiChars = "@&$%#x+:-. "; // dense → thin

const imgInput = document.getElementById("imgInput");
const convertBtn = document.getElementById("convertBtn");
const asciiOut = document.getElementById("ascii");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let loadedImage = null;
const downloadImageBtn = document.getElementById("downloadImageBtn");
const downloadTextBtn = document.getElementById("downloadTextBtn");


// Load image
imgInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        loadedImage = img;

        document.getElementById("asciiWidth").value = img.width;
        document.getElementById("asciiHeight").value = img.height;
    };

    img.src = URL.createObjectURL(file);
});

// Scale to exact width/height
function scaleImageTo(w, h) {
    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    temp.getContext("2d").drawImage(loadedImage, 0, 0, w, h);
    return temp;
}

// Convert to ASCII
convertBtn.addEventListener("click", () => {
    if (!loadedImage) {
        alert("Load an image first");
        return;
    }

    const asciiW = parseInt(document.getElementById("asciiWidth").value);
    const asciiH = parseInt(document.getElementById("asciiHeight").value);
    const mode = document.getElementById("mode").value;

    // Scale image to exact user size
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

            if (mode === "color") {
                asciiText += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
            } else {
                asciiText += char;
            }
        }
        asciiText += "\n";
    }

    asciiOut.innerHTML = asciiText;
    const dragTarget = asciiOut;
    dragTarget.style.position = "absolute"; // required to move
    dragTarget.style.cursor = "grab";

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    dragTarget.addEventListener("mousedown", e => {
        isDragging = true;
        dragTarget.style.cursor = "grabbing";
        offsetX = e.clientX - dragTarget.offsetLeft;
        offsetY = e.clientY - dragTarget.offsetTop;
    });

    document.addEventListener("mousemove", e => {
        if (!isDragging) return;
        dragTarget.style.left = `${e.clientX - offsetX}px`;
        dragTarget.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
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

    const asciiCanvas = document.createElement("canvas");
    const asciiW = parseInt(document.getElementById("asciiWidth").value);
    const asciiH = parseInt(document.getElementById("asciiHeight").value);
    const fontSize = 12;
    asciiCanvas.width = asciiW * fontSize;
    asciiCanvas.height = asciiH * fontSize;
    const asciiCtx = asciiCanvas.getContext("2d");

    asciiCtx.fillStyle = "#ffffff";
    asciiCtx.fillRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    asciiCtx.font = `${fontSize}px monospace`;
    asciiCtx.textBaseline = "top";

    if (mode === "color") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = asciiText;
        const lines = tempDiv.innerHTML.split("\n");

        for (let y = 0; y < lines.length; y++) {
            const line = lines[y];
            let xOffset = 0;
            const spanRegex = /<span style="color:rgb\((\d+),(\d+),(\d+)\)">(.?)<\/span>/g;
            let match;
            while ((match = spanRegex.exec(line)) !== null) {
                const r = match[1],
                    g = match[2],
                    b = match[3];
                const char = match[4];
                asciiCtx.fillStyle = `rgb(${r},${g},${b})`;
                asciiCtx.fillText(char, xOffset, y * fontSize);
                xOffset += fontSize;
            }
        }
    } else {
        const lines = asciiOut.textContent.split("\n");
        asciiCtx.fillStyle = "#000000";
        lines.forEach((line, y) => asciiCtx.fillText(line, 0, y * fontSize));
    }
    const timestamp = Date.now();
    const link = document.createElement("a");
    link.href = asciiCanvas.toDataURL("image/png");
    link.download = `ascii_image_${timestamp}.png`;
    link.click();
});

downloadTextBtn.addEventListener("click", () => {
    const text = asciiOut.textContent;
    const blob = new Blob([text], {
        type: "text/plain"
    });
    const timestamp = Date.now();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `ascii_${timestamp}.txt`;
    link.click();
});