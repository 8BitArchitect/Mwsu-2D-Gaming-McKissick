var mainState = {

    preload: function() {
        game.load.image('player', 'assets/player.png');
        game.load.image('wall', 'assets/wall.png');
        game.load.image('coin', 'assets/coin.png');
        game.load.image('enemy', 'assets/enemy.png');
    },

    create: function() { 
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

        this.coin = game.add.sprite(60, 140, 'coin');
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);
		//this.coin.scale.setTo(2, 2)

        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        this.score = 0;

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
    },

    update: function() {
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
            this.player.body.velocity.x = -300;
        }
        else if (this.cursor.right.isDown) {
            this.player.body.velocity.x = 300;
        }
        else {
            this.player.body.velocity.x = 0;
        }

        if (this.cursor.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -480;
        }      
    },

    takeCoin: function(player, coin) {
        this.score += 5;
        this.scoreLabel.text = 'score: ' + this.score;

        this.updateCoinPosition();
    },

    updateCoinPosition: function() {
        var coinPosition = [
            {x: 140, y: 60}, {x: 360, y: 60}, 
            {x: 60, y: 140}, {x: 440, y: 140}, 
            {x: 130, y: 300}, {x: 370, y: 300} 
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
		// Here you can apply the same properties to every wall.
		// http://stackoverflow.com/a/29505980
		this.walls.setAll('anchor.x', 0.5);
		this.walls.setAll('anchor.y', 0);	

        game.add.sprite(10, 0, 'wallV', 0, this.walls); 
        game.add.sprite(game.width-10, 0, 'wallV', 0, this.walls); 
        game.add.sprite(10, 0, 'wallH', 0, this.walls); 
        game.add.sprite(game.width*.75, 0, 'wallH', 0, this.walls);
        game.add.sprite(0, game.height-20, 'wallH', 0, this.walls); 
        game.add.sprite(game.width-20, game.height-20, 'wallH', 0, this.walls); 
        game.add.sprite(game.width*.25, game.height/2-10, 'wallH', 0, this.walls); 
        game.add.sprite(game.width*.75, game.height/2-10, 'wallH', 0, this.walls); 
        var middleTop = game.add.sprite(game.width/2, game.height*.25, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(game.width/2, game.height*.75, 'wallH', 0, this.walls);
        middleBottom.scale.setTo(1.5, 1);

        this.walls.setAll('body.immovable', true);
		console.log(this.walls.children)
    },

    playerDie: function() {
        game.state.start('main');
    },
};

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');