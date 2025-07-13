import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const MatchThreeGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        class Match3Scene extends Phaser.Scene {
            gridSize = 8;
            tileSize = 60;
            grid: (Phaser.GameObjects.Image | null)[][] = [];
            selectedTile: Phaser.GameObjects.Image | null = null;
            tileKeys = ["tile1", "tile2", "tile3"];
            offsetX = (600 - 8 * 60) / 2;
            offsetY = (500 - 8 * 60) / 2;

            preload() {
                this.load.image("tile1", "/Game Assets/tile1.png");
                this.load.image("tile2", "/Game Assets/tile2.png");
                this.load.image("tile3", "/Game Assets/tile3.png");
            }

            create() {
                this.cameras.main.setBackgroundColor("#222");

                for (let row = 0; row < this.gridSize; row++) {
                    this.grid[row] = [];
                    for (let col = 0; col < this.gridSize; col++) {
                        const key = Phaser.Math.RND.pick(this.tileKeys);
                        const tile = this.add.image(
                            this.offsetX + col * this.tileSize + this.tileSize / 2,
                            this.offsetY + row * this.tileSize + this.tileSize / 2,
                            key
                        )
                            .setDisplaySize(this.tileSize - 4, this.tileSize - 4)
                            .setInteractive();

                        (tile as any).row = row;
                        (tile as any).col = col;
                        (tile as any).key = key;

                        this.grid[row][col] = tile;
                    }
                }

                // this.input.on("gameobjectdown", (pointer, gameObject) => {
                //     this.handleClick(gameObject);
                // });

                this.input.on("gameobjectdown", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
                    this.handleClick(gameObject);
                });


                // Clear initial matches
                this.time.delayedCall(100, () => {
                    const matches = this.findMatches();
                    if (matches.length > 0) this.removeMatches(matches);
                });
            }

            handleClick(tile: Phaser.GameObjects.GameObject) {
                if (!(tile instanceof Phaser.GameObjects.Image)) return;

                if (!this.selectedTile) {
                    this.selectedTile = tile;
                    tile.setScale(1.1);
                    return;
                }

                const prev = this.selectedTile;
                prev.setScale(1);

                const prevData = prev as any;
                const tileData = tile as any;

                const sameTile = prev === tile;
                const adjacent =
                    Math.abs(prevData.row - tileData.row) + Math.abs(prevData.col - tileData.col) === 1;

                if (!sameTile && adjacent) {
                    this.swapTiles(prev, tile);

                    const matches = this.findMatches();
                    if (matches.length > 0) {
                        this.removeMatches(matches);
                    } else {
                        this.swapTiles(prev, tile); // revert swap
                    }
                }

                this.selectedTile = null;
            }

            swapTiles(tile1: any, tile2: any) {
                const tempKey = tile1.texture.key;
                tile1.setTexture(tile2.texture.key);
                tile2.setTexture(tempKey);

                const temp = tile1.key;
                tile1.key = tile2.key;
                tile2.key = temp;
            }

            findMatches(): any[] {
                const matches: any[] = [];

                // Horizontal
                for (let row = 0; row < this.gridSize; row++) {
                    let count = 1;
                    for (let col = 1; col < this.gridSize; col++) {
                        const curr = this.grid[row][col];
                        const prev = this.grid[row][col - 1];
                        if (curr && prev && (curr as any).key === (prev as any).key) {
                            count++;
                        } else {
                            if (count >= 3) {
                                for (let i = 0; i < count; i++) {
                                    matches.push(this.grid[row][col - 1 - i]);
                                }
                            }
                            count = 1;
                        }
                    }
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matches.push(this.grid[row][this.gridSize - 1 - i]);
                        }
                    }
                }

                // Vertical
                for (let col = 0; col < this.gridSize; col++) {
                    let count = 1;
                    for (let row = 1; row < this.gridSize; row++) {
                        const curr = this.grid[row][col];
                        const prev = this.grid[row - 1][col];
                        if (curr && prev && (curr as any).key === (prev as any).key) {
                            count++;
                        } else {
                            if (count >= 3) {
                                for (let i = 0; i < count; i++) {
                                    matches.push(this.grid[row - 1 - i][col]);
                                }
                            }
                            count = 1;
                        }
                    }
                    if (count >= 3) {
                        for (let i = 0; i < count; i++) {
                            matches.push(this.grid[this.gridSize - 1 - i][col]);
                        }
                    }
                }

                return [...new Set(matches)];
            }

            removeMatches(matches: any[]) {
                matches.forEach(tile => {
                    const { row, col } = tile as any;
                    this.grid[row][col]?.destroy();
                    this.grid[row][col] = null;
                });

                // Drop
                for (let col = 0; col < this.gridSize; col++) {
                    let emptySpots = 0;
                    for (let row = this.gridSize - 1; row >= 0; row--) {
                        const tile = this.grid[row][col];
                        if (!tile) {
                            emptySpots++;
                        } else if (emptySpots > 0) {
                            this.grid[row + emptySpots][col] = tile;
                            (tile as any).row = row + emptySpots;
                            const newY = this.offsetY + (row + emptySpots) * this.tileSize + this.tileSize / 2;
                            this.tweens.add({ targets: tile, y: newY, duration: 200 });
                            this.grid[row][col] = null;
                        }
                    }

                    // Add new
                    for (let i = 0; i < emptySpots; i++) {
                        const key = Phaser.Math.RND.pick(this.tileKeys);
                        const newTile = this.add.image(
                            this.offsetX + col * this.tileSize + this.tileSize / 2,
                            this.offsetY + i * this.tileSize + this.tileSize / 2,
                            key
                        )
                            .setDisplaySize(this.tileSize - 4, this.tileSize - 4)
                            .setInteractive();

                        (newTile as any).row = i;
                        (newTile as any).col = col;
                        (newTile as any).key = key;

                        this.grid[i][col] = newTile;
                    }
                }

                this.time.delayedCall(250, () => {
                    const newMatches = this.findMatches();
                    if (newMatches.length > 0) {
                        this.removeMatches(newMatches);
                    }
                });
            }

            setConfig(config: Partial<{ spriteKey: string; spriteUrl: string; tileSize: number }>) {
                const { spriteKey, spriteUrl } = config;
                if (!spriteKey || !spriteUrl) return;

                console.log(`🎨 Replacing sprite: ${spriteKey} → ${spriteUrl}`);

                if (this.textures.exists(spriteKey)) {
                    this.textures.remove(spriteKey);
                }

                // Hide all tiles using this spriteKey before reload
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        const tile = this.grid[row][col];
                        if (tile && tile.texture?.key === spriteKey) {
                        tile.setVisible(false);
                        }
                    }
                }

                this.time.delayedCall(0, () => {
                    this.load.image(spriteKey, spriteUrl);

                    this.load.once("complete", () => {
                        console.log(`✅ Sprite loaded: ${spriteKey}`);

                        this.time.delayedCall(50, () => {
                            // Refresh entire grid to apply reskinned tile
                            for (let row = 0; row < this.gridSize; row++) {
                            for (let col = 0; col < this.gridSize; col++) {
                                const tile = this.grid[row][col];
                                if (tile && tile.texture.key === spriteKey) {
                                tile.setTexture(spriteKey);
                                tile.setVisible(true);
                                }
                            }
                            }
                            console.log(`🚀 Applied new texture to all '${spriteKey}' tiles`);
                        });
                    });

                    this.load.start();
                });

            }

        }

        if (!gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 600,
            height: 500,
            parent: gameRef.current,
            scene: Match3Scene,
        };

        const game = new Phaser.Game(config);
        (window as any).setMatch3Config = (cfg: any) => {
            const scene = game.scene.keys.default as any;
            if (scene?.setConfig) scene.setConfig(cfg);
        };


        return () => game.destroy(true);
    }, []);

    return (
        <div
            ref={gameRef}
            style={{
                width: 600,
                height: 500,
                border: "2px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
            }}
        />
    );
};

export default MatchThreeGame;
