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
let ballSize = 10;
let x = gameWidth / 2 - ballSize / 2; // Center ball horizontally
let y = gameHeight - 55; // Start above paddle
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
const brickRowsCount = 3;
const brickColumnCount = 9;
const brickPadding = 10;
const brickOffsetTop = 40;
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

// Game state
let isGameStarted = false;
let animationId = null;

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

            bricks[c][r] = {
                element: brick,
                status: 1,
                x: brickX,
                y: brickY
            };

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
    timerInterval = setInterval(updateTimer, 1000);
}
function updateTimer() {
    if (isPaused) return;

    gameTime--;
    timeValue.textContent = gameTime;

    if (gameTime <= 0) {
        alert("Time's up! Your final score is " + score);
        endGame();
    }
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
    y = gameHeight - 35;
    dx = -4;
    dy = -4;
    paddleX = (gameWidth - paddleWidth) / 2;
}

// Ball movement and collision
function moveBall() {
    if (isPaused || !isGameStarted) return;

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

    // Bottom collision (lose life)
    if (y + ballSize > gameHeight) {
        lives--;
        livesValue.textContent = lives;
        if (lives <= 0) {
            alert("Game Over! Your final score is " + score);
            endGame();
            return;
        }
        resetBall();
    }

    // Optimized Brick Collision
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            const brick = bricks[c][r];

            if (brick.status === 1) {
                const brickX = brick.x;
                const brickY = brick.y;

                if (
                    x + ballSize > brickX &&
                    x < brickX + brickWidth &&
                    y + ballSize > brickY &&
                    y < brickY + brickHeight
                ) {
                    dy = -dy;
                    brick.status = 0;
                    brick.element.classList.add("hidden"); 
                    updateScore();
                }
            }
        }
    }


    // Update ball position
    ball.style.transform = `translate(${x}px, ${y}px)`;
    movePaddle();

    // Request next frame
    // animationId = 
    requestAnimationFrame(moveBall);

}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.code === "Space") {
        e.preventDefault(); // Prevent spacebar from scrolling the page
    }

    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.code === "Space" ) {
        if (!isGameStarted) {
            startGame();
        } else if (isGameStarted && !isPaused) {
            togglePause();
        } else if (isGameStarted && isPaused) {
            togglePause();
        }
    } else if (e.code === "KeyR") {
        endGame();
    }
}
function togglePause() {
    if (!isGameStarted) return;

    if (!isPaused) {
        isPaused = true;
        // cancelAnimationFrame(moveBall());
        document.getElementById("gamePause").classList.remove("hidden");
        clearInterval(timerInterval);
    } else {
        isPaused = false;
        // cancelAnimationFrame(moveBall());
        document.getElementById("gamePause").classList.add("hidden");
        setTimeout(() => {
            timerInterval = setInterval(updateTimer, 1000);
            // animationId = requestAnimationFrame(moveBall);
            moveBall()
        }, 20);
    }
}



function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function startGame() {
    isGameStarted = true;
    document.getElementById("start-message").classList.add("hidden");
    startTimer();
    moveBall();
}


// Initialize scoreboard
function initScoreboard() {
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;
}

// Initialize game
function main() {
    drawBricks();
    // initScoreboard();
    document.getElementById("gamePause").classList.add("hidden");
    resetBall();
    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translateX(${paddleX}px)`;
}

main();