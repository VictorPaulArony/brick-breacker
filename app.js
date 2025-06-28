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
let ballSize = 12;
let x = 0;
let y = 0
let dx = 0;
let dy = 0;

// Paddle properties
let paddleWidth = 100;
let paddleHeight = 10;
let paddleX = (gameWidth - paddleWidth) / 2;
let paddleY = gameHeight - paddleHeight - 3;

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
let gameTime = 60;
let timerInterval;

// Game state
let isGameStarted = false;
let animationId = null;
let lastTime = 0;
let deltaTime = 0;

// Performance optimization variables
let ballTransform = '';
let paddleTransform = '';
let needsBallUpdate = false;
let needsPaddleUpdate = false;

// Create bricks with optimized DOM structure
function drawBricks() {
    bricksContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();
    
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

            fragment.appendChild(brick);
        }
    }
    bricksContainer.appendChild(fragment);
}

// Optimized paddle movement with transform caching
function movePaddle() {
    if (rightPressed && paddleX < gameWidth - paddleWidth) {
        paddleX += 7;
        needsPaddleUpdate = true;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
        needsPaddleUpdate = true;
    }
}

// Update score with optimized win condition check
function updateScore() {
    score += 10;
    scoreValue.textContent = score;

    // Check if all bricks are broken - optimized with early exit
    let allBroken = true;
    for (let c = 0; c < brickColumnCount && allBroken; c++) {
        for (let r = 0; r < brickRowsCount && allBroken; r++) {
            if (bricks[c][r].status === 1) {
                allBroken = false;
            }
        }
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
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    document.location.reload();
}

// Restart the game (new function)
function restartGame() {
    // Reset game state
    score = 0;
    lives = 3;
    gameTime = 60;
    isPaused = false;
    isGameStarted = false;
    
    // Clear timer
    clearInterval(timerInterval);
    
    // Reset UI
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;
    document.getElementById("start-message").classList.remove("hidden");
    document.getElementById("gamePause").classList.add("hidden");
    
    // Reset ball and paddle
    resetBall();
    
    // Force immediate visual update of ball and paddle positions
    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translateX(${paddleX}px)`;
    
    // Redraw bricks
    drawBricks();
    
    // Stop current game loop
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

}

// Reset ball position
function resetBall() {
    x = gameWidth / 2 - ballSize / 2;
    y = gameHeight - paddleHeight - 15;
    dx = -4;
    dy = -4;
    paddleX = (gameWidth - paddleWidth) / 2;
    needsBallUpdate = true;
    needsPaddleUpdate = true;
}

// Optimized collision detection with spatial partitioning
function checkBrickCollision() {
    // Calculate ball bounds once
    const ballLeft = x;
    const ballRight = x + ballSize;
    const ballTop = y;
    const ballBottom = y + ballSize;
    
    // Only check bricks in the ball's vertical range
    const startRow = Math.max(0, Math.floor((ballTop - brickOffsetTop) / (brickHeight + brickPadding)));
    const endRow = Math.min(brickRowsCount - 1, Math.floor((ballBottom - brickOffsetTop) / (brickHeight + brickPadding)));
    
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = startRow; r <= endRow; r++) {
            const brick = bricks[c][r];
            
            if (brick.status === 1) {
                const brickX = brick.x;
                const brickY = brick.y;
                const brickRight = brickX + brickWidth;
                const brickBottom = brickY + brickHeight;

                if (ballRight > brickX && ballLeft < brickRight && 
                    ballBottom > brickY && ballTop < brickBottom) {
                    dy = -dy;
                    brick.status = 0;
                    brick.element.style.display = 'none'; 
                    updateScore();
                    return; // Exit early after first collision
                }
            }
        }
    }
}

// Optimized ball movement with batched updates
function moveBall() {
    if (isPaused || !isGameStarted) return;

    x += dx;
    y += dy;

    // Wall collisions
    if (x <= 0 || x + ballSize >= gameWidth) dx = -dx;
    if (y <= 0) dy = -dy;

    // Paddle collision
    if (y + ballSize >= paddleY && 
        x + ballSize > paddleX && 
        x < paddleX + paddleWidth) {
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
        return;
    }

    // Check brick collisions
    checkBrickCollision();

    // Mark for update
    needsBallUpdate = true;
}

// Optimized render function with batched DOM updates
function render() {
    // Batch DOM updates to reduce layout thrashing
    if (needsBallUpdate) {
        ballTransform = `translate(${x}px, ${y}px)`;
        ball.style.transform = ballTransform;
        needsBallUpdate = false;
    }
    
    if (needsPaddleUpdate) {
        paddleTransform = `translateX(${paddleX}px)`;
        paddle.style.transform = paddleTransform;
        needsPaddleUpdate = false;
    }
}

// High-performance game loop using requestAnimationFrame
function gameLoop(currentTime) {
    if (!isPaused && isGameStarted) {
        // Calculate delta time for consistent movement
        if (lastTime === 0) lastTime = currentTime;
        deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Update game state
        moveBall();
        movePaddle();
        
        // Render changes
        render();
    }
    
    // Continue the loop
    animationId = requestAnimationFrame(gameLoop);
}

// Handle keyboard controls with optimized event handling
function keyDownHandler(e) {
    if (e.code === "Space") {
        e.preventDefault();
    }

    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.code === "Space") {
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
        document.getElementById("gamePause").classList.remove("hidden");
        clearInterval(timerInterval);
    } else {
        isPaused = false;
        document.getElementById("gamePause").classList.add("hidden");
        lastTime = 0; // Reset time for smooth resumption
        setTimeout(() => {
            timerInterval = setInterval(updateTimer, 1000);
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
    lastTime = 0; // Reset time for smooth start
    animationId = requestAnimationFrame(gameLoop);
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
    document.getElementById("gamePause").classList.add("hidden");
    resetBall();
    
    // Set initial positions
    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translateX(${paddleX}px)`;
    
    // Start the game loop immediately
    // animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Initialize the game
main();