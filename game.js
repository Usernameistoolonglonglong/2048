class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.gameOver = false;
        this.gameWon = false;
        this.history = [];
        this.init();
    }

    init() {
        this.grid = Array(16).fill(0);
        this.score = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.history = [];
        this.addNewTile();
        this.addNewTile();
        this.updateUI();
    }

    addNewTile() {
        const empty = this.grid.map((val, idx) => val === 0 ? idx : null).filter(val => val !== null);
        if (empty.length === 0) return;
        const randomIndex = empty[Math.floor(Math.random() * empty.length)];
        this.grid[randomIndex] = Math.random() < 0.9 ? 2 : 4;
    }

    move(direction) {
        if (this.gameOver || this.gameWon) return;

        const oldGrid = [...this.grid];
        let moved = false;

        if (direction === 'left') moved = this.moveLeft();
        if (direction === 'right') moved = this.moveRight();
        if (direction === 'up') moved = this.moveUp();
        if (direction === 'down') moved = this.moveDown();

        if (moved) {
            this.history.push(oldGrid);
            this.addNewTile();
            this.checkGameState();
            this.updateUI();
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid.slice(i * 4, i * 4 + 4);
            const newRow = this.slideAndMerge(row);
            if (!this.arraysEqual(row, newRow)) moved = true;
            this.grid.splice(i * 4, 4, ...newRow);
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid.slice(i * 4, i * 4 + 4).reverse();
            const newRow = this.slideAndMerge(row).reverse();
            if (!this.arraysEqual(this.grid.slice(i * 4, i * 4 + 4), newRow)) moved = true;
            this.grid.splice(i * 4, 4, ...newRow);
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const col = [this.grid[i], this.grid[i + 4], this.grid[i + 8], this.grid[i + 12]];
            const newCol = this.slideAndMerge(col);
            if (!this.arraysEqual(col, newCol)) moved = true;
            this.grid[i] = newCol[0];
            this.grid[i + 4] = newCol[1];
            this.grid[i + 8] = newCol[2];
            this.grid[i + 12] = newCol[3];
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const col = [this.grid[i + 12], this.grid[i + 8], this.grid[i + 4], this.grid[i]];
            const newCol = this.slideAndMerge(col);
            if (!this.arraysEqual([this.grid[i], this.grid[i + 4], this.grid[i + 8], this.grid[i + 12]], newCol.reverse())) moved = true;
            newCol.reverse();
            this.grid[i] = newCol[0];
            this.grid[i + 4] = newCol[1];
            this.grid[i + 8] = newCol[2];
            this.grid[i + 12] = newCol[3];
        }
        return moved;
    }

    slideAndMerge(arr) {
        arr = arr.filter(val => val !== 0);
        
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr.splice(i + 1, 1);
            }
        }
        
        while (arr.length < 4) {
            arr.push(0);
        }
        
        return arr;
    }

    arraysEqual(a, b) {
        return a.every((val, idx) => val === b[idx]);
    }

    checkGameState() {
        if (this.grid.includes(2048)) {
            this.gameWon = true;
        }

        if (!this.canMove()) {
            this.gameOver = true;
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore);
            }
        }
    }

    canMove() {
        if (this.grid.includes(0)) return true;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const idx = i * 4 + j;
                const right = j < 3 ? this.grid[idx + 1] : null;
                const down = i < 3 ? this.grid[idx + 4] : null;
                
                if (right && this.grid[idx] === right) return true;
                if (down && this.grid[idx] === down) return true;
            }
        }
        return false;
    }

    undo() {
        if (this.history.length === 0) return;
        this.grid = this.history.pop();
        this.gameOver = false;
        this.gameWon = false;
        this.updateUI();
    }

    updateUI() {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile, idx) => {
            const value = this.grid[idx];
            if (value === 0) {
                tile.className = 'tile empty';
                tile.textContent = '';
            } else {
                tile.className = 'tile new';
                tile.setAttribute('data-value', value);
                tile.textContent = value;
            }
        });

        document.getElementById('score').textContent = this.score;
        document.getElementById('best').textContent = this.bestScore;

        if (this.gameWon && !this.gameOver) {
            document.getElementById('winScore').textContent = this.score;
            document.getElementById('winModal').classList.add('active');
        }

        if (this.gameOver) {
            document.getElementById('gameOverScore').textContent = this.score;
            document.getElementById('gameOverModal').classList.add('active');
        }
    }
}

// Game initialization and event handling
let game = new Game2048();

document.getElementById('newGameBtn').addEventListener('click', () => {
    document.getElementById('gameOverModal').classList.remove('active');
    document.getElementById('winModal').classList.remove('active');
    game = new Game2048();
});

document.getElementById('undoBtn').addEventListener('click', () => {
    game.undo();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        game.move('left');
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        game.move('right');
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        game.move('up');
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        game.move('down');
    }
});

// Touch support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) game.move('right');
        else game.move('left');
    } else {
        if (deltaY > 0) game.move('down');
        else game.move('up');
    }
});
