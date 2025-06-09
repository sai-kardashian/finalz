const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const ruleDisplay = document.getElementById('ruleDisplay');
const ruleTimerDisplay = document.getElementById('ruleTimer');
const startButton = document.getElementById('startButton');
const messageModal = document.getElementById('messageModal');
const modalMessage = document.getElementById('modalMessage');
const closeModalButton = document.getElementById('closeModal');

const gridSize = 20; // Size of each square (snake segment, food, bomb)
let snake = [{ x: 10, y: 10 }]; // Initial snake position (head)
let food = {};
let dx = 0; // Direction x
let dy = 0; // Direction y
let score = 0;
let gameInterval;
let baseGameSpeed = 150; // Base speed in milliseconds per frame (lower is faster)
let currentGameSpeed = baseGameSpeed; // Current speed, can be modified by rules
let gameOver = true;

// Rule-related variables
const ruleDuration = 10 * 1000; // 10 seconds
let ruleTimerInterval;
let timeUntilNextRule = ruleDuration;
let currentRuleName = "None";
let invertedControls = false;
let rotatedControls = false;
let bombs = []; // Array to hold multiple bomb objects {x, y}
let foodEatenCount = 0; // Counter for food eaten to trigger bomb spawning

// Function to draw a square (used for snake, food, and bomb)
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = '#282c34'; // Border color for grid effect
    ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

// Generate random food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    } while (isOccupied(newFood.x, newFood.y)); // Ensure food doesn't spawn on snake or bomb
    food = newFood;
}

// Generate a single random bomb position and add it to the bombs array
function generateSingleBomb() {
    let newBomb;
    do {
        newBomb = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    } while (isOccupied(newBomb.x, newBomb.y)); // Ensure bomb doesn't spawn on snake, food, or other bombs
    bombs.push(newBomb);
}

// Helper to check if a grid position is occupied by snake, food, or any bomb
function isOccupied(x, y) {
    for (let i = 0; i < snake.length; i++) {
        if (x === snake[i].x && y === snake[i].y) {
            return true;
        }
    }
    if (food && x === food.x && y === food.y) {
        return true;
    }
    // Check against all existing bombs
    if (bombs.some(b => b.x === x && b.y === y)) {
        return true;
    }
    return false;
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw food
    drawSquare(food.x, food.y, 'red');

    // Draw all bombs
    bombs.forEach(b => {
        drawSquare(b.x, b.y, 'purple'); // Bomb color
    });

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        drawSquare(snake[i].x, snake[i].y, i === 0 ? 'green' : 'lime'); // Head is green, body is lime
    }
}

// Reset all rule effects to their default state
function resetRules() {
    invertedControls = false;
    rotatedControls = false;
    // Bombs are handled by the rule and ratio, so don't clear them here unless specifically needed by a rule.
    
    // Reset game speed to base speed and re-establish interval
    clearInterval(gameInterval);
    currentGameSpeed = baseGameSpeed;
    gameInterval = setInterval(update, currentGameSpeed);

    currentRuleName = "None";
    ruleDisplay.textContent = `Current Rule: ${currentRuleName}`;
}

// Apply a random rule from the list
function applyRandomRule() {
    // Only reset controls, not bombs, as bombs can persist from ratio or previous rule
    invertedControls = false;
    rotatedControls = false;

    // Reset game speed to base speed and re-establish interval
    clearInterval(gameInterval);
    currentGameSpeed = baseGameSpeed;
    gameInterval = setInterval(update, currentGameSpeed);

    const rules = [
        { name: "Speed Up!", func: () => {
            clearInterval(gameInterval);
            currentGameSpeed = baseGameSpeed * 0.7; // 30% faster
            gameInterval = setInterval(update, currentGameSpeed);
        }},
        { name: "Inverted Controls!", func: () => {
            invertedControls = true;
        }},
        { name: "Rotated Controls!", func: () => {
            rotatedControls = true;
        }},
        { name: "Bombs Swarm!", func: () => { // Changed name to reflect multiple bombs
            for (let i = 0; i < 20; i++) { // Generate 20 bombs
                generateSingleBomb();
            }
        }}
    ];

    const randomIndex = Math.floor(Math.random() * rules.length);
    const selectedRule = rules[randomIndex];

    currentRuleName = selectedRule.name;
    ruleDisplay.textContent = `Current Rule: ${currentRuleName}`;
    selectedRule.func(); // Execute the function for the selected rule
}

