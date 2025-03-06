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