// Selecting the game elements
const gameArea = document.getElementById("game-interface");
const bricksContainer = document.getElementById("bricks");
const ball = document.getElementById("ball");
const paddle = document.getElementById("paddle");

// Scoreboard elements
const timeValue = document.getElementById("time-value");
const scoreValue = document.getElementById("score-value");
const livesValue = document.getElementById("lives-value");

// Message/Pause UI elements
const startMessage = document.getElementById("start-message"); // Main message overlay
const pauseMenu = document.getElementById("pause-menu"); // The actual pause menu content

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

// Game state flags
let isPaused = true; // game starts paused waiting for the player to press play
let isGameStarted = false; // New game state variable
let isGameOver = false; // Indicate whether the game has ended. (win, lose, quit)

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
function updateScore(points = 10) {
    score += points;
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
       gameOver("CONGRATULATIONS! <br> You've won");
    }
}

// Start countdown timer
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTime--;
        timeValue.textContent = gameTime;

        if (gameTime <= 0) {
            gameOver("TIME'S UP!<br>Your final score is " + score);
        }
    }, 1000);
}

// End the game
function gameOver(messageText = "GAME OVER!") {
    stopAnimationLoop(); // Explicitly stop animation loop
    clearInterval(timerInterval);
    isPaused = true;
    isGameStarted = false;
    isGameOver = true;

    pauseMenu.style.display = "none";

    //Hide the ball when the game is over
    ball.style.display = "none";

    startMessage.innerHTML = `<h2>${messageText}</h2><p>Final Score: ${score} </p>`;
    startMessage.style.display = "flex";

    //After a short delay, display "Thanks for playing" message
    setTimeout(displayFinalMessage, 3000);
}

function displayFinalMessage() {
    startMessage.innerHTML = `<h2>Thanks for playing!</h2><p>Press SPACE to play again.</p>`; 
}

