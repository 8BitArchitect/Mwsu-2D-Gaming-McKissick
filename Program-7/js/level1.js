var level1State = {

    create: function() { 
		game.global.menuMusic.fadeTo(2000, .01);
		game.global.gameMusic.fadeTo(1000, .5);
        this.cursor = game.input.keyboard.createCursorKeys();
        
		//set default properties for the player
        this.player = game.add.sprite(game.width/2, game.height/2+20, 'player');
		this.player.animations.add('none', [0], 0, true);
		this.player.animations.add('right', [1], 0, true);
		this.player.animations.add('left', [4], 0, true);
		this.player.animations.add('walkRight', [1, 2, 1, 3], 8, true);
		this.player.animations.add('walkLeft', [4, 5, 4, 6], 8, true);
		this.player.animations.add('jumpUp', [11], 0, true);
		this.player.animations.add('jumpRight', [9], 0, true);
		this.player.animations.add('jumpLeft', [7], 0, true);
		this.player.animations.add('fallDown', [12], 0, true);
		this.player.animations.add('fallRight', [10], 0, true);
		this.player.animations.add('fallLeft', [8], 0, true);
		this.playerFacing = 'none';
        this.player.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 1000;
		this.player.body.bounce.y = .1;
		this.player.body.bounce.x = .1;
		this.player.body.drag.x = 1000;
		this.player.body.setSize(12, 32);
		
		this.jumpSound = game.add.audio('jump');
		this.jumpSound.volume = .33;
		this.jumpSound.allowMultiple = true;
		this.coinSound = game.add.audio('coin');
		this.coinSound.volume = .33;
		this.deadSound = game.add.audio('dead');
		this.deadSound.volume = .33;

        this.createWorld();

		//set default properties for the 'coin'
		this.coinWeights = [5, 4, 3, 2, 1]
		this.coinValues = [1, 3, 5, 10, 25];
        this.coin = game.add.sprite(-40, -40, 'ticket');
		this.updateCoinPosition();
        game.physics.arcade.enable(this.coin); 
        this.coin.anchor.setTo(0.5, 0.5);

		//add labels
        this.scoreLabel = game.add.text(30, 30, 'score: ' + game.global.score, { font: '18px Arial', fill: '#ffffff' });
        //game.global.score = 0;
		
		/* this.deathsLabel = game.add.text(530, 430, 'deaths: 0', { font: '18px Arial', fill: '#ffffff' });
        this.deaths = 0; */
		
		/* this.timeLabel = game.add.text(420, 30, 'time left: 120', { font: '18px Arial', fill: '#ffffff' });
		this.startTime = game.time.now;
		this.timeLeft = 600; */
		
		if (!game.device.desktop) {
			this.addMobileInputs();
		}
		
		//vars for player invuln state
		this.playerInvuln = false;
		this.invulnTil = 0;
		this.pauseTil = 0;

		//initialize enemies
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(10, 'enemy');
        game.time.events.loop(3600, this.addEnemy, this);
		
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
		
		if (!game.device.dekstop) {
			// Call 'orientationChange' when the device is rotated
			game.scale.onOrientationChange.add(this.orientationChange, this);

			// Create an empty label to write the error message if needed
			this.rotateLabel = game.add.text(game.width/2, game.height/2, '',
			{ font: '30px Arial', fill: '#fff', backgroundColor: '#000' });
			this.rotateLabel.anchor.setTo(0.5, 0.5);

			// Call the function at least once
			this.orientationChange();
		}
    },

    update: function() {
		
		//set which objects/groups can collide with each other
        // Replaced 'this.walls' by 'this.layer'
		game.physics.arcade.collide(this.player, this.layer);
		game.physics.arcade.collide(this.enemies, this.layer);
		//game.physics.arcade.collide(this.enemies, this.enemies);
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
        //game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
		game.physics.arcade.overlap(this.player, this.enemies, this.endGame, null, this);
		
		//check if player invulnerability should be reset
		if (this.playerInvuln && game.time.now > this.invulnTil)
		{
			this.player.tint = 0xFFFFFF;
			this.playerInvuln = false;
		}
		
		if (game.time.now > this.pauseTil)
		{
			game.physics.arcade.isPaused = false;
		}

        this.movePlayer();
		this.animatePlayer();

		//check if player has left the world
        if (!this.player.inWorld) {
            game.state.start('level2');
        }
		
		//Enemy AI
		//this.enemies.forEachAlive(this.enemyAI, this, this.player);
		this.enemies.forEachAlive(this.enemyAnimate, this)
		
		//update game timer
		/* this.timeLeft=(600-Math.floor((game.time.now-this.startTime)/1000));
		this.timeLabel.text = 'time left: ' + this.timeLeft;
		if (this.timeLeft<0)
		{
			game.state.start('menu');
		} */
    },
	
	addMobileInputs: function() {
		// Add the jump button
		var jumpButton = game.add.sprite(490, 360, 'jumpButton');
		jumpButton.inputEnabled = true;
		jumpButton.alpha = 0.5;				
		jumpButton.events.onInputDown.add(this.jumpPlayer, this);

		// Movement variables
		this.moveLeft = false;
		this.moveRight = false;

		// Add the move left button
		var leftButton = game.add.sprite(50, 360, 'leftButton');
		leftButton.inputEnabled = true;
		leftButton.alpha = 0.5;
		leftButton.events.onInputOver.add(this.setLeftTrue, this);
		leftButton.events.onInputOut.add(this.setLeftFalse, this);
		leftButton.events.onInputDown.add(this.setLeftTrue, this);
		leftButton.events.onInputUp.add(this.setLeftFalse, this);

		// Add the move right button
		var rightButton = game.add.sprite(130, 360, 'rightButton');
		rightButton.inputEnabled = true;
		rightButton.alpha = 0.5;
		rightButton.events.onInputOver.add(this.setRightTrue, this);
		rightButton.events.onInputOut.add(this.setRightFalse, this);
		rightButton.events.onInputDown.add(this.setRightTrue, this);
		rightButton.events.onInputUp.add(this.setRightFalse, this);
	},

	// Basic functions that are used in our callbacks

	setLeftTrue: function() {
		this.moveLeft = true;
	},
	setLeftFalse: function() {
		this.moveLeft = false;
	},
	setRightTrue: function() {
		this.moveRight = true;
	},
	setRightFalse: function() {
		this.moveRight = false;
	},
	
	orientationChange: function() {
		// If the game is in portrait (wrong orientation)
		if (game.scale.isPortrait) {
			// Pause the game and add a text explanation
			game.paused = true;
			this.rotateLabel.text = 'rotate your device in landscape';
		}
		// If the game is in landscape (good orientation)
		else {
			// Resume the game and remove the text
			game.paused = false;
			this.rotateLabel.text = '';
		}
	},

    movePlayer: function() {
		if (game.input.totalActivePointers == 0) {
			// Make sure the player is not moving
			this.moveLeft = false;
			this.moveRight = false;
		}
		
		//move player left
        if ((this.cursor.left.isDown || this.moveLeft) && this.player.body.velocity.x > -360) {
            this.player.body.velocity.x = Math.max(-360,this.player.body.velocity.x-60);
			this.playerFacing = 'left';
			console.log(this.cursor.left.duration)
        }
		//move player right
        else if ((this.cursor.right.isDown || this.moveRight) && this.player.body.velocity.x < 360) {
            this.player.body.velocity.x = Math.min(360,this.player.body.velocity.x+60);
			this.playerFacing = 'right';
			console.log(this.cursor.right.duration)
        }
		//make player jump
        //if (this.cursor.up.isDown && this.player.body.touching.down)
		if (this.cursor.up.isDown && this.player.body.onFloor())
		{
			this.jumpPlayer();
        }      
    },
	
	jumpPlayer: function() {
		// If the player is touching the ground
		if (this.player.body.onFloor()) {
			// Jump with sound
			if (game.physics.arcade.isPaused == false)
			{
				this.jumpSound.play();
			}
			this.player.body.velocity.y = -560;
		}
	},
	
	animatePlayer: function() {
		if (this.player.body.touching.down)
		{
			if (this.cursor.left.isDown)
			{
				this.player.animations.play('walkLeft');
			}
			else if (this.cursor.right.isDown)
			{
				this.player.animations.play('walkRight');
			}
			else
			{
				this.player.animations.play(this.playerFacing);
			}
		}
		else
		{
			if (this.playerFacing == 'left')
			{
				if (this.player.body.velocity.y < 0)
				{
					this.player.animations.play('jumpLeft');
				}
				else
				{
					this.player.animations.play('fallLeft');
				}
			}
			else if (this.playerFacing == 'right')
			{
				if (this.player.body.velocity.y < 0)
				{
					this.player.animations.play('jumpRight');
				}
				else
				{
					this.player.animations.play('fallRight');
				}
			}
			else
			{
				if (this.player.body.velocity.y < 0)
				{
					this.player.animations.play('jumpUp');
				}
				else
				{
					this.player.animations.play('fallDown');
				}
			}
		}
	},
	
	enemyAI: function(enemy, player) {
		if (game.physics.arcade.distanceBetween(enemy, player) < 96 && this.playerInvuln == false)
		{
			enemy.body.velocity.x = Math.abs(enemy.body.velocity.x) * game.math.sign(player.body.x-enemy.body.x);
			if (player.body.y < enemy.body.y && enemy.body.touching.down)
			{
				enemy.body.velocity.y = -360;
				if (game.physics.arcade.isPaused == false)
				{
					this.jumpSound.play();
				}
			}
		}	
	},
	
	enemyAnimate(enemy)
	{
		if (enemy.body.touching.down && game.physics.arcade.isPaused == false)
		{
			enemy.animations.play('move');
		}
		else if (enemy.body.velocity.y <= -1)
		{
			enemy.animations.play('jump');
		}
		else
		{
			enemy.animations.play('fall');
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
		
		var sum = [0,0,0,0,0];
		sum[0] = this.coinWeights[0];
		for(i = 1; i < 5; i++)
		{
			sum[i] = sum[i-1] + this.coinWeights[i]
		}
		var coinRnd = game.rnd.integerInRange(0, sum[4]-1);
		if (coinRnd < sum[0] && sum[0])
		{
			this.coinWeights[0] -= 5;
			this.coinWeights[1] += 4;
			this.coinWeights[2] += 3;
			this.coinWeights[3] += 2;
			this.coinWeights[4] += 1;
			this.coin.frame = 0;
		}
		else if (coinRnd < sum[1] && sum[1])
		{
			this.coinWeights[0] += 5;
			this.coinWeights[1] -= 4;
			this.coinWeights[2] += 3;
			this.coinWeights[3] += 2;
			this.coinWeights[4] += 1;
			this.coin.frame = 1;
		}
		else if (coinRnd < sum[2] && sum[2])
		{
			this.coinWeights[0] += 5;
			this.coinWeights[1] += 4;
			this.coinWeights[2] -= 3;
			this.coinWeights[3] += 2;
			this.coinWeights[4] += 1;
			this.coin.frame = 2;
		}
		else if (coinRnd < sum[3] && sum[3])
		{
			this.coinWeights[0] += 5;
			this.coinWeights[1] += 4;
			this.coinWeights[2] += 3;
			this.coinWeights[3] -= 2;
			this.coinWeights[4] += 1;
			this.coin.frame = 3;
		}
		else
		{
			this.coinWeights[0] += 5;
			this.coinWeights[1] += 4;
			this.coinWeights[2] += 3;
			this.coinWeights[3] += 2;
			this.coinWeights[4] -= 1;
			this.coin.frame = 4;
		}
		console.log(this.coinWeights);
		this.coin.value = this.coinValues[this.coin.frame];

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
		if (game.physics.arcade.isPaused == false)
		{
			//picks the first dead enemy to spawn
			var enemy = this.enemies.getFirstDead();

			//return if there are no dead enemies 
			if (!enemy) {
				return;
			}

			//set default properties for enemy
			enemy.animations.add('move', [0, 1, 0, 2], 8, true);
			enemy.animations.add('jump', [3], 0, true);
			enemy.animations.add('fall', [4], 0, true);
			enemy.animations.play('move');
			enemy.anchor.setTo(0.5, 0.5);
			enemy.reset(game.rnd.pick([80, 320, 560]), 0);
			enemy.body.gravity.y = 1000;
			enemy.body.velocity.x = game.rnd.pick([100, 150, 200,]) * game.rnd.pick([-1, 1]);
			enemy.body.bounce.x = 1;
			enemy.body.bounce.y = .5;
			enemy.checkWorldBounds = true;
			enemy.outOfBoundsKill = true;
		}
    },

    createWorld: function() {
		// Create the tilemap
		this.map = game.add.tilemap('level1');

		// Add the tileset to the map
		this.map.addTilesetImage('tileset');

		// Create the layer by specifying the name of the Tiled layer
		this.layer = this.map.createLayer('Tile Layer 1');

		// Set the world size to match the size of the layer
		this.layer.resizeWorld();

		// Enable collisions for the first tilset element (the blue wall)
		this.map.setCollision(1);
	},

    playerDie: function(player, enemy) {
		var playSound = false;
		if(this.playerInvuln == false || player.inWorld == false)
		{
			//if the player fell out of the world ignore this section
			if (enemy)
			{
				//throw the player away from the enemy as if it exploded and kill the enemy
				/* var angle = game.math.angleBetweenPointsY(player.body.center, enemy.body.center);
				player.body.velocity.x -= Math.sin(angle) * 1080;
				player.body.velocity.y -= Math.cos(angle) * 1080; */
				//enemy.animations.play('die');
				//enemy.kill();
				//enemy.destroy();
			}
			this.pauseTil = game.time.now + 1500
			game.physics.arcade.isPaused = true;
			//set player invulnerability
			this.playerInvuln = true;
			this.invulnTil = game.time.now + 4500;
			player.tint = 0xFF0000;
			
			//add a death and decrement score (to a min of 0)
			this.deaths++;
			this.deathsLabel.text = 'deaths: ' + this.deaths;
			game.global.score = Math.max(0,game.global.score - 10);
			this.scoreLabel.text = 'score: ' + game.global.score;
			playSound = true;
			/* var inWall = false;
			do
			{
				inWall = false */
				this.player.reset(game.rnd.integerInRange(40,600),game.rnd.integerInRange(40,440));
				//make sure we didn't spawn the player in a wall
				/* if (
				((player.body.center.y > 200 && player.body.center.y < 280) && (player.body.center.x < 180 || player.body.center.x > 460)) || 
				((player.body.center.x > 140 && player.body.center.x < 500) && ((player.body.center.y > 80 && player.body.center.y < 160) || (player.body.center.y > 320 && player.body.center.y < 400)))
				) 
				{
					inWall = true;
				}
			}while (inWall); */
			playSound = true;
			if(playSound)
			{
				// Set the position of the emitter on top of the player
				this.emitter.x = this.player.x;
				this.emitter.y = this.player.y;
				// Start the emitter by exploding 15 particles that will live 800ms
				this.emitter.start(true, 2800, null, 15);
				this.deadSound.play();
			}
		}
    },
	
	endGame: function(player, enemy)
	{
		game.state.start('menu');
	}
};
