var playState = {

    create: function() { 
		game.global.menuMusic.fadeTo(2000, .01);
		game.global.gameMusic.fadeTo(1000, .5);
        this.cursor = game.input.keyboard.createCursorKeys();
        
		//set default properties for the player
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 1000;
		this.player.body.bounce.y = .1;
		this.player.body.bounce.x = .1;
		this.player.body.drag.x = 1000;
		
		this.jumpSound = game.add.audio('jump');
		this.jumpSound.volume = .33;
		this.coinSound = game.add.audio('coin');
		this.coinSound.volume = .33;
		this.deadSound = game.add.audio('dead');
		this.deadSound.volume = .33;

        this.createWorld();

		//set default properties for the coin
        this.coin = game.add.sprite(-40, -40, 'ticket');
		this.updateCoinPosition();
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);

		//add labels
        this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
        game.global.score = 0;
		
		this.deathsLabel = game.add.text(530, 430, 'deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.deaths = 0;
		
		this.timeLabel = game.add.text(420, 30, 'time left: 120', { font: '18px Arial', fill: '#ffffff' });
		this.startTime = game.time.now;
		this.timeLeft = 120;
		
		//vars for player invuln state
		this.playerInvuln = false;
		this.invulnTil = 0;

		//initialize enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(2200, this.addEnemy, this);
		
		// Create the emitter with 15 particles. We don't need to set the x y
		// Since we don't know where to do the explosion yet
		this.emitter = game.add.emitter(0, 0, 15);

		// Set the 'pixel' image for the particles
		this.emitter.makeParticles('pixel');

		// Set the x and y speed of the particles between -150 and 150
		// Speed will be randomly picked between -150 and 150 for each particle
		this.emitter.setYSpeed(-150, 150);
		this.emitter.setXSpeed(-150, 150);

		// Scale the particles from 2 time their size to 0 in 800ms
		// Parameters are: startX, endX, startY, endY, duration
		this.emitter.setScale(2, 0, 2, 0, 800);

		// Use no gravity
		this.emitter.gravity = 0;
    },

    update: function() {
		
		//set which objects/groups can collide with each other
        game.physics.arcade.collide(this.player, this.walls);
        game.physics.arcade.collide(this.enemies, this.walls);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
		
		//check if player invulnerability should be reset
		if (this.playerInvuln && game.time.now > this.invulnTil)
		{
			this.player.tint = 0xFFFFFF;
			this.playerInvuln = false;
		}

        this.movePlayer(); 

		//check if player has left the world
        if (!this.player.inWorld) {
            this.playerDie(this.player);
        }
		
		//update game timer
		this.timeLeft=(120-Math.floor((game.time.now-this.startTime)/1000));
		this.timeLabel.text = 'time left: ' + this.timeLeft;
		if (this.timeLeft<0)
		{
			game.state.start('menu');
		}
    },

    movePlayer: function() {
		//move player left
        if (this.cursor.left.isDown && this.player.body.velocity.x > -360) {
            this.player.body.velocity.x = Math.max(-360,this.player.body.velocity.x-60);
        }
		//move player right
        else if (this.cursor.right.isDown && this.player.body.velocity.x < 360) {
            this.player.body.velocity.x = Math.min(360,this.player.body.velocity.x+60);
        }
		//make player jump
        if (this.cursor.up.isDown && this.player.body.touching.down) {
			this.jumpSound.play();
            this.player.body.velocity.y = -560;
        }      
    },

    takeCoin: function(player, coin) {
		this.coinSound.play();
		// Scale the coin to 0 to make it invisible
		this.coin.scale.setTo(0, 0);
		// Grow the coin back to its original scale in 300ms
		game.add.tween(this.coin.scale).to({x: 1, y: 1}, 300).start();
		game.add.tween(this.player.scale).to({x: 1.3, y: 1.3}, 100).yoyo(true).start();
        game.global.score += this.coin.value;
        this.scoreLabel.text = 'score: ' + game.global.score;

        this.updateCoinPosition();
    },

    updateCoinPosition: function() {
		//list of possible coin positions
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
		
		var coinWeights = [0,0,0,0,0,0,1,1,1,1,2,2,2,3,3,4]
		
		var coinValues = [1, 3, 5, 10, 25];
		
		this.coin.frame = game.rnd.pick(coinWeights);
		this.coin.value = coinValues[this.coin.frame];

		//??? removes current coin position from list ???
        for (var i = 0; i < coinPosition.length; i++) {
            if (coinPosition[i].x == this.coin.x && coinPosition[i].y == this.coin.y) {
                coinPosition.splice(i, 1);
            }
        }

        var newPosition = game.rnd.pick(coinPosition);
        this.coin.reset(newPosition.x, newPosition.y);
    },

    addEnemy: function() {
		//picks the first dead enemy to spawn
        var enemy = this.enemies.getFirstDead();

		//return if there are no dead enemies 
        if (!enemy) {
            return;
        }

		//set default properties for enemy
		enemy.animations.add('move', [0, 1, 0, 2], 8, true);
		enemy.animations.play('move');
        enemy.anchor.setTo(0.5, 0.5);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 1000;
        enemy.body.velocity.x = 150 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
		enemy.body.bounce.y = .5;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },

    createWorld: function() {
		//initialize and add the walls to the world
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

		//prevent walls from moving in collisions
        this.walls.setAll('body.immovable', true);
    },

    playerDie: function(player, enemy) {
		var playSound = false;
		if(this.playerInvuln == false)
		{
			//if the player fell out of the world ignore this section
			if (enemy)
			{
				//throw the player away from the enemy as if it explodedand kill the enemy
				var angle = game.math.angleBetweenPointsY(player.body.center, enemy.body.center);
				player.body.velocity.x -= Math.sin(angle) * 1080;
				player.body.velocity.y -= Math.cos(angle) * 1080;
				enemy.animations.play('die');
				enemy.kill();
				//enemy.destroy();
			}
			//set player invulnerability
			this.playerInvuln = true;
			this.invulnTil = game.time.now + 2500;
			player.tint = 0xFF0000;
			
			//add a death and decrement score (to a min of 0)
			this.deaths++;
			this.deathsLabel.text = 'deaths: ' + this.deaths;
			game.global.score = Math.max(0,game.global.score - 10);
			this.scoreLabel.text = 'score: ' + game.global.score;
			playSound = true;
		}
		//reset the player's position if he fell out of the world.
        if(!this.player.inWorld) 
		{
			var inWall = false;
			do
			{
				inWall = false
				this.player.reset(game.rnd.integerInRange(40,600),game.rnd.integerInRange(40,440));
				//make sure we didn't spawn the player in a wall
				if (
				((player.body.center.y > 200 && player.body.center.y < 280) && (player.body.center.x < 180 || player.body.center.x > 460)) || 
				((player.body.center.x > 140 && player.body.center.x < 500) && ((player.body.center.y > 80 && player.body.center.y < 160) || (player.body.center.y > 320 && player.body.center.y < 400)))
				)
				{
					inWall = true;
				}
			}while (inWall);
			playSound = true;
		}
		if(playSound)
		{
			// Set the position of the emitter on top of the player
			this.emitter.x = this.player.x;
			this.emitter.y = this.player.y;
			// Start the emitter by exploding 15 particles that will live 800ms
			this.emitter.start(true, 800, null, 15);
			this.deadSound.play();
		}
    },
};