// Update game state (snake movement, collisions, eating)
function update() {
    if (gameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Game over conditions: hitting walls
    if (head.x < 0 || head.x >= canvas.width / gridSize ||
        head.y < 0 || head.y >= canvas.height / gridSize) {
        endGame();
        return;
    }

    // Game over conditions: hitting self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            endGame();
            return;
        }
    }

    snake.unshift(head); // Add new head to the front of the snake

    let ateSomething = false;

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
        foodEatenCount++; // Increment food eaten counter
        generateFood(); // Generate new food
        ateSomething = true;

        // Check if it's time to generate a bomb (20:1 ratio)
        if (foodEatenCount % 20 === 0) { // No need to check bomb === null, just add another
            generateSingleBomb();
        }
    }

    // Check if snake eats any bomb
    const bombIndex = bombs.findIndex(b => head.x === b.x && head.y === b.y);
    if (bombIndex !== -1) {
        // Snake eats bomb
        score = Math.max(0, score - 5); // Penalize score, ensure it doesn't go below 0
        scoreDisplay.textContent = `Score: ${score}`;
        snake.splice(Math.floor(snake.length / 2)); // Halve snake length
        bombs.splice(bombIndex, 1); // Remove the eaten bomb from the array
        ateSomething = true;
        if (snake.length < 1) { // If snake becomes too short (e.g., 1 segment halved to 0)
            endGame();
            return;
        }
    }
    
    if (!ateSomething) {
        snake.pop(); // Remove tail if no food/bomb eaten
    }

    draw(); // Redraw the game elements
}

// Handle keyboard input for changing snake direction
function changeDirection(event) {
    const keyPressed = event.keyCode;
    let newDx = dx;
    let newDy = dy;

    // Determine intended direction based on key press
    if (keyPressed === 37) { newDx = -1; newDy = 0; } // Left arrow
    if (keyPressed === 38) { newDx = 0; newDy = -1; } // Up arrow
    if (keyPressed === 39) { newDx = 1; newDy = 0; }  // Right arrow
    if (keyPressed === 40) { newDx = 0; newDy = 1; }  // Down arrow

    // Apply inverted controls if active
    if (invertedControls) {
        newDx *= -1;
        newDy *= -1;
    }

    // Apply rotated controls if active (90 degrees clockwise rotation of input)
    // Original (dx, dy) -> Rotated (dy, -dx)
    if (rotatedControls) {
        const tempDx = newDx;
        newDx = newDy;
        newDy = -tempDx;
    }

    // Prevent snake from reversing immediately (e.g., going right then pressing left)
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingLeft = dx === -1;
    const goingRight = dx === 1;

    if (!((newDx === -1 && goingRight) || // Trying to go left while going right
            (newDx === 1 && goingLeft) ||  // Trying to go right while going left
            (newDy === -1 && goingDown) || // Trying to go up while going down
            (newDy === 1 && goingUp))) {   // Trying to go down while going up
        dx = newDx;
        dy = newDy;
    }
}

// Start the game
function startGame() {
    if (!gameOver) return; // Prevent starting if game is already running

    // Reset game state
    snake = [{ x: 10, y: 10 }];
    dx = 0; // No initial movement
    dy = 0;
    score = 0;
    foodEatenCount = 0; // Reset food eaten counter
    scoreDisplay.textContent = `Score: 0`;
    gameOver = false;
    bombs = []; // Clear all bombs at start of new game
    generateFood();
    draw(); // Initial draw of snake and food

    resetRules(); // Ensure no rules are active at the start of a new game
    currentRuleName = "None"; // Explicitly set to None at start
    ruleDisplay.textContent = `Current Rule: ${currentRuleName}`;

    // Clear any existing intervals before starting new ones
    clearInterval(gameInterval);
    clearInterval(ruleTimerInterval);

    // Start the main game loop
    gameInterval = setInterval(update, currentGameSpeed);

    // Start the rule change timer
    timeUntilNextRule = ruleDuration;
    updateRuleTimerDisplay(); // Display initial timer
    ruleTimerInterval = setInterval(() => {
        timeUntilNextRule -= 1000; // Decrement by 1 second
        updateRuleTimerDisplay();
        if (timeUntilNextRule <= 0) {
            applyRandomRule(); // Apply a new rule
            timeUntilNextRule = ruleDuration; // Reset timer for next rule
        }
    }, 1000); // Update every second

    startButton.textContent = "Restart Game"; // Change button text
}

// End the game
function endGame() {
    gameOver = true;
    clearInterval(gameInterval); // Stop game loop
    clearInterval(ruleTimerInterval); // Stop rule timer
    showModal(`Game Over! Your score: ${score}`); // Show custom game over message
    startButton.textContent = "Start Game"; // Reset button text
}

// Update the display for the rule timer countdown
function updateRuleTimerDisplay() {
    ruleTimerDisplay.textContent = `Next Rule in: ${Math.ceil(timeUntilNextRule / 1000)}s`;
}

// Custom Modal for messages instead of alert()
function showModal(message) {
    modalMessage.textContent = message;
    messageModal.style.display = 'flex'; // Show the modal (using flex to center content)
}

// Event listeners
document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);
closeModalButton.addEventListener('click', () => {
    messageModal.style.display = 'none'; // Hide the modal when OK is clicked
});

// Close modal if clicked outside (optional, but good UX)
window.onclick = (event) => {
    if (event.target === messageModal) {
        messageModal.style.display = 'none';
    }
};

// Initial setup when the page loads
generateFood();
draw(); // Draw initial snake and food before game starts
updateRuleTimerDisplay(); // Display initial timer