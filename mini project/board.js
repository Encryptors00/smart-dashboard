const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let tool = 'pen';
let color = '#000';
let lineWidth = 2;
let isDrawing = false;
let startX, startY;
let pages = [{ image: null }];
let currentPage = 0;

// Tool selection functions
function selectTool(selectedTool) {
    tool = selectedTool;
}

function changeColor() {
    color = document.getElementById("colorPicker").value;
    ctx.strokeStyle = color;
}

function changeLineWidth(newWidth) {
    lineWidth = newWidth;
}

// Canvas drawing events
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);

function startDraw(e) {
    isDrawing = true;
    startX = e.offsetX;
    startY = e.offsetY;

    if (tool === 'pen' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!isDrawing) return;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;

    if (tool === 'pen' || tool === 'eraser') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (tool === 'rectangle' || tool === 'circle') {
        // Temporarily clear the canvas to redraw the shape during mouse movement
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCurrentPage();

        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        if (tool === 'rectangle') {
            ctx.strokeRect(startX, startY, width, height);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            ctx.beginPath();
            ctx.arc(startX + width / 2, startY + height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function endDraw() {
    if (tool === 'rectangle' || tool === 'circle') {
        // Draw the final shape
        drawCurrentPage(); // Ensure we don’t lose any existing content
        const width = event.offsetX - startX;
        const height = event.offsetY - startY;

        if (tool === 'rectangle') {
            ctx.strokeRect(startX, startY, width, height);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            ctx.beginPath();
            ctx.arc(startX + width / 2, startY + height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    isDrawing = false;
    saveCurrentPage();
}

// Save the current canvas content as an image
function saveCurrentPage() {
    pages[currentPage].image = canvas.toDataURL("image/png");
}

// Load the saved image for the current page
function drawCurrentPage() {
    if (pages[currentPage].image) {
        const img = new Image();
        img.src = pages[currentPage].image;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    } else {
        clearBoard();
    }
}

// Page Navigation
function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        loadPage();
    }
}

function nextPage() {
    if (currentPage < pages.length - 1) {
        currentPage++;
    } else {
        pages.push({ image: null });
        currentPage++;
    }
    loadPage();
}

function goToPage() {
    const pageInput = parseInt(document.getElementById("pageNumber").value) - 1;
    if (pageInput >= 0 && pageInput < pages.length) {
        currentPage = pageInput;
        loadPage();
    }
    updatePageControls();
}

function loadPage() {
    clearBoard();
    drawCurrentPage();
    updatePageControls();
}

function updatePageControls() {
    document.getElementById("pageNumber").value = currentPage + 1;
    document.getElementById("totalPages").textContent = pages.length;
}

// Clear and Save
function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveBoard() {
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = `whiteboard_page_${currentPage + 1}.png`;
    link.click();
}

// Document Upload
function uploadDocument() {
    document.getElementById("fileUpload").click();
}

function loadDocument(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            saveCurrentPage();
        };
    };
    reader.readAsDataURL(file);
}

// Text Tool
canvas.addEventListener("dblclick", addText);

function addText(e) {
    if (tool === 'text') { 
        const text = prompt("Enter text:");
        if (text) {
            ctx.font = `${lineWidth * 10}px Arial`;
            ctx.fillStyle = color;
            ctx.fillText(text, e.offsetX, e.offsetY);
            saveCurrentPage();
        }
    }
}
