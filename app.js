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