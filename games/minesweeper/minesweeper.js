document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const mineCountDisplay = document.getElementById('mine-count');
    const resetButton = document.getElementById('reset-button');

    // Game configuration
    const BOARD_ROWS = 10;
    const BOARD_COLS = 10;
    const NUMBER_OF_MINES = 15; // Adjust as needed

    let board = [];
    let gameOver = false;
    let revealedCells = 0;
    let flagsPlaced = 0;

    // Initialize the game
    function initializeGame() {
        gameOver = false;
        revealedCells = 0;
        flagsPlaced = 0;
        board = [];
        gameBoard.innerHTML = ''; // Clear previous board
        mineCountDisplay.textContent = `Mines: ${NUMBER_OF_MINES - flagsPlaced}`;

        gameBoard.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 1fr)`;

        createBoard();
        placeMines();
        calculateAdjacentMines();
        renderBoard();
    }

    // Create the HTML cells and initial board state
    function createBoard() {
        for (let r = 0; r < BOARD_ROWS; r++) {
            board[r] = [];
            for (let c = 0; c < BOARD_COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleCellRightClick); // For right-click
                gameBoard.appendChild(cell);

                board[r][c] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    element: cell
                };
            }
        }
    }

    // Place mines randomly on the board
    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < NUMBER_OF_MINES) {
            const r = Math.floor(Math.random() * BOARD_ROWS);
            const c = Math.floor(Math.random() * BOARD_COLS);

            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                minesPlaced++;
            }
        }
    }

    // Calculate the number of adjacent mines for each non-mine cell
    function calculateAdjacentMines() {
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                if (!board[r][c].isMine) {
                    board[r][c].adjacentMines = countMinesAround(r, c);
                }
            }
        }
    }

    // Helper function to count mines in surrounding cells
    function countMinesAround(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Skip the cell itself

                const newRow = row + dr;
                const newCol = col + dc;

                if (newRow >= 0 && newRow < BOARD_ROWS &&
                    newCol >= 0 && newCol < BOARD_COLS &&
                    board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    // Render the current state of the board in HTML
    function renderBoard() {
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const cellData = board[r][c];
                const cellElement = cellData.element;

                cellElement.classList.remove('revealed', 'mine', 'flagged', 'exploded');
                cellElement.textContent = ''; // Clear previous content

                if (cellData.isRevealed) {
                    cellElement.classList.add('revealed');
                    if (cellData.isMine) {
                        cellElement.classList.add('mine');
                        cellElement.textContent = '💣'; // Bomb emoji
                    } else if (cellData.adjacentMines > 0) {
                        cellElement.textContent = cellData.adjacentMines;
                        cellElement.classList.add(`num-${cellData.adjacentMines}`);
                    }
                } else if (cellData.isFlagged) {
                    cellElement.classList.add('flagged');
                }
            }
        }
    }

    // Handle left-click on a cell
    function handleCellClick(event) {
        if (gameOver) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const cell = board[row][col];

        if (cell.isRevealed || cell.isFlagged) return;

        if (cell.isMine) {
            cell.element.classList.add('exploded');
            revealAllMines();
            endGame(false); // Game over
        } else {
            revealCell(row, col);
            checkWinCondition();
        }
        renderBoard(); // Re-render after any change
    }

    // Recursively reveal empty cells
    function revealCell(row, col) {
        // Basic boundary and state checks
        if (row < 0 || row >= BOARD_ROWS ||
            col < 0 || col >= BOARD_COLS ||
            board[row][col].isRevealed ||
            board[row][col].isFlagged ||
            board[row][col].isMine) {
            return;
        }

        const cell = board[row][col];
        cell.isRevealed = true;
        revealedCells++;

        if (cell.adjacentMines === 0) {
            // If it's an empty cell, reveal surrounding cells
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    // Skip the cell itself
                    if (dr === 0 && dc === 0) continue;
                    revealCell(row + dr, col + dc);
                }
            }
        }
    }

    // Handle right-click (context menu) on a cell to flag/unflag
    function handleCellRightClick(event) {
        event.preventDefault(); // Prevent default context menu
        if (gameOver) return;

        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        const cell = board[row][col];

        if (cell.isRevealed) return;

        if (cell.isFlagged) {
            cell.isFlagged = false;
            flagsPlaced--;
        } else {
            // Only allow flagging if we haven't exceeded mine count
            if (flagsPlaced < NUMBER_OF_MINES) {
                cell.isFlagged = true;
                flagsPlaced++;
            }
        }
        mineCountDisplay.textContent = `Mines: ${NUMBER_OF_MINES - flagsPlaced}`;
        renderBoard(); // Re-render to show/hide flag
        checkWinCondition();
    }

    // Reveal all mines at the end of the game (on loss)
    function revealAllMines() {
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                if (board[r][c].isMine) {
                    board[r][c].isRevealed = true;
                }
            }
        }
    }

    // Check if the player has won
    function checkWinCondition() {
        const totalNonMines = (BOARD_ROWS * BOARD_COLS) - NUMBER_OF_MINES;
        if (revealedCells === totalNonMines) {
            endGame(true); // Player won!
        }
    }

    // End the game and display message
    function endGame(win) {
        gameOver = true;
        if (win) {
            mineCountDisplay.textContent = 'YOU WIN! 🎉';
            // Optionally, reveal all flagged cells to show they were correct
            for (let r = 0; r < BOARD_ROWS; r++) {
                for (let c = 0; c < BOARD_COLS; c++) {
                    if (board[r][c].isMine && board[r][c].isFlagged) {
                        board[r][c].element.classList.add('correct-flag'); // Visual cue for correct flag
                    }
                }
            }
        } else {
            mineCountDisplay.textContent = 'GAME OVER! 💥';
        }
        // Disable further clicks on cells
        gameBoard.querySelectorAll('.cell').forEach(cellElement => {
            cellElement.removeEventListener('click', handleCellClick);
            cellElement.removeEventListener('contextmenu', handleCellRightClick);
        });
    }

    // Reset button functionality
    resetButton.addEventListener('click', initializeGame);

    // Initial game setup when the page loads
    initializeGame();
});