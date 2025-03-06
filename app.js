//get the canvas element and its drawing context (toolbox for drawing the canvas)
const canvas = document.getElementById("game-interface")
const ctx = canvas.getContext("2d")

//create the ball to be used first
let ballRadius = 20
let x = canvas.width / 2 // position of the ball
let y = canvas.height - 30
let dy = - 2 //speed of the ball
let dx = - 2

//function to draw the ball 
function drawBall() {
    ctx.beginPath()//starts a new path (if ! the new shapes might be connected to previous ones.)
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2) //draw a circle
    ctx.fillStyle = "#ff0" //set the color(yellow)
    ctx.fill() //inisiate the fill with the above color
    ctx.closePath()//end current path
}

//define the paddle properties(where the ball will be bouncing at during play)
let paddleHeight = 10
let paddleWidth = 100
let paddleX = (canvas.width - paddleWidth) / 2 //position the paddle in the center
let paddleY = (paddleHeight - 10) //10px above the bottom of the canvas

//fuction to draw the game paddle
function drawPaddle() {
    ctx.beginPath()
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight)
    ctx.fillStyle = "#09f" // color blue
    ctx.fill() // fill the paddle with the abpve color
    ctx.closePath() // Close the drawing path for performance optimization

}


//create the brick properties coordinates
let bricks = []; //store bricks in array
let brickWidth = 50
let brickHeight = 10
let brickRowsCount = 5
let brickColumnCount = 8
let brickPadding = 10
let brickOffSetTop = 30
let brickOffSetLeft = 30

//function to draw the bricks in the game 
function drawBricks() {
    // loop for the column of the bricks
    for (let cl = 0; cl < brickColumnCount; cl++) {
        //loop to populate the row of the bricks
        for (let rw = 0; rw < brickRowsCount; rw++) {
            //check if the brick is still active (if status = 1 #brick is visible)
            if (bricks[cl][rw].status === 1) {
                //calculate the x &y axis position of the bricks
                let brickX = cl * (brickWidth + brickPadding) + brickOffSetLeft //horizontal
                let brickY = rw * (brickHeight + brickPadding) + brickOffSetTop //vertical

                //store the above in the brick array
                bricks[cl][rw].x = brickX
                bricks[cl][rw].y = brickY

                // Draw the brick
                ctx.beginPath(); // Start a new path
                ctx.rect(brickX, brickY, brickWidth, brickHeight); // Create a rectangle for the brick
                ctx.fillStyle = "#f00"; // (red)
                ctx.fill(); // Fill the rectangle with the chosen color
                ctx.closePath(); // Close the drawing path
            }
        }
    }
}

// Controls
let rightPressed = false;
let leftPressed = false;
let isPaused = false;

document.addEventListener("keydown", keyDownHandler, false)
document.addEventListener("keykup", keyUpHandler, false)

//functions to handle the game controls (keyboard)
//when the keys are pressed by the user
function keyDownHandler(e) {
    //move paddle right
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true
    }
    
    //move paddle left
    else if (e.key === "Left" || e.key === "ArrowLeft"){
        leftPressed = true
    }

    //pause the game 
    else if (e.key === "p" || e.key === "P") {
        isPaused = true;
    }
    // Continue the game 
    else if (e.key === "c" || e.key === "C") {
        isPaused = false;
        draw(); // Resume game loop
    }
    // Restart game to start the game afresh
    else if (e.key === "r" || e.key === "R") {
        document.location.reload(); // Reload page to restart the game
    }
}

//when the keys are released by the user(not pressed)
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed =false
    }else if ( e.key === "Left" || e.key === "ArrowRight") {
        leftPressed = false
    }
}

//function to update the game
function update(){
    if (rightPressed && paddleX < canvas.width - paddleWidth){
        paddleX += 7
    }else if (leftPressed && paddleX >0 ){
        paddleX = 7;
    }
    x += dx;
    y += dy;

    //handle collision with walls
    if (x + ballRadius > canvas.width || x - ballRadius < 0) {
        dx = -dx;
    } 
    if (y-ballRadius < 0) {
        dy = -dy;
    }

    //ball collision rith paddle and bounce
    if (
        y + ballRadius > canvas.height - paddleHeight - 10 &&
        x > paddleX &&
        x < paddleX + paddleWidth
    ){
        dy = -dy; // bounce off
    }

    //ball out of bound
    if (y + ballRadius > canvas.height) {
        alert("Game Over")
        document.location.reload();
    }
    handleCollision()
}


function draw() {
    if (isPaused) {
        return; // Stop drawing if the game is paused
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    drawBricks();
    drawBall();
    drawPaddle();
    update();

    requestAnimationFrame(draw); // Keep animating unless paused
}
 draw();



