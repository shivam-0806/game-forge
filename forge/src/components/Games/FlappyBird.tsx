import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

const FlappyBirdGame: React.FC = () => {
    const gameRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        class FlappyScene extends Phaser.Scene {
            bird!: Phaser.Physics.Arcade.Sprite;
            pipes!: Phaser.Physics.Arcade.Group;
            flapKey!: Phaser.Input.Keyboard.Key;
            score: number = 0;
            scoreText!: Phaser.GameObjects.Text;
            isPaused: boolean = true;
            playText!: Phaser.GameObjects.Text;

            preload() {
                this.load.image("bird", "/Game Assets/Flappy Bird/bird-red-sprite.png");
                this.load.image("pipe", "/Game Assets/Flappy Bird/pipe-green.png");
                this.load.image("bg", "/Game Assets/Flappy Bird/background.png");
            }

            create() {
                this.add.image(0, 0, "bg")
                    .setOrigin(0)
                    .setDisplaySize(this.scale.width, this.scale.height);

                this.scoreText = this.add.text(20, 20, "Score: 0", {
                    fontSize: "20px",
                    color: "#ffffff",
                    fontFamily: "Arial"
                });

                this.bird = this.physics.add.sprite(100, this.scale.height / 2, "bird").setScale(1.2);
                this.bird.setCollideWorldBounds(true);
                this.bird.setGravityY(600);

                this.pipes = this.physics.add.group();

                this.time.addEvent({
                    delay: 1500,
                    callback: this.spawnPipe,
                    callbackScope: this,
                    loop: true
                });

                this.physics.add.collider(this.bird, this.pipes, () => {
                    this.restart();
                });

                // @ts-ignore
                this.flapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

                this.playText = this.add.text(this.scale.width / 2, this.scale.height / 2, "Press Space to Play", {
                    fontSize: "28px",
                    color: "#ffffff",
                    fontFamily: "Arial"
                }).setOrigin(0.5);

                // @ts-ignore
                this.input.keyboard.on("keydown-SPACE", () => {
                    if (this.isPaused) {
                        this.isPaused = false;
                        this.physics.resume();
                        this.playText.setVisible(false);
                    }
                });

                this.physics.pause();
            }

            update() {
                if (this.isPaused) return;

                if (Phaser.Input.Keyboard.JustDown(this.flapKey)) {
                    this.bird.setVelocityY(-250);
                }

                // @ts-ignore
                this.pipes.children.iterate((pipeObj): boolean | void => {
                    const pipe = pipeObj as Phaser.Physics.Arcade.Image;
                    if (pipe && pipe.x < this.bird.x && !pipe.getData("scored")) {
                        pipe.setData("scored", true);
                        this.score += 0.5;
                        this.scoreText.setText("Score: " + Math.floor(this.score));
                    }
                });

                if (this.bird.y > this.scale.height || this.bird.y < 0) {
                    this.restart();
                }
            }

            spawnPipe = () => {
                if (this.isPaused) return;

                const gap = 150;
                const topPipeHeight = Phaser.Math.Between(50, this.scale.height - 200);
                const bottomPipeY = topPipeHeight + gap;

                const topPipe = this.pipes.create(this.scale.width, topPipeHeight, "pipe") as Phaser.Physics.Arcade.Image;
                const bottomPipe = this.pipes.create(this.scale.width, bottomPipeY, "pipe") as Phaser.Physics.Arcade.Image;

                topPipe.setOrigin(0, 1).setFlipY(true);
                bottomPipe.setOrigin(0, 0);

                [topPipe, bottomPipe].forEach(pipe => {
                    if (pipe.body && 'allowGravity' in pipe.body) {
                        (pipe.body as Phaser.Physics.Arcade.Body).allowGravity = false;
                    }
                    pipe.setVelocityX(-200);
                    pipe.setData("scored", false);
                });
            }

            restart() {
                this.scene.restart();
                this.events.once('create', () => {
                    this.physics.pause();
                    this.isPaused = true;
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
                    debug: false
                }
            },
            scene: FlappyScene,
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
                border: "2px solid #0ff",
                borderRadius: "8px"
            }}
        />
    );
};

export default FlappyBirdGame;