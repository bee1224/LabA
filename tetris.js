const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const modal = document.getElementById("myModal");
const instructionsButton = document.getElementById("instructions");
const span = document.getElementsByClassName("close")[0];

ctx.scale(20, 20);

let holdPiece = null;
let canHold = true;

startButton.addEventListener("click", () => {
    playerReset();
    update();
    startButton.style.display = "none";
});

resetButton.addEventListener("click", () => {
    location.reload();
});

instructionsButton.addEventListener("click", () => {
    modal.style.display = "block";
});

span.addEventListener("click", () => {
    modal.style.display = "none";
});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

const field = createMatrix(12, 20);
console.log(field);
console.table(field);

const player = {
    pos: { x: 5, y: -2 },
    piece: [[0]],
    score: 0,
};

function drawPiece(piece, offset, context) {
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.lineWidth = 0.05;
                context.strokeStyle = 'white';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPiece(field, { x: 0, y: 0 }, ctx);
    drawPiece(player.piece, player.pos, ctx);
    drawHold();
}

const holdCanvas = document.getElementById("hold");
const holdCtx = holdCanvas.getContext("2d");
holdCtx.scale(20, 20);

function drawHold() {
    holdCtx.fillStyle = "#000";
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (holdPiece) {
    
        drawPiece(holdPiece, {x: 1, y: 1}, holdCtx);
    }
}


let dCounter = 0;
let dropInterval = 500;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dCounter += deltaTime;
    if (dCounter > dropInterval) {
        playerDrop();
    }

    draw();
    drawHold();
    requestAnimationFrame(update);
}

function join(field, player) {
    player.piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                field[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(field, player) {
    const b = player.piece;
    const o = player.pos;
    for (let y = 0; y < b.length; y++) {
        for (let x = 0; x < b[y].length; x++) {
            if (b[y][x] !== 0 && (field[y + o.y] && field[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

document.addEventListener("keydown", (e) => {
    if (e.keyCode === 37) {
        playerMove(-1);
    } else if (e.keyCode === 39) {
        playerMove(+1);
    } else if (e.keyCode === 40) {
        playerDrop();
    } else if (e.keyCode === 90) {
        const dir = e.keyCode === 90 ? -1 : 1;
        playerRotate(dir);
    } else if (e.keyCode === 32) {
        hardDrop();
    } else if (e.keyCode === 67) {
        playerHold();
    }
    });

function rotate(piece, control) {
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < y; x++) {
            [piece[x][y], piece[y][x]] = [piece[y][x], piece[x][y]];
        }
    }
    if (control > 0) {
        piece.forEach((row) => row.reverse());
    } else {
        piece.reverse();
    }
}

function playerReset() {
    canHold = true;

    const pieces = 'ILJOTSZ';
    player.piece = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (field[0].length / 2 | 0) - (player.piece[0].length / 2 | 0);

    if (collide(field, player)) {
        // Game Over 邏輯
        field.forEach(row => row.fill(0));
        score = 0;
        updateScore();
    }
}


let score = 0;
const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // L
    '#FFE138', // J
    '#3877FF', // O
];

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    }
    else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    }
    else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    }
    else if (type === 'T') {
        return [
            [5, 5, 5],
            [0, 5, 0],
            [0, 0, 0],

        ];
    }
    else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }
    else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function fieldSweep() {
    let rowCount = 1;
    outer: for (let y = field.length - 1; y > 0; --y) {
        for (let x = 0; x < field[y].length; ++x) {
            if (field[y][x] === 0) {
                continue outer;
            }
        }
        // 找到滿行，將其移出並補一個空行在最上方
        const row = field.splice(y, 1)[0].fill(0);
        field.unshift(row);
        ++y;

        score += rowCount * 10;
        rowCount *= 2; // 連續消行分數翻倍
    }
    updateScore();
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = "Score: " + score;
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(field, player)) {
        player.pos.y--;
        join(field, player);
        playerReset(); // 統一在這裡重置方塊
        fieldSweep();  // 統一在這裡檢查消行
        updateScore();
    }
    dCounter = 0; // 重置自然下落的計時器
}

function hardDrop() {
    while (!collide(field, player)) {
        player.pos.y++;
    }
    player.pos.y--; // 退回最後一個不碰撞的位置
    join(field, player);
    fieldSweep();
    playerReset();
    updateScore();
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(field, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.piece, dir);
    // 踢牆判定：旋轉後如果碰撞，嘗試左右移動來找空間
    while (collide(field, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.piece[0].length) {
            rotate(player.piece, -dir); // 旋轉失敗，轉回來
            player.pos.x = pos;
            return;
        }
    }
}

function playerHold() {
    if (!canHold) return; // 如果這回合換過了，就不給換

    if (holdPiece === null) {
        // 第一次換：把當前方塊存起來，重置一個新的
        holdPiece = player.piece;
        playerReset();
    } else {
        // 非第一次：當前方塊與保留方塊對調
        const temp = player.piece;
        player.piece = holdPiece;
        holdPiece = temp;

        // 重置位置到頂部中央
        player.pos.y = 0;
        player.pos.x = (field[0].length / 2 | 0) - (player.piece[0].length / 2 | 0);
    }

    canHold = false; // 鎖定，直到下次方塊落地 (playerReset) 才能再用
}