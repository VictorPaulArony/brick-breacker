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
let y = gameHeight - 50; // Start above paddle
let dx = -4;
let dy = -4;



// Paddle properties
let paddleWidth = 100;
let paddleHeight = 10;
let paddleX = (gameWidth - paddleWidth) / 2;
let paddleY = gameHeight - paddleHeight - 30;

// Bricks properties
let bricks = [];
const brickWidth = 50;
const brickHeight = 10;
const brickRowsCount = 3;
const brickColumnCount = 9;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 30;

// Controls
let rightPressed = false;
let leftPressed = false;
let isPaused = false;
let isGameStarted = false; // New game state variable

// Game metrics
let score = 0;
let lives = 3;
let gameTime = 60; // 60 seconds countdown
let timerInterval;


// Gameplay
let animationId;
let hasBounced = false;

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
            brick.style.transform = `translate(${brickX}px, ${brickY}px)`;
            bricks[c][r] = {
                element: brick,
                status: 1,
                x: brickX,
                y: brickY,
                width: brickWidth,
                height: brickHeight
            };
            bricksContainer.appendChild(brick);
        }
    }
}

// Paddle movement
function movePaddle() {
    if (rightPressed && paddleX < gameWidth - paddleWidth) {
        paddleX += 8;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 8;
    }
    paddle.style.transform = `translate(${paddleX}px, ${paddleY}px)`;
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


// Ball movement
function moveBall() {
    if (isPaused || !isGameStarted) {
        animationId = requestAnimationFrame(moveBall); // Keep loop alive even if paused
        return;
    }
    x += dx;
    y += dy;

    checkWallCollision();
    checkPaddleCollision();
    checkBrickCollision();

    // GameOver check
    // if (y + ballSize >= gameHeight) {
    //     endGame();
    //     return;
    // }

    // Updating the ball position using transform
    ball.style.transform = `translate(${x}px, ${y}px)`;

    movePaddle();
    animationId = requestAnimationFrame(moveBall);
}

function checkWallCollision() {
    if (x <= 0 || x + ballSize >= gameWidth) dx = -dx;
    if (y <= 0) dy = -dy;
}

function checkPaddleCollision() {
    const ballTop = y;
    const ballBottom = y + ballSize;
    const ballLeft = x;
    const ballRight = x + ballSize;
    const ballCenterX = x + ballSize / 2;

    const paddleTop = paddleY;
    const paddleBottom = paddleY + paddleHeight;
    const paddleLeft = paddleX;
    const paddleRight = paddleX + paddleWidth;

    // First, check if the ball is even in the horizontal range of the paddle
    const isHorizontallyAligned = (ballRight > paddleLeft && ballLeft < paddleRight);

    // If the ball is moving downwards (dy > 0)
    // AND it's horizontally aligned with the paddle
    // AND its bottom edge has crossed or is about to cross the paddle's top edge
    // AND its top edge is still above the paddle's bottom edge (to prevent hitting from below)
    if (dy > 0 && isHorizontallyAligned && ballBottom >= paddleTop && ballTop < paddleBottom) {

        // 1. Reposition the ball exactly on top of the paddle
        y = paddleY - ballSize;

        // 2. Reverse vertical direction
        // dy = -dy; // We'll set dy dynamically for angle

        // 3. Calculate bounce angle and new dx, dy
        const hitPoint = (ballCenterX - paddleLeft) / paddleWidth; // 0 (left) to 1 (right)
        const normalizedHitPoint = (hitPoint * 2) - 1; // -1 (left) to 1 (right)

        // Adjust this angle factor for desired bounce spread. Math.PI/3 is good for 60-degree max spread.
        const bounceAngle = normalizedHitPoint * (Math.PI / 3);

        // Set a consistent speed after paddle hit. You can adjust this.
        const ballSpeed = Math.sqrt(dx * dx + dy * dy); // Maintain current speed, or set a fixed speed like 5

        dx = ballSpeed * Math.sin(bounceAngle);
        dy = -ballSpeed * Math.cos(bounceAngle); // Ensure it always goes upwards
        return true; // Indicate that a bounce happened
    }

    // If the ball's top edge has passed the paddle's bottom edge (meaning it missed the paddle)
    // AND it's still moving downwards (dy > 0)
    // This is the "game over" condition specific to missing the paddle.
    if (dy > 0 && isHorizontallyAligned && ballTop >= paddleBottom) { // Check horizontal alignment for clearer miss
        lives--;
        livesValue.textContent = lives;
        if (lives <= 0) {
            alert("Game Over! Your final score is " + score);
            endGame();
            return;
        }
        resetBall();
        return false; // Ball missed the paddle
    }

    // Fallback game over if it just goes too low, regardless of paddle horizontal alignment
    if (ballTop > gameHeight) { // Or ballBottom > gameHeight  
        lives--;
        livesValue.textContent = lives;
        if (lives <= 0) {
            alert("Game Over! Your final score is " + score);
            endGame();
            return;
        }
        resetBall();
        return false;
    }

    return false; // No collision or game over yet
}

function checkBrickCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                const ballLeft = x;
                const ballRight = x + ballSize;
                const ballTop = y;
                const ballBottom = y + ballSize;

                const brickLeft = b.x;
                const brickRight = b.x + b.width;
                const brickTop = b.y;
                const brickBottom = b.y + b.height;

                const isOverlapping = (
                    ballRight > brickLeft &&
                    ballLeft < brickRight &&
                    ballBottom > brickTop &&
                    ballTop < brickBottom
                );

                if (isOverlapping) {
                    b.status = 0;
                    b.element.style.display = "none";
                    b.element.style.willChange = 'auto';

                    let collisionOccurred = false;

                    const prevX = x - dx;
                    const prevY = y - dy;
                    const prevBallLeft = prevX;
                    const prevBallRight = prevX + ballSize;
                    const prevBallTop = prevY;
                    const prevBallBottom = prevY + ballSize;

                    if (prevBallBottom <= brickTop && ballBottom > brickTop) {
                        dy = -dy;
                        y = brickTop - ballSize;
                        collisionOccurred = true;
                    } else if (prevBallTop >= brickBottom && ballTop < brickBottom) {
                        dy = -dy;
                        y = brickBottom;
                        collisionOccurred = true;
                    }

                    if (!collisionOccurred) {
                        if (prevBallRight <= brickLeft && ballRight > brickLeft) {
                            dx = -dx;
                            x = brickLeft - ballSize;
                        } else if (prevBallLeft >= brickRight && ballLeft < brickRight) {
                            dx = -dx;
                            x = brickRight;
                        } else {
                            dy = -dy; // Fallback
                            
                        }
                    }
                    updateScore();

                    // Check for win condition (all bricks broken)
                    let allBricksBroken = true;
                    for (let c = 0; c < brickColumnCount; c++) {
                        for (let r = 0; r < brickRowsCount; r++) {
                            if (bricks[c][r].status === 1) {
                                allBricksBroken = false;
                                break;
                            }
                        }
                        if (!allBricksBroken) break;
                    }

                    if (allBricksBroken) {
                        alert("Congratulations! You've won with a score of " + score);
                        endGame();
                        return;
                    }
                }
            }
        }
    }
}



// Start the game function
function startGame() {
    isGameStarted = true;
    isPaused = false;
    document.getElementById("start-message").style.display = "none";
    startTimer();
    moveBall();
}

// Initialize scoreboard
function initScoreboard() {
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;
}

// Handle keyboard controls - UPDATED VERSION
function keyDownHandler(e) {
    // Move paddle right
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "p" || e.key === "P") {
        // Pause the game (only if game is started and not already paused)
        if (isGameStarted && !isPaused) {
            isPaused = true;
            cancelAnimationFrame(animationId);

        }
    } else if (e.key === "c" || e.key === "C") {
        // Continue the game (only if game is paused)
        if (isGameStarted && isPaused) {
            isPaused = false;
            animationId = requestAnimationFrame(moveBall);
        }
    } else if (e.key === "r" || e.key === "R") {
        // Restart game to start the game afresh
        document.location.reload(); // Reload page to restart the game
    } else if (e.key === " " && !isGameStarted) {
        // Start game with spacebar (only if game hasn't started yet)
        e.preventDefault();
        startGame();
    } else if (e.code === "Space" && isGameStarted) {
        // Original spacebar pause functionality (when game is running)
        if (!isPaused) {
            isPaused = true;
            cancelAnimationFrame(animationId);

        }
    }
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}


// Start the game
function main() {
    drawBricks();
    initScoreboard();
    resetBall();

    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translate(${paddleX}px, ${paddleY}px)`;
}

main();