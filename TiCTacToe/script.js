// Game state variables
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let difficulty = 'medium';
let playerScore = 0;
let aiScore = 0;
let tieScore = 0;
let isPlayerTurn = true;

// Winning combinations
const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// DOM elements
const gameSetup = document.getElementById('gameSetup');
const gameArea = document.getElementById('gameArea');
const gameBoard = document.getElementById('gameBoard');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const gameStatus = document.getElementById('gameStatus');
const gameResultOverlay = document.getElementById('gameResultOverlay');
const resultIcon = document.getElementById('resultIcon');
const resultText = document.getElementById('resultText');
const playerScoreDisplay = document.getElementById('playerScore');
const aiScoreDisplay = document.getElementById('aiScore');
const tieScoreDisplay = document.getElementById('tieScore');
const particles = document.getElementById('particles');

// Initialize the game
function init() {
    updateScoreDisplay();
    addCellEventListeners();
}

// Start a new game with selected difficulty
function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    gameSetup.style.display = 'none';
    gameArea.style.display = 'block';
    
    resetBoard();
    
    // Randomly decide who goes first
    const playerGoesFirst = Math.random() < 0.5;
    currentPlayer = 'X';
    isPlayerTurn = playerGoesFirst;
    
    if (playerGoesFirst) {
        currentPlayerDisplay.textContent = 'Your turn';
        gameStatus.textContent = `Playing against AI (${difficulty.toUpperCase()})`;
    } else {
        currentPlayerDisplay.textContent = 'AI turn';
        gameStatus.textContent = `AI goes first (${difficulty.toUpperCase()})`;
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
    
    gameActive = true;
}

// Reset the game board
function resetBoard() {
    board = ['', '', '', '', '', '', '', '', ''];
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

// Add event listeners to cells
function addCellEventListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

// Handle cell click
function handleCellClick(event) {
    const cellIndex = parseInt(event.target.getAttribute('data-index'));
    
    if (board[cellIndex] !== '' || !gameActive || !isPlayerTurn) {
        return;
    }
    
    makeMove(cellIndex, 'X');
    
    if (gameActive) {
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
}

// Make a move
function makeMove(cellIndex, player) {
    board[cellIndex] = player;
    const cell = document.querySelector(`[data-index="${cellIndex}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase(), 'placed');
    
    const result = checkGameEnd();
    if (result) {
        handleGameEnd(result);
    } else {
        switchPlayer();
    }
}

// Switch player
function switchPlayer() {
    isPlayerTurn = !isPlayerTurn;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    
    if (isPlayerTurn) {
        currentPlayerDisplay.textContent = 'Your turn';
    } else {
        currentPlayerDisplay.textContent = 'AI thinking...';
    }
}

// Make AI move based on difficulty
function makeAIMove() {
    if (!gameActive || isPlayerTurn) return;
    
    let moveIndex;
    
    switch (difficulty) {
        case 'easy':
            moveIndex = getRandomMove();
            break;
        case 'medium':
            moveIndex = getMediumMove();
            break;
        case 'hard':
            moveIndex = getHardMove();
            break;
    }
    
    if (moveIndex !== -1) {
        makeMove(moveIndex, 'O');
    }
}

// Easy AI: Random move
function getRandomMove() {
    const availableMoves = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            availableMoves.push(i);
        }
    }
    return availableMoves.length > 0 ? 
        availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
}

// Medium AI: Block player wins, otherwise random
function getMediumMove() {
    // First, try to win
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            if (checkWinner() === 'O') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // Then, try to block player
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'X';
            if (checkWinner() === 'X') {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    
    // Otherwise, random move
    return getRandomMove();
}

// Hard AI: Minimax algorithm (unbeatable)
function getHardMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    let winner = checkWinner();
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (isBoardFull()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check if board is full
function isBoardFull() {
    return board.every(cell => cell !== '');
}

// Check for winner
function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// Check game end conditions
function checkGameEnd() {
    const winner = checkWinner();
    
    if (winner) {
        // Highlight winning cells
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                document.querySelector(`[data-index="${a}"]`).classList.add('winning');
                document.querySelector(`[data-index="${b}"]`).classList.add('winning');
                document.querySelector(`[data-index="${c}"]`).classList.add('winning');
                break;
            }
        }
        return { type: 'win', winner: winner };
    } else if (isBoardFull()) {
        return { type: 'tie' };
    }
    
    return null;
}

// Handle game end
function handleGameEnd(result) {
    gameActive = false;
    
    setTimeout(() => {
        if (result.type === 'win') {
            if (result.winner === 'X') {
                showResult('win', '🎉', 'You Win!');
                playerScore++;
                createParticles('win');
            } else {
                showResult('lose', '😞', 'AI Wins!');
                aiScore++;
                createParticles('lose');
            }
        } else {
            showResult('tie', '🤝', "It's a Tie!");
            tieScore++;
            createParticles('tie');
        }
        updateScoreDisplay();
    }, 1000);
}

// Show result overlay
function showResult(type, icon, text) {
    resultIcon.textContent = icon;
    resultText.textContent = text;
    resultText.className = `result-text ${type}`;
    gameResultOverlay.classList.add('show');
}

// Create particle effects
function createParticles(type) {
    const colors = {
        win: ['#4caf50', '#8bc34a', '#cddc39'],
        lose: ['#f44336', '#e91e63', '#ff5722'],
        tie: ['#ff9800', '#ffc107', '#ffeb3b']
    };
    
    const particleColors = colors[type];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            particles.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 4000);
        }, i * 50);
    }
}

// Play again
function playAgain() {
    gameResultOverlay.classList.remove('show');
    resetBoard();
    
    // Randomly decide who goes first again
    const playerGoesFirst = Math.random() < 0.5;
    currentPlayer = 'X';
    isPlayerTurn = playerGoesFirst;
    
    if (playerGoesFirst) {
        currentPlayerDisplay.textContent = 'Your turn';
    } else {
        currentPlayerDisplay.textContent = 'AI turn';
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
    
    gameActive = true;
}

// Show difficulty selection
function showDifficultySelection() {
    gameArea.style.display = 'none';
    gameSetup.style.display = 'block';
    gameActive = false;
}

// Update score display
function updateScoreDisplay() {
    playerScoreDisplay.textContent = playerScore;
    aiScoreDisplay.textContent = aiScore;
    tieScoreDisplay.textContent = tieScore;
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);
