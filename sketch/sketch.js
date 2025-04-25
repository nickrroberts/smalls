//set up the 16x16 grid
const container = document.getElementById("container");
const resetBtn = document.getElementById("reset");
const gridBtn = document.getElementById("grid-size");
let gridSize = 16;
let isDrawing = false;
createGrid(gridSize);



function createGrid (gridSize) {
    for (i=0; i < gridSize * gridSize; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.style.setProperty('--divisor', gridSize);   
        container.appendChild(square);
    }
    //color the squares on hover
    const hoveredSquare = document.querySelectorAll(".square");
    hoveredSquare.forEach(square => {
        square.addEventListener('mousedown', (event) => {
            //track when drawing
            isDrawing = true;
            square.style.backgroundColor = "purple";
        });
        square.addEventListener('mouseover', () => {
            if (isDrawing) {
                square.style.backgroundColor = "purple";
            }
        });
        square.addEventListener('mouseup', () => {
            isDrawing = false;
        });
    });
    // Prevent default scrolling when touching the grid
    document.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, { passive: false });

    // Touch drawing logic
    container.addEventListener("touchstart", (event) => {
        isDrawing = true;
        event.preventDefault(); // Prevents scrolling
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("square")) {
            target.style.backgroundColor = "purple";
        }
    });

    container.addEventListener("touchmove", (event) => {
        if (!isDrawing) return;
        event.preventDefault(); // Prevents scrolling
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains("square")) {
            target.style.backgroundColor = "purple";
        }
    });

    container.addEventListener("touchend", () => {
        isDrawing = false;
    });
        
};

//erase the existing grid
resetBtn.addEventListener("click", () => {
    const squaresToErase = document.querySelectorAll(".square");
    squaresToErase.forEach( square => {
        container.removeChild(square);
    });
    createGrid(gridSize);
});

//create a new grid with specified number of squares
gridBtn.addEventListener("click", () => {
    gridSize = parseInt(prompt("How big should the grid be? Enter a number from 1-100"));
    //clear and create the new grid, allowing up to 100x100, disallowing anything beyond and non-numbers 
    container.innerHTML = "";
    if (gridSize !== null && gridSize <= 100 && gridSize > 0 && typeof gridSize === 'number') {
        createGrid(gridSize);
    } else {
        alert("Please enter a valid number between 1 and 100");
    }
    
});

