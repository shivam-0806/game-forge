
fetch("config.json")
  .then(res => res.json())
  .then(config => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 600,
      height: 500,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: {
        preload: function () {
          this.load.image("bird", "assets/bird-reskinned.png");
          this.load.image("pipe", "assets/pipe-reskinned.png");
          this.load.image("bg", "assets/background-reskinned.png");
        },
        create: function () {

          this.spawnPipe = () => {
            if (this.isPaused) return;

            const gap = config.pipeGap ?? 150;
            const topPipeHeight = Phaser.Math.Between(50, this.scale.height - 200);
            const bottomPipeY = topPipeHeight + gap;

            const topPipe = this.pipes.create(this.scale.width, topPipeHeight, "pipe");
            const bottomPipe = this.pipes.create(this.scale.width, bottomPipeY, "pipe");

            topPipe.setOrigin(0, 1).setFlipY(true);
            bottomPipe.setOrigin(0, 0);

            topPipe.body.allowGravity = false;
            bottomPipe.body.allowGravity = false;

            topPipe.body.setVelocityX(config.pipeSpeed ?? -200);
            bottomPipe.body.setVelocityX(config.pipeSpeed ?? -200);

            topPipe.setData("scored", false);
            bottomPipe.setData("scored", false);

            console.log("🟢 Spawned pipes at x =", this.scale.width);
          };

          this.restart = () => {
            this.scene.restart();
            this.events.once("create", () => {
              this.physics.pause();
              this.isPaused = true;
            });
          };



          this.bg = this.add.image(0, 0, "bg").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
          this.score = 0;
          this.scoreText = this.add.text(20, 20, "Score: 0", {
            fontSize: "20px", color: "#ffffff", fontFamily: "Arial"
          });

          this.bird = this.physics.add.sprite(100, this.scale.height / 2, "bird").setScale(1.2);
          this.bird.setCollideWorldBounds(true);
          this.bird.setGravityY(config.gravity ?? 600);

          this.pipes = this.physics.add.group();

          if (this.spawnPipe) {
            console.log("📞 Calling spawnPipe");
            this.spawnPipe();
          } else {
            console.log("❌ spawnPipe is undefined");
          }

          this.time.addEvent({
            delay: 1500,
            callback: this.spawnPipe,
            callbackScope: this,
            loop: true
          });

          this.physics.add.collider(this.bird, this.pipes, () => this.restart());

          this.flapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

          this.playText = this.add.text(this.scale.width / 2, this.scale.height / 2, "Press Space to Play", {
            fontSize: "28px", color: "#ffffff", fontFamily: "Arial"
          }).setOrigin(0.5);

          this.input.keyboard.on("keydown-SPACE", () => {
            if (this.isPaused) {
              this.isPaused = false;
              this.physics.resume();
              this.playText.setVisible(false);
            }
          });

          this.physics.pause();
          this.isPaused = true;
          this.isReady = true;
        },
        update: function () {
          if (this.isPaused) return;

          if (Phaser.Input.Keyboard.JustDown(this.flapKey)) {
            this.bird.setVelocityY(-(config.flapPower ?? 250));
          }

          this.pipes.children.iterate((pipe) => {
            if (pipe && pipe.x < this.bird.x && !pipe.getData("scored")) {
              pipe.setData("scored", true);
              this.score += 0.5;
              this.scoreText.setText("Score: " + Math.floor(this.score));
            }
          });

          if (this.bird.y > this.scale.height || this.bird.y < 0) {
            this.restart();
          }
        },
        restart: function () {
          this.scene.restart();
          this.events.once('create', () => {
            this.physics.pause();
            this.isPaused = true;
          });
        }
      }
    });
  });
