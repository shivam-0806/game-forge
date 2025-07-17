const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 500,
    backgroundColor: "#222",
    scene: {
        preload,
        create,
        update,
    }
};

let gridSize = 8;
let tileSize = 60;
let tileKeys = ["tile1", "tile2", "tile3"];
let grid = [];
let selectedTile = null;
let offsetX = (600 - gridSize * tileSize) / 2;
let offsetY = (500 - gridSize * tileSize) / 2;
let canClick = true;

function preload() {
    this.load.image("tile1", "assets/tile1-reskinned.png");
    this.load.image("tile2", "assets/tile2-reskinned.png");
    this.load.image("tile3", "assets/tile3-reskinned.png");
}

function create() {
    grid = [];
    selectedTile = null;

    for (let row = 0; row < gridSize; row++) {
        grid[row] = [];
        for (let col = 0; col < gridSize; col++) {
            spawnTile.call(this, row, col);
        }
    }
}

function spawnTile(row, col) {
    let key = Phaser.Utils.Array.GetRandom(tileKeys);
    let x = offsetX + col * tileSize + tileSize / 2;
    let y = offsetY + row * tileSize + tileSize / 2;
    let tile = this.add.image(x, y, key).setInteractive();
    tile.setData("row", row);
    tile.setData("col", col);
    tile.setData("key", key);
    tile.on("pointerdown", () => selectTile.call(this, tile));
    grid[row][col] = tile;
}

function selectTile(tile) {
    if (!canClick) return;
    if (!selectedTile) {
        selectedTile = tile;
        tile.setScale(1.2);
    } else {
        const row1 = selectedTile.getData("row");
        const col1 = selectedTile.getData("col");
        const row2 = tile.getData("row");
        const col2 = tile.getData("col");

        const isAdjacent = Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;

        if (isAdjacent) {
            swapTiles.call(this, selectedTile, tile);
            if (checkMatches()) {
                handleMatches.call(this);
            } else {
                setTimeout(() => swapTiles.call(this, tile, selectedTile), 300);
            }
        }

        selectedTile.setScale(1);
        selectedTile = null;
    }
}

function swapTiles(t1, t2) {
    const row1 = t1.getData("row");
    const col1 = t1.getData("col");
    const row2 = t2.getData("row");
    const col2 = t2.getData("col");

    [grid[row1][col1], grid[row2][col2]] = [grid[row2][col2], grid[row1][col1]];

    [t1.x, t2.x] = [t2.x, t1.x];
    [t1.y, t2.y] = [t2.y, t1.y];

    t1.setData("row", row2);
    t1.setData("col", col2);
    t2.setData("row", row1);
    t2.setData("col", col1);
}

function checkMatches() {
    let foundMatch = false;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize - 2; col++) {
            let key = grid[row][col].texture.key;
            if (grid[row][col + 1].texture.key === key &&
                grid[row][col + 2].texture.key === key) {
                grid[row][col].setData("matched", true);
                grid[row][col + 1].setData("matched", true);
                grid[row][col + 2].setData("matched", true);
                foundMatch = true;
            }
        }
    }

    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize - 2; row++) {
            let key = grid[row][col].texture.key;
            if (grid[row + 1][col].texture.key === key &&
                grid[row + 2][col].texture.key === key) {
                grid[row][col].setData("matched", true);
                grid[row + 1][col].setData("matched", true);
                grid[row + 2][col].setData("matched", true);
                foundMatch = true;
            }
        }
    }

    return foundMatch;
}

function handleMatches() {
    canClick = false;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const tile = grid[row][col];
            if (tile.getData("matched")) {
                tile.destroy();
                grid[row][col] = null;
            }
        }
    }

    setTimeout(() => {
        collapseTiles.call(this);
        refillTiles.call(this);
        canClick = true;
    }, 300);
}

function collapseTiles() {
    for (let col = 0; col < gridSize; col++) {
        for (let row = gridSize - 1; row >= 0; row--) {
            if (!grid[row][col]) {
                for (let upper = row - 1; upper >= 0; upper--) {
                    if (grid[upper][col]) {
                        grid[row][col] = grid[upper][col];
                        grid[row][col].y += (row - upper) * tileSize;
                        grid[row][col].setData("row", row);
                        grid[upper][col] = null;
                        break;
                    }
                }
            }
        }
    }
}

function refillTiles() {
    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row < gridSize; row++) {
            if (!grid[row][col]) {
                spawnTile.call(this, row, col);
            }
        }
    }

    if (checkMatches()) {
        handleMatches.call(this);
    }
}

function update() {}
new Phaser.Game(config);
