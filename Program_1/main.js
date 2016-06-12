var mainState = {

    preload: function() {
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('coin', 'assets/coin.png');
        game.load.image('enemy', 'assets/enemy.png');
    },

    create: function() { 
		//console.log(game.rnd.integerInRange);
        game.stage.backgroundColor = '#3498db';
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.renderer.renderSession.roundPixels = true;

        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
		//this.player.scale.setTo(2, 2)
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 1000;

        this.createWorld();

        this.coin = game.add.sprite(-40, -40, 'coin');
		this.updateCoinPosition();
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);
		//this.coin.scale.setTo(2, 2)

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.score = 0;
		
		this.deathsLabel = game.add.text(530, 430, 'deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.deaths = 0;

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
		this.ticks = 0;
    },

    update: function() {
		
		this.tics++;
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);

        this.movePlayer(); 

        if (!this.player.inWorld) {
            this.playerDie();
        }
    },

    movePlayer: function() {
        if (this.cursor.left.isDown) {
            this.player.body.velocity.x = -320;
        }
        else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 320;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -560;
        }      
    },

    takeCoin: function(player, coin) {
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;

        this.updateCoinPosition();
    },

    updateCoinPosition: function() {
        var coinPosition = [
			{x: 160, y:  60}, {x: 480, y:  60},
			{x: 160, y: 180}, {x: 480, y: 180},
			{x: 90,  y: 120}, {x: 550, y: 120},
			{x: 160, y: 300}, {x: 480, y: 300},
			{x: 160, y: 420}, {x: 480, y: 420},
			{x: 90,  y: 360}, {x: 550, y: 360}, 
            {x: 220, y: 240}, {x: 420, y: 240},
            {x: 320, y: 420}, {x: 320, y:  80}
        ];

        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function() {
        var enemy = this.enemies.getFirstDead();

        if (!enemy) {
            return;
        }

        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 1000;
        enemy.body.velocity.x = 150 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
		//enemy.scale.setTo(2, 2);
    },

    createWorld: function() {
        this.walls = game.add.group();
        this.walls.enableBody = true;
		
		var left = game.add.sprite(0, 0, 'wall', 0, this.walls);
		left.scale.setTo(1, 24);
        var right = game.add.sprite(game.width-20, 0, 'wall', 0, this.walls);
		right.scale.setTo(1, 24);
        var topLeft = game.add.sprite(0, 0, 'wall', 0, this.walls);
		topLeft.scale.setTo(12, 1);
        var topRight = game.add.sprite(game.width-240, 0, 'wall', 0, this.walls);
		topRight.scale.setTo(12, 1);
        var bottomLeft = game.add.sprite(0, game.height-20, 'wall', 0, this.walls);
		bottomLeft.scale.setTo(12, 1);
        var bottomRight = game.add.sprite(game.width-240, game.height-20, 'wall', 0, this.walls);
		bottomRight.scale.setTo(12, 1);
        var middleLeft = game.add.sprite(0, game.height/2-10, 'wall', 0, this.walls);
		middleLeft.scale.setTo(8, 1);
        var middleRight = game.add.sprite(game.width*.75, game.height/2-10, 'wall', 0, this.walls);
		middleRight.scale.setTo(8, 1);
        var middleTop = game.add.sprite(game.width*.25, game.height*.25-10, 'wall', 0, this.walls);
        middleTop.scale.setTo(16, 1);
        var middleBottom = game.add.sprite(game.width*.25, game.height*.75-10, 'wall', 0, this.walls);
        middleBottom.scale.setTo(16, 1);

        this.walls.setAll('body.immovable', true);
    },

    playerDie: function() {
		this.deaths++;
		this.deathsLabel.text = 'deaths: ' + this.deaths;
        if(!this.player.inWorld) 
		{
			do
			{
				this.player.reset(game.rnd.integerInRange(20,620),game.rnd.integerInRange(20,460));
			} while(game.physics.arcade.overlap(this.player, this.walls));
		}
		else
		{
			
		}
    },
};

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');