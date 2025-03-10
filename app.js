// Selecting the game elements
const gameArea = document.getElementById("game-interface");
const bricksContainer = document.getElementById("bricks");
const ball = document.getElementById("ball");
const paddle = document.getElementById("paddle");

// Game dimensions
const gameWidth = 600;
const gameHeight = 500;

// Ball properties
let ballSize = 20;
let x = gameWidth / 2 - ballSize / 2; // Center ball horizontally
let y = gameHeight - 50; // Start above paddle
let dx = -4;
let dy = -4;

// Paddle properties
let paddleWidth = 100;
let paddleHeight = 10;
let paddleX = (gameWidth - paddleWidth) / 2;
let paddleY = gameHeight - paddleHeight - 10;

// Bricks properties
let bricks = [];
const brickWidth = 50;
const brickHeight = 10;
const brickRowsCount = 5;
const brickColumnCount = 9;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 30;

// Controls
let rightPressed = false;
let leftPressed = false;
let isPaused = false;

// Create bricks
function drawBricks() {
    bricksContainer.innerHTML = ""; // Clear existing bricks
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowsCount; r++) {
            let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            let brick = document.createElement("div");
            brick.classList.add("brick");
            brick.style.left = brickX + "px";
            brick.style.top = brickY + "px";
            bricks[c][r] = { element: brick, status: 1 };
            bricksContainer.appendChild(brick);
        }
    }
}

// Paddle movement
function movePaddle() {
    if (rightPressed && paddleX < gameWidth - paddleWidth) {
        paddleX += 10;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 10;
    }
    paddle.style.left = paddleX + "px";
}

// Ball movement and collision
function moveBall() {
    if (isPaused) return;

    x += dx;
    y += dy;

    // Wall collisions
    if (x <= 0 || x + ballSize >= gameWidth) dx = -dx;
    if (y <= 0) dy = -dy;

    // Paddle collision
    if (
        y + ballSize >= paddleY &&
        x + ballSize > paddleX &&
        x < paddleX + paddleWidth
    ) {
        dy = -dy;
    }

    // Brick collision
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                let brickLeft = b.element.offsetLeft;
                let brickTop = b.element.offsetTop;
                let brickRight = brickLeft + brickWidth;
                let brickBottom = brickTop + brickHeight;

                if (
                    x + ballSize > brickLeft &&
                    x < brickRight &&
                    y + ballSize > brickTop &&
                    y < brickBottom
                ) {
                    dy = -dy;
                    b.status = 0;
                    b.element.style.display = "none";
                }
            }
        }
    }

    // Game over check
    if (y + ballSize >= gameHeight) {
        alert("Game Over!");
        document.location.reload();
    }

    // Update ball position
    ball.style.left = x + "px";
    ball.style.top = y + "px";

    movePaddle();
    requestAnimationFrame(moveBall);
}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === "p" || e.key === "P") isPaused = true;
    else if (e.key === "c" || e.key === "C") {
        isPaused = false;
        moveBall();
    } else if (e.key === "r" || e.key === "R") {
        document.location.reload();
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}

// Start the game
function main() {
    drawBricks();
    moveBall();
}
main();
