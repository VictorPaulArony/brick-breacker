// Selecting the game elements
const gameArea = document.getElementById("game-interface");
const bricksContainer = document.getElementById("bricks");
const ball = document.getElementById("ball");
const paddle = document.getElementById("paddle");

// Scoreboard elements
const timeValue = document.getElementById("time-value");
const scoreValue = document.getElementById("score-value");
const livesValue = document.getElementById("lives-value");

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

// Game metrics
let score = 0;
let lives = 3;
let gameTime = 60; // 60 seconds countdown
let timerInterval;

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
        paddleX += 7
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    // paddle.style.left = paddleX + "px";
    paddle.style.transform = `translateX(${paddleX}px)`;
}

// Update score
function updateScore() {
    score += 10;
    scoreValue.textContent = score;
    
    // Check if all bricks are broken
    let allBroken = true;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            if (bricks[c][r].status === 1) {
                allBroken = false;
                break;
            }
        }
        if (!allBroken) break;
    }
    
    if (allBroken) {
        alert("Congratulations! You've won with a score of " + score);
        endGame();
    }
}

// Start countdown timer
function startTimer() {
    timerInterval = setInterval(() => {
        gameTime--;
        timeValue.textContent = gameTime;
        
        if (gameTime <= 0) {
            alert("Time's up! Your final score is " + score);
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    isPaused = true;
    document.location.reload();
}

// Reset ball position
function resetBall() {
    x = gameWidth / 2 - ballSize / 2;
    y = gameHeight - 50;
    dx = -4;
    dy = -4;
    paddleX = (gameWidth - paddleWidth) / 2;
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
                    updateScore();
                    
                }
            }
        }
    }

    // Game over check - lost a life
    if (y + ballSize >= gameHeight) {
        lives--;
        livesValue.textContent = lives;
        
        if (lives <= 0) {
            alert("Game Over! Your final score is " + score);
            endGame();
        } else {
            resetBall();
        }
    }

    // Update ball position
    ball.style.transform = `translate(${x}px, ${y}px)`;

    movePaddle();
    requestAnimationFrame(moveBall );
}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === "p" || e.key === "P") {
        isPaused = true;
        clearInterval(timerInterval);
    }
    else if (e.key === "c" || e.key === "C") {
        if (isPaused) {
            isPaused = false;
            startTimer();
            moveBall();
        }
    } else if (e.key === "r" || e.key === "R") {
        document.location.reload();
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}

// Initialize scoreboard
function initScoreboard() {
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;
}

// Start the game
function main() {
    initScoreboard();
    drawBricks();
    startTimer();
    moveBall();
    // requestAnimationFrame(moveBall);
}

main();