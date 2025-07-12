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

            gravity: number = 600;
            pipeGap: number = 150;
            pipeSpeed: number = -200;
            flapStrength: number = 250;

            preload() {
                this.load.image("bird", "/Game Assets/Flappy Bird/bird.png");
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
                this.bird.setGravityY(this.gravity);
                // this.bird.setVelocityY(-this.flapStrength); 
                // pipe.setVelocityX(this.pipeSpeed); 

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
                    this.bird.setVelocityY(-this.flapStrength);
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

            setConfig(config: Partial<{ gravity: number; pipeGap: number; pipeSpeed: number; flapStrength: number }>) {
                if (config.gravity !== undefined) {
                    this.gravity = config.gravity;
                    this.bird?.setGravityY(this.gravity);
                }
                if (config.pipeGap !== undefined) this.pipeGap = config.pipeGap;
                if (config.pipeSpeed !== undefined) this.pipeSpeed = config.pipeSpeed;
                //if (config.flapStrength !== undefined) this.flapStrength = config.flapStrength;
                if (config.flapStrength !== undefined) {
                    this.flapStrength = config.flapStrength;
                    // this.bird?.setVelocityY(this.flapStrength);
                }
                console.log("New config applied:", this.gravity, this.flapStrength, this.pipeGap, this.pipeSpeed);
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

        // Expose config control globally
        (window as any).setFlappyConfig = (cfg: any) => {
            const scene = game.scene.keys.default as any;
            if (!scene){
                console.log("scene empty, returning");
                 return;
            }
            if (scene?.setConfig) {
                scene.setConfig(cfg);
            }

            // Apply sprite replacement (if a new sprite is specified)
            // if (cfg.spriteKey && cfg.spriteUrl) {
            //     if (scene.textures.exists(cfg.spriteKey)) {
            //     scene.textures.remove(cfg.spriteKey);
            //     }

            //     scene.load.image(cfg.spriteKey, cfg.spriteUrl);
            //     scene.load.once("complete", () => {
            //     if (cfg.spriteKey === "bird" && scene.bird) {
            //         scene.bird.setTexture(cfg.spriteKey);
            //     }

            //     // Optional: support pipe/bg/etc
            //     });
            const { spriteKey, spriteUrl } = cfg;
            if (spriteKey && spriteUrl) {
                console.log(`🎨 Replacing sprite: ${spriteKey} → ${spriteUrl}`);

                // ✅ Clean up old texture (avoids glTexture crash)
                if (scene.textures.exists(spriteKey)) {
                scene.textures.remove(spriteKey);
                }

                // ✅ Load new texture
                scene.load.image(spriteKey, spriteUrl);

                scene.load.once("complete", () => {
                console.log(`✅ Sprite loaded: ${spriteKey}`);

                // ✅ Apply to bird, pipe, bg, etc if sprite exists
                if (scene[spriteKey] && scene[spriteKey].setTexture) {
                    scene[spriteKey].setTexture(spriteKey);
                    console.log(`🚀 Applied to scene.${spriteKey}`);
                } else {
                    console.warn(`⚠️ No sprite instance found for key: ${spriteKey}`);
                }
                });
                scene.load.start();
            }
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
                borderRadius: "8px"
            }}
        />
    );
};

export default FlappyBirdGame;