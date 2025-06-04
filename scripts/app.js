
// Selecting the game elements
const gameArea = document.getElementById("game-interface");
const bricksContainer = document.getElementById("bricks");
const ball = document.getElementById("ball");
const paddle = document.getElementById("paddle");
const scoreBoard = document.getElementById("score");
const messageBox = document.getElementById("game-message");

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

// Gameplay
let score = 0;
let animationId;


// game state
let isGameStarted = false

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

// Reset ball position
function resetBall() {
    x = gameWidth / 2 - ballSize / 2;
    y = gameHeight - 45;
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
    if (y + ballSize >= gameHeight) {
        gameOver();
        return;
    }

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

}


function checkBrickCollision() {
     // Brick collision
     for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            let brick = bricks[c][r];
            if (brick.status === 1) {
                let brickElement = brick.element;
                let brickRect = brickElement.getBoundingClientRect();
                let gameRect = gameArea.getBoundingClientRect();
                let brickX = brickRect.left - gameRect.left;
                let brickY = brickRect.top - gameRect.top;

                if (
                    x + ballSize > brickX &&
                    x < brickX + brickWidth &&
                    y + ballSize > brickY &&
                    y < brickY + brickHeight
                ) {
                    dy = -dy;
                    brick.status = 0;
                    brickElement.style.visibility = "hidden";
                    updateScore();
                    return
                }
            }
        }
    }
}

//function to start the game 
function startGame() {
    isGameStarted = true;
    document.getElementById("start-message").style.display = "none";
    moveBall();
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    isPaused = true;
    document.location.reload();
}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    //move paddle right
    if (e.key === "ArrowRight") {
        rightPressed = true
    } else if (e.key === "ArrowLeft") {
        leftPressed = true
    } else if (e.key === "p" || e.key === "P") {
        isPaused = true;//pause the game 
    } else if (e.key === "c" || e.key === "C") {
        isPaused = false;// Continue the game 
    } else if (e.key === "r" || e.key === "R") {// Restart game to start the game afresh
        document.location.reload(); // Reload page to restart the game
    } else if (e.key === " " && !isGameStarted) {
        e.preventDefault();
        startGame();
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}


// Start the game
function main() {
    drawBricks();
    resetBall();
    
    ball.style.transform = `translate(${x}px, ${y}px)`
    paddle.style.transform = `translate(${paddleX}px, ${paddleY}px)`;

}
main();
