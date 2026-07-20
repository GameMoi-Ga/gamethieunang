// ==========================================
// 1. CÁC HẰNG SỐ QUY ĐỊNH HƯỚNG (8 HƯỚNG THỰC SỰ)
// ==========================================
const UP = [-1, 0];
const DOWN = [1, 0];
const LEFT = [0, -1];
const RIGHT = [0, 1];
const UP_RIGHT = [-1, 1];
const DOWN_RIGHT = [1, 1];
const DOWN_LEFT = [1, -1];
const UP_LEFT = [-1, -1];

const directions = [
    { name: '↑', val: UP }, { name: '↓', val: DOWN }, { name: '←', val: LEFT }, { name: '→', val: RIGHT },
    { name: '↗', val: UP_RIGHT }, { name: '↘', val: DOWN_RIGHT }, { name: '↙', val: DOWN_LEFT }, { name: '↖', val: UP_LEFT }
];

// Hàm AI tự động phân giải và vẽ ký hiệu mũi tên
function getArrowSymbol(dirs) {
    if (!dirs || dirs.length === 0) return '📍';
    
    // Nếu chỉ có 1 hướng
    if (dirs.length === 1) {
        let d = directions.find(d => d.val[0] === dirs[0][0] && d.val[1] === dirs[0][1]);
        return d ? d.name : '';
    }
    
    // Nếu có nhiều hướng (Ngã rẽ)
    let names = dirs.map(dir => {
        let d = directions.find(d => d.val[0] === dir[0] && d.val[1] === dir[1]);
        return d ? d.name : '';
    });

    // Xử lý mũi tên 2 chiều nếu đi đối nghịch nhau
    if (names.length === 2) {
        if (names.includes('↑') && names.includes('↓')) return '↕';
        if (names.includes('←') && names.includes('→')) return '↔';
        if (names.includes('↖') && names.includes('↘')) return '⤡';
        if (names.includes('↙') && names.includes('↗')) return '⤢';
    }
    
    // Nếu rẽ nhiều hướng khác nhau, ghép chúng lại (VD: ↑→)
    return names.join('');
}

// ==========================================
// 2. AI TỰ ĐỘNG SINH MÊ CUNG NGẪU NHIÊN
// ==========================================
function generateMaze(rows, cols, isDiamond = false) {
    let bestGrid = null;
    let maxCells = 0;

    for(let attempt = 0; attempt < 20; attempt++) {
        let grid = Array(rows).fill().map(() => Array(cols).fill({ empty: true }));
        let centerR = Math.floor(rows/2);
        let centerC = Math.floor(cols/2);
        let targetCount = 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (isDiamond) {
                    if (Math.abs(r - centerR) + Math.abs(c - centerC) <= Math.floor(rows/2)) {
                        grid[r][c] = { dirs: [], visited: false, isPath: true, empty: false };
                        targetCount++;
                    }
                } else {
                    grid[r][c] = { dirs: [], visited: false, isPath: true, empty: false };
                    targetCount++;
                }
            }
        }

        // Chọn điểm bắt đầu ngẫu nhiên
        let validStarts = [];
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                if(!grid[r][c].empty) validStarts.push({r, c});
            }
        }
        let startNode = validStarts[Math.floor(Math.random() * validStarts.length)];
        let stack = [startNode];
        grid[startNode.r][startNode.c].visited = true;
        let cellsVisited = 1;

        while(stack.length > 0) {
            let curr = stack[stack.length - 1];
            let dirs = [...directions].sort(() => Math.random() - 0.5);
            let moved = false;

            for (let d of dirs) {
                let nr = curr.r + d.val[0];
                let nc = curr.c + d.val[1];

                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isPath && !grid[nr][nc].visited) {
                    grid[curr.r][curr.c].dirs.push(d.val);
                    grid[nr][nc].visited = true;
                    stack.push({r: nr, c: nc});
                    cellsVisited++;
                    moved = true;
                    break;
                }
            }
            if (!moved) stack.pop();
        }

        if (cellsVisited > maxCells) {
            maxCells = cellsVisited;
            bestGrid = grid;
        }
        if (cellsVisited >= targetCount * 0.9) break;
    }

    // Áp dụng thuật toán format biểu tượng mũi tên
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (bestGrid[r][c].isPath && bestGrid[r][c].visited) {
                bestGrid[r][c].arrows = getArrowSymbol(bestGrid[r][c].dirs);
                delete bestGrid[r][c].visited;
                delete bestGrid[r][c].isPath;
            } else {
                bestGrid[r][c] = { empty: true };
            }
        }
    }
    return bestGrid;
}

// ==========================================
// 3. DANH SÁCH MÀN CHƠI (AI TẠO TỰ ĐỘNG)
// ==========================================
const gameLevels = [
    // Ải 1: Cố định để người chơi học luật (3x3)
    [
        [{ arrows: '→↓', dirs: [RIGHT, DOWN] }, { arrows: '→', dirs: [RIGHT] }, { arrows: '↓', dirs: [DOWN] }],
        [{ arrows: '↓', dirs: [DOWN] },          { empty: true },                { arrows: '↓←', dirs: [DOWN, LEFT] }],
        [{ arrows: '→', dirs: [RIGHT] },         { arrows: '→', dirs: [RIGHT] }, { arrows: '📍', dirs: [] }]
    ],
    generateMaze(4, 4),             // Ải 2
    generateMaze(5, 5),             // Ải 3
    generateMaze(6, 6),             // Ải 4
    generateMaze(7, 7),             // Ải 5
    generateMaze(13, 13, true)      // Ải 6 (Boss hình thoi 13x13 siêu bự)
];