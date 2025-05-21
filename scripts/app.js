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
const brickRowsCount = 5;
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
            brick.style.left = brickX + "px";
            brick.style.top = brickY + "px";
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
    paddle.style.left = paddleX + "px";
}

// Ball movement
function moveBall() {
    if (isPaused) return;

    x += dx;
    y += dy;

 
    checkWallCollision();

    // Check for paddle collision. This function now handles game over directly if missed.
    checkPaddleCollision();

    // If checkPaddleCollision called gameOver(), we need to stop the animation.
    // The gameOver function will cancel animationId, so we just need to return.
    // We can check if the game message is visible to see if game over occurred.
    if (messageBox.style.display === "block" && messageBox.innerText === "GAME OVER") {
        return; 
    }

    checkBrickCollision();

    // GameOver check
    if (y + ballSize >= gameHeight) {
        gameOver();
        return;
    }

    // Updating the ball position
    ball.style.left = x + "px";
    ball.style.top = y + "px";

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
        gameOver();
        return false; // Ball missed the paddle
   }
   
   // Fallback game over if it just goes too low, regardless of paddle horizontal alignment
   if (ballTop > gameHeight) { // Or ballBottom > gameHeight  
    gameOver();
       return false;
   }

   return false; // No collision or game over yet
}


function checkBrickCollision() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowsCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                // Use stored numerical properties instead of getBoundingClientRect()
                if (
                    x + ballSize > b.x &&            // Ball's right edge past brick's left
                    x < b.x + b.width &&             // Ball's left edge past brick's right
                    y + ballSize > b.y &&            // Ball's bottom edge past brick's top
                    y < b.y + b.height               // Ball's top edge past brick's bottom
                ) {
                    dy = -dy;
                    b.status = 0;
                    b.element.style.display = "none";
                    score += 10;
                    scoreBoard.innerText = `Score: ${score}`;
                }
            }
        }
    }
}


function gameOver() {
    cancelAnimationFrame(animationId);
    messageBox.innerText = "GAME OVER";
    messageBox.style.display = "block";
}

// Handle keyboard controls
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "ArrowLeft") leftPressed = true;
    else if (e.code === "Space") {
        isPaused = !isPaused;

        if (isPaused) {
            cancelAnimationFrame(animationId);
            document.getElementById("pause-menu").style.display = "flex";
        } else {
            document.getElementById("pause-menu").style.display = "none";
            animationId = requestAnimationFrame(moveBall);
        }
    }
}

function keyUpHandler(e) {
    if (e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "ArrowLeft") leftPressed = false;
}

// Pause Menu Handlers
function showPauseMenu() {
    isPaused = true;
    cancelAnimationFrame(animationId);
    document.getElementById("pause-menu").style.display = "flex";
}

function resumeGame() {
    isPaused = false;
    document.getElementById("pause-menu").style.display = "none";
    animationId = requestAnimationFrame(moveBall);
}

function restartGame() {
    document.location.reload();
}

function quitGame() {
    isPaused = true;
    document.getElementById("pause-menu").innerHTML = "<p>Thanks for playing!</p>";
}

// Start the game
function main() {
    drawBricks();
    moveBall();
    
}
main();
