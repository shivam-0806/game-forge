import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const CrossyRoadGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    
    const isTyping = () => {
        const el = document.activeElement;
        return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
    };

    useEffect(() => {
        class CrossyScene extends Phaser.Scene {
            chicken!: Phaser.Physics.Arcade.Sprite;
            cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
            cars!: Phaser.Physics.Arcade.Group;
            isGameOver: boolean = false;
            isStarted: boolean = false;
            startText!: Phaser.GameObjects.Text;
            gameOverText!: Phaser.GameObjects.Text;
            carLanes: number[] = [];
            carSpeed: number = 150;
            spawnRate: number = 1000;



            preload() {
                this.load.image("road", "/Game Assets/road.png");
                this.load.image("car", "/Game Assets/car.png");
                this.load.image("chicken", "/Game Assets/chicken.png");
            }

            create() {
                this.isGameOver = false;
                this.isStarted = false;
                
                this.add.tileSprite(0, 0, this.scale.width, this.scale.height, "road")
                    .setOrigin(0, 0)
                    .setTileScale(1.5);

                this.chicken = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 50, "chicken")
                    .setScale(0.8);
                this.chicken.setCollideWorldBounds(true);

                this.cars = this.physics.add.group();

                const laneHeight = 60;
                const laneCount = Math.floor(this.scale.height / laneHeight) - 1;
                this.carLanes = Array.from({ length: laneCount }, (_, i) => (i + 1) * laneHeight);

                this.physics.add.collider(this.chicken, this.cars, this.handleCollision, undefined, this);

                //@ts-ignore
                this.cursors = this.input.keyboard.createCursorKeys();

                this.gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 30, "Game Over! Press R to Restart", {
                    fontSize: "24px",
                    color: "#fff",
                    fontFamily: "Arial",
                }).setOrigin(0.5).setDepth(10).setVisible(false);

                this.startText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 30, "Press Z to Start", {
                    fontSize: "28px",
                    color: "#fff",
                    fontFamily: "Arial",
                }).setOrigin(0.5).setDepth(10);

                //@ts-ignore
                this.input.keyboard.on("keydown-Z", () => {
                    if (isTyping()) return;
                    if (!this.isStarted) {
                        this.isStarted = true;
                        this.startText.setVisible(false);
                        this.startSpawningCars();
                    }
                });

                //@ts-ignore
                this.input.keyboard.on("keydown-R", () => {
                    if (isTyping()) return;
                    if (this.isGameOver) {
                        this.scene.restart();
                    }
                });
            }

            update() {
                if (isTyping()) return;
                if (this.isGameOver || !this.isStarted) return;

                if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
                    this.chicken.y -= 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
                    this.chicken.y += 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.left!)) {
                    this.chicken.x -= 40;
                }
                if (Phaser.Input.Keyboard.JustDown(this.cursors.right!)) {
                    this.chicken.x += 40;
                }
            }

            startSpawningCars() {
                this.time.addEvent({
                    delay: this.spawnRate,
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
                car.setVelocityX(this.carSpeed * direction);
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

            setConfig(config: Partial<{ carSpeed: number; spawnRate: number; spriteKey: string; spriteUrl: string }>) {
                console.log("⚙️ Incoming config:", config);

                if (config.carSpeed !== undefined) {
                    this.carSpeed = config.carSpeed;
                    console.log(`🚗 Updated car speed: ${this.carSpeed}`);
                }

                if (config.spawnRate !== undefined) {
                    this.spawnRate = config.spawnRate;
                    console.log(`⏱️ Updated spawn rate: ${this.spawnRate}`);

                    // Restart timer with new rate
                    this.time.removeAllEvents();
                    this.time.addEvent({
                        delay: this.spawnRate,
                        callback: this.spawnCar,
                        callbackScope: this,
                        loop: true
                    });
                }


                const { spriteKey, spriteUrl } = config;
                if (!spriteKey || !spriteUrl) return;

                console.log(`🎨 Replacing sprite: ${spriteKey} → ${spriteUrl}`);

                let spriteInstance: Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite | null = null;
                if (spriteKey === "chicken") spriteInstance = this.chicken;
                // if (spriteKey === "road") spriteInstance = this.children.getByName?.("road") || null; // or store reference
                if (spriteKey === "car") spriteInstance = null; // car is a group

                if (spriteInstance?.setVisible) spriteInstance.setVisible(false);

                if (this.textures.exists(spriteKey)) {
                    this.textures.remove(spriteKey);
                }

                this.time.delayedCall(0, () => {
                    this.load.image(spriteKey, spriteUrl);

                    this.load.once("complete", () => {
                    console.log(`✅ Sprite loaded: ${spriteKey}`);

                    this.time.delayedCall(50, () => {
                        try {
                        if (spriteKey === "car" && this.cars) {
                            this.cars.children.iterate((child: any) => {
                            child.setTexture(spriteKey);
                            return null;
                            });
                            console.log("🚗 Updated all car textures");
                        } else if (spriteInstance?.setTexture) {
                            spriteInstance.setTexture(spriteKey);
                            spriteInstance.setVisible(true);
                            console.log(`🚀 Applied to ${spriteKey}`);
                        } else {
                            console.warn(`⚠️ No sprite instance found for key: ${spriteKey}`);
                        }
                        } catch (err) {
                        console.error("🔥 setTexture failed:", err);
                        }
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

        (window as any).setCrossyroadConfig = (cfg: any) => {
            spawnRate: 500
            const scene = game.scene.keys.default as any;
            if (scene?.setConfig) scene.setConfig(cfg);
        };


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
                border: "2px solid #009480",
                borderRadius: "8px",
            }}
        />
    );
};

export default CrossyRoadGame;