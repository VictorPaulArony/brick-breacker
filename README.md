# make-your-game

// git push --mirror https://github.com/VictorPaulArony/brick-breacker.git 

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


---
### **How the New Controls Work**

| **Key**         | **Function**        |
|-----------------|---------------------|
| `→` / `Right`   | Move paddle right   |
| `←` / `Left`    | Move paddle left    |
| `P`             | Pause the game      |
| `C`             | Continue the game   |
| `R`             | Restart the game    |

---