// Reset ball position
function resetBall() {
    // Stop any currently running animation frame if the ball is being reset
    stopAnimationLoop();
    
    x = gameWidth / 2 - ballSize / 2;
    y = gameHeight - 50;
    dx = -4;
    dy = -4;
    paddleX = (gameWidth - paddleWidth) / 2;

    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translate(${paddleX}px, ${paddleY}px)`;
    
    // Pause briefly to allow player to prepare
    isPaused = true;
    startMessage.innerHTML = `<h2>Ready?</h2><p>Press SPACEBAR to continue</p>`;
    startMessage.style.display = "flex";
    pauseMenu.style.display = "none"; 
    clearInterval(timerInterval);
}

// Logic for losing a life
function loseLife() {
    lives--; // Decrement lives
    livesValue.textContent = lives; // Update lives display

    if (lives <= 0) {
        gameOver("GAME OVER!<br>Your final score is " + score); // Game over if no lives left
    } else {
        resetBall(); // Reset for next life
    }
}

// Helper function to start the animation loop
function startAnimationLoop(){
    cancelAnimationFrame(animationId); // To ensure that it cancels all the previous requests.
    animationId = requestAnimationFrame(moveBall);
}

// Helper function to stop the animation loop
function stopAnimationLoop(){
    cancelAnimationFrame(animationId);
    animationId = null; //clea he animation id
}

// Ball movement
function moveBall() {
    if (isPaused || !isGameStarted) {
        animationId = requestAnimationFrame(moveBall); // Keep loop alive even if paused
        return;
    }
    // Check for wall collisions
    checkWallCollision();

    x += dx;
    y += dy;

    // Check for paddle collision
    checkPaddleCollision();

    // Check for brick collision
    checkBrickCollision();

    // If ball goes below game height (missed paddle or fallback)
    // Lose a life and stop processing for this frame
    if (y + ballSize >= gameHeight) {
        loseLife(); 
        return; 
    }

    // Updating the ball position using transform
    ball.style.transform = `translate(${x}px, ${y}px)`;
    movePaddle();

    animationId = requestAnimationFrame(moveBall);
}

function checkWallCollision() {
    if (x <= 0) { x = 0; dx = -dx; }
    else if (x + ballSize >= gameWidth) { x = gameWidth - ballSize; dx = -dx; }
    if (y <= 0) { y = 0; dy = -dy; }
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

        const bounceAngle = normalizedHitPoint * (Math.PI / 3);

        const ballSpeed = Math.sqrt(dx * dx + dy * dy); // Maintain current speed, or set a fixed speed like 5

        dx = -ballSpeed * Math.sin(bounceAngle);
        dy = -ballSpeed * Math.cos(bounceAngle); // Ensure it always goes upwards

        return true; // Indicate that a bounce happened
    }

    // If the ball's top edge has passed the paddle's bottom edge (meaning it missed the paddle)
    // AND it's still moving downwards (dy > 0)
    // This is the "game over" condition specific to missing the paddle.
    if (dy > 0 && isHorizontallyAligned && ballTop >= paddleBottom) { // Check horizontal alignment for clearer miss
        loseLife();
        return false;
        }
        return false; // no collision
}

// Logic for brick collision
function checkBrickCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) { // Only check active bricks
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
                    b.status = 0; // Mark brick as broken
                    b.element.style.display = "none"; // Hide brick element
                    b.element.style.willChange = 'auto'; // Hint to browser element won't change anymore

                    // Score update and win condition check
                    updateScore(); 

                    // Rebound logic for ball
                    const prevX = x - dx;
                    const prevY = y - dy;
                    const prevBallLeft = prevX;
                    const prevBallRight = prevX + ballSize;
                    const prevBallTop = prevY;
                    const prevBallBottom = prevY + ballSize;

                    let collisionOccurred = false;

                    // Determine which side of the brick was hit for more accurate bounce
                    if (prevBallBottom <= brickTop && ballBottom > brickTop) { // Hit from top of brick
                        dy = -dy;
                        y = brickTop - ballSize; // Reposition ball
                        collisionOccurred = true;
                    } else if (prevBallTop >= brickBottom && ballTop < brickBottom) { // Hit from bottom of brick
                        dy = -dy;
                        y = brickBottom; // Reposition ball
                        collisionOccurred = true;
                    }

                    if (!collisionOccurred) { // If not a top/bottom collision, check sides
                        if (prevBallRight <= brickLeft && ballRight > brickLeft) { // Hit from left side of brick
                            dx = -dx;
                            x = brickLeft - ballSize; // Reposition ball
                        } else if (prevBallLeft >= brickRight && ballLeft < brickRight) { // Hit from right side of brick
                            dx = -dx;
                            x = brickRight; // Reposition ball
                        } else {
                            dy = -dy; // Fallback, usually means a corner hit
                        }
                    }
                    return; // Only process one brick collision per frame
                }
            }
        }
    }
}


// Start the game function
function startGame() {
    if (isGameOver) {
        restartGame();
        return;
    }
    if (isGameStarted && !isPaused) { // If already running and not paused, do nothing
        return;
    }
    isGameStarted = true;
    isPaused = false;
    startMessage.style.display = "none"; 
    pauseMenu.style.display = "none";

    startTimer();
    startAnimationLoop();
    ball.style.display = '';
}

function resumeGame() {
    if (!isGameOver) { // Only allow resuming if game is not truly over
        isPaused = false;
        startMessage.style.display = "none"; // Hide any messages
        pauseMenu.style.display = "none"; // Hide the pause menu
        startTimer();
        startAnimationLoop();
    }
}

function restartGame() {
    document.location.reload(); // Reloads the page to restart the game
}

function quitGame() {
    gameOver("Thanks for playing!"); 
}

// Initialize scoreboard
function initScoreboard() {
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;
}

// Initial setup on page load
function initGame() {
    drawBricks(); // Initializes bricks
    
    // Set initial scoreboard values
    scoreValue.textContent = score;
    livesValue.textContent = lives;
    timeValue.textContent = gameTime;

    // Position ball and paddle at start
    ball.style.transform = `translate(${x}px, ${y}px)`;
    paddle.style.transform = `translate(${paddleX}px, ${paddleY}px)`;

    // Display initial "Press Space to Start" message
    startMessage.innerHTML = `<h2>Brick Breaker Game</h2><p>Press SPACEBAR to start and pause the game</p>`;
    startMessage.style.display = "flex"; // Show the start message
    pauseMenu.style.display = "none"; // Ensure pause menu is hidden initially
    isPaused = true; // Start in a paused state
    isGameStarted = false; // Not started yet
    isGameOver = false; // Not game over yet

    // Ensure that the game is not running initially
    clearInterval(timerInterval);
    stopAnimationLoop(); // Ensure animation loop is stopped initially
}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

// Handle keyboard controls - UPDATED VERSION
function keyDownHandler(e) {
    // Prevent default for spacebar to avoid page scrolling if not intended
    if (e.code === "Space") {
        e.preventDefault(); 
    }

    // Paddle movement
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    } 
    // Spacebar logic for Pause/Start
    else if (e.code === "Space") {
        if (isGameOver) {
            restartGame();
        }else if (!isGameStarted) { // Game not started yet -> Start the game
            // initGame();
            startGame();
        } else if (isGameStarted && !isPaused ) { // Game is running -> Pause and show menu
            isPaused = true;
            stopAnimationLoop(); // Stop the animaation loop explicitly.
            clearInterval(timerInterval); // Stop the timer when pausing
            pauseMenu.style.display = "flex"; // Show the pause menu
            startMessage.style.display = "none";
        } else if (isGameStarted && isPaused) { 
            if (startMessage.style.display === "flex" && startMessage.innerHTML.includes("Ready?")) {
                resumeGame();
            } else {
                // Do nothing, player must use menu buttons.
            }
        }
        else if (isGameOver) { // If game is over (win/lose/quit state), Spacebar acts as restart
            restartGame();
        }
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}

initGame();