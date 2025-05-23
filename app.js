//selecting the game elements for formation
const gameArea = document.getElementById("game-interface")
const bricksContainer = document.getElementById("bricks")
const ball = document.getElementById("ball")
const paddle = document.getElementById("paddle")
const messageDisplay = document.getElementById("message")

//create the ball to be used first
let ballSize = 10
let x = 300 // position of the ball
let y = 490;
let dy = -5 //speed of the ball
let dx = -5


const gameWidth = 600;
const gameHeight = 500;

//define the paddle properties(where the ball will be bouncing at during play)
let paddleHeight = 10
let paddleWidth = 100
let paddleX = (gameWidth - paddleWidth) / 2;//position the paddle in the center
let paddleY = (gameHeight - paddleHeight - 10) //10px above the bottom of the canvas



//create the brick properties coordinates
let bricks = []; //store bricks in array
let brickWidth = 50
let brickHeight = 10
let brickRowsCount = 3
let brickColumnCount = 9
let brickPadding = 10
let brickOffSetTop = 50
let brickOffSetLeft = 30



// Controls
let rightPressed = false;
let leftPressed = false;
let isPaused = false;
let isGameStarted = false;
let isGameOver = false;


//function to draw the bricks in the game 
function drawBricks() {
    bricksContainer.innerHTML = "";
    // loop for the column of the bricks
    for (let cl = 0; cl < brickColumnCount; cl++) {
        bricks[cl] = [];
        //loop to populate the row of the bricks
        for (let rw = 0; rw < brickRowsCount; rw++) {
            let brickX = cl * (brickWidth + brickPadding) + brickOffSetLeft;
            let brickY = rw * (brickHeight + brickPadding) + brickOffSetTop;
            let brick = document.createElement("div")
            brick.classList.add("brick")
            brick.style.top = brickY + "px"
            brick.style.left = brickX + "px"
            bricks[cl][rw] = { element: brick, status: 1 }
            

            bricksContainer.appendChild(brick)

        }
    }
}

//fuction to draw the game paddle
function movePaddle() {
    if (rightPressed && paddleX < gameWidth - paddleWidth) {
        paddleX += 12;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 12;
    }
    paddle.style.left = paddleX + "px";
}

//functions to handle the game controls (keyboard)
document.addEventListener("keydown", keyDownHandler)
document.addEventListener("keyup", keyUpHandler)
//when the keys are pressed by the user
function keyDownHandler(e) {
    //move paddle right
    if (e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === "p" || e.key === "P") {
        isPaused = true; // pause the game
        showMessage("Game Paused<br>Press C to continue");
    } else if (e.key === "c" || e.key === "C") {
        if (isPaused && isGameStarted && !isGameOver) {
            isPaused = false; // Continue the game
            hideMessage();
            // requestAnimationFrame(moveBall);
            moveBall()
        }
    } else if (e.key === "r" || e.key === "R") {// Restart game
        resetGame();
    } else if (e.key === " ") { // Space bar
        if (!isGameStarted && !isGameOver) {
            startGame();
        } else if (isGameOver) {
            resetGame();
        }
    }
}

//when the keys are released by the user(not pressed)
function keyUpHandler(e) {
    if (e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "ArrowLeft") {
        leftPressed = false;
    } else if (e.key === "p" || e.key === "P") {
        // No need to handle keyup for pause as it's already handled in keydown
    } else if (e.key === "c" || e.key === "C") {
        // No need to handle keyup for continue as it's already handled in keydown
    }
}

//function to update the game
// Ball Movement and Collision
function moveBall() {
    if (isPaused || !isGameStarted || isGameOver) return; // Don't move if game not started, paused, or over

    x += dx;
    y += dy;

    // Wall collisions
    if (x <= 0 || x + ballSize >= gameWidth) {
        dx = -dx;
    }
    if (y <= 0) {
        dy = -dy;
    }

    // Paddle collision
    if (
        y + ballSize >= gameHeight - 25 &&
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
    movePaddle()
    requestAnimationFrame(moveBall);

    // Game over check
    if (y + ballSize >= gameHeight) {
        gameOver();
    }

    // Update positions
    ball.style.left = x + "px";
    ball.style.top = y+ "px";

}
function resetGame() {
    // Reset ball position
    x = 290;
    y = 450;
    dx = -4;
    dy = 4;
    
    // Reset paddle position
    paddleX = (gameWidth - paddleWidth) / 2;
    
    // Reset game state
    isGameStarted = false;
    isGameOver = false;
    isPaused = false;
    
    // Redraw everything
    drawBricks();
    ball.style.left = x + "px";
    ball.style.top = y + "px";
    paddle.style.left = paddleX + "px";
    
    // Show start message
    showMessage("Press SPACE to start");
}

function startGame() {
    isGameStarted = true;
    hideMessage();
    moveBall();
}

function gameOver() {
    isGameOver = true;
    showMessage("Game Over!<br>Press SPACE to restart");
}

function showMessage(text) {
    messageDisplay.innerHTML = text;
    messageDisplay.style.display = "block";
}

function hideMessage() {
    messageDisplay.style.display = "none";
}

function main() {
    resetGame();
    moveBall();
}
main()



