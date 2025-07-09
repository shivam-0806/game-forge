import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const CrossyRoadGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        class CrossyScene extends Phaser.Scene {
            player!: Phaser.Physics.Arcade.Sprite;
            cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
            cars!: Phaser.Physics.Arcade.Group;
            isGameOver: boolean = false;
            isStarted: boolean = false;
            startText!: Phaser.GameObjects.Text;
            gameOverText!: Phaser.GameObjects.Text;
            carLanes: number[] = [];

            preload() {
                this.load.image("road", "/Game Assets/Crossy Road/road.png");
                this.load.image("car", "/Game Assets/Crossy Road/car.png");
                this.load.image("player", "/Game Assets/Crossy Road/chicken.png");
            }

            create() {
                this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "road")
                    .setOrigin(0, 0)
                    .setTileScale(1.5);

                this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 50, "player")
                    .setScale(0.8);
                this.player.setCollideWorldBounds(true);

                this.cars = this.physics.add.group();

                const laneHeight = 60;
                const laneCount = Math.floor(this.scale.height / laneHeight) - 1;
                this.carLanes = Array.from({ length: laneCount }, (_, i) => (i + 1) * laneHeight);

                this.physics.add.collider(this.player, this.cars, this.handleCollision, undefined, this);

                //@ts-ignore
                this.cursors = this.input.keyboard.createCursorKeys();

                this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "Game Over! Press R to Restart", {
                    fontSize: "24px",
                    color: "#fff",
                    fontFamily: "Arial",
                }).setOrigin(0.5).setDepth(10).setVisible(false);

                this.startText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, "Press P to Start", {
                    fontSize: "28px",
                    color: "#fff",
                    fontFamily: "Arial",
                }).setOrigin(0.5).setDepth(10);

                //@ts-ignore
                this.input.keyboard.on("keydown-P", () => {
                    if (!this.isStarted) {
                        this.isStarted = true;
                        this.startText.setVisible(false);
                        this.startSpawningCars();
                    }
                });

                //@ts-ignore
                this.input.keyboard.on("keydown-R", () => {
                    if (this.isGameOver) {
                        this.scene.restart();
                    }
                });
            }

            update() {
                if (this.isGameOver || !this.isStarted) return;

                if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
                    this.player.y -= 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
                    this.player.y += 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
                    this.player.x -= 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
                    this.player.x += 40;
                }
            }

            startSpawningCars() {
                this.time.addEvent({
                    delay: 1000,
                    callback: this.spawnCar,
                    callbackScope: this,
                    loop: true,
                });
            }

            spawnCar = () => {
                const y = Phaser.Utils.Array.GetRandom(this.carLanes);
                const direction = Phaser.Math.Between(0, 1) ? 1 : -1;
                const x = direction === 1 ? -50 : this.scale.width + 50;

                const car = this.cars.create(x, y, "car") as Phaser.Physics.Arcade.Image;
                car.setVelocityX(150 * direction);
                car.setScale(1.2);
                car.setCollideWorldBounds(false);
                car.setImmovable(true);

                if (direction === -1) {
                    car.setFlipX(true);
                }
            }

            handleCollision = () => {
                this.isGameOver = true;
                this.physics.pause();
                this.gameOverText.setVisible(true);
            }
        }

        if (!gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 600,
            height: 500,
            parent: gameRef.current,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                },
            },
            scene: CrossyScene,
            scale: {
                mode: Phaser.Scale.NONE,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };

        const game = new Phaser.Game(config);
        return () => {
            game.destroy(true);
        };
    }, []);

    return (
        <div
            ref={gameRef}
            style={{
                width: "600px",
                height: "500px",
                overflow: "hidden",
                position: "relative",
                border: "2px solid #ff0",
                borderRadius: "8px",
            }}
        />
    );
};

export default CrossyRoadGame;