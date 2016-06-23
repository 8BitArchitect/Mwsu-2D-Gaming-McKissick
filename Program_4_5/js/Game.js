var SpaceHipster = SpaceHipster || {};

var player;
var cursors;

var bullet;
var bullets;
var bulletTime = 0;

var difficulty = 'easy' // appropriate values are 'easy', 'normal', and 'hard'  

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
  create: function() {
	//  This will run in Canvas mode, so let's gain a little speed and display
    this.game.renderer.clearBeforeRender = false;
    this.game.renderer.roundPixels = true;

    //  We need arcade physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
	
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');
	
	//  Our ships bullets
    bullets = this.game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;

    //  All 40 of them
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
	bullets.setAll('body.width', 16);
	bullets.setAll('body.height', 12);
	bullets.setAll('scale.x', 0.5);
	bullets.setAll('scale.y', 0.5);

    //  Our player ship
    player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'ship');
    player.anchor.x = 0.5;
	player.anchor.y = 0.5;
	player.scale.setTo(0.5);

    //  and its physics settings
    this.game.physics.enable(player, Phaser.Physics.ARCADE);
	player.body.collideWorldBounds = true;

    player.body.drag.set(100);
    player.body.maxVelocity.set(200);
	player.body.offset.x = 16;
	player.body.offset.y = 16;
	player.body.width = 48;
	player.body.height = 48;

    //  Game input
    cursors = this.game.input.keyboard.createCursorKeys();
    this.game.input.keyboard.addKeyCapture([ Phaser.KeyCode.SPACEBAR, Phaser.KeyCode.D, Phaser.KeyCode.A ]);

    //player initial score of zero
    this.playerScore = 0;

    //the camera will follow the player in the world
    this.game.camera.follow(player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
  },
  
  update: function() {
	this.playerMove();

    //collision between player and asteroids
    this.game.physics.arcade.overlap(player, this.asteroids, this.hitAsteroid, null, this);
	this.game.physics.arcade.collide(this.asteroids, this.asteroids);
	this.game.physics.arcade.overlap(bullets, this.asteroids, this.shotAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(player, this.collectables, this.collect, null, this);
  },
  
  render: function() {

    this.game.debug.body(player);

  },
  
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
	this.sizeMod = 0;
	this.diffMod = 0;
	switch(difficulty)
	{
	case 'easy':
		this.diffMod = 0;
		break;
	case 'hard':
		this.diffMod = 50;
		break;
	default:
		this.diffMod = 25;
	}
	this.weights = [];
	for (i = 0; i <= 100; i += 10)
	{
		for (j = 0; j < 100 - Math.abs(i - this.sizeMod); j += Math.floor(Math.abs(i - this.sizeMod) / 10) + 1)
		{
			this.weights.push(i * .8 + 8);
		}
	}
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
    var numAsteroids = 10//this.game.rnd.integerInRange(75 + this.diffMod - this.sizeMod/4, 100 + this.diffMod * 2 - this.sizeMod/2)
    var asteroid;

    for (var i = 0; i < numAsteroids; i++) {
      //add sprite
      asteroid = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
	  var size = this.game.rnd.pick(this.weights)/16
      asteroid.scale.setTo(size);
	  asteroid.body.mass = size * size;

      //physics properties
	  var angle = this.game.rnd.realInRange(0, this.game.math.PI2);
      asteroid.body.velocity.x = 75 / asteroid.body.mass * Math.sin(angle) + this.game.rnd.integerInRange(-10, 10);
      asteroid.body.velocity.y = 75 / asteroid.body.mass * Math.cos(angle) + this.game.rnd.integerInRange(-10, 10);
      asteroid.body.immovable = false;
	  asteroid.body.bounce.x = 1;
	  asteroid.body.bounce.y = 1;
      asteroid.body.collideWorldBounds = true;
    }
  },
  fireBullet: function() {

    if (this.game.time.now > bulletTime)
    {
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            bullet.reset(player.centerY, player.centerY);
            bullet.lifespan = 4000;
            bullet.rotation = player.rotation;
            this.game.physics.arcade.velocityFromRotation(player.rotation, 400, bullet.body.velocity);
            bulletTime = this.game.time.now + 200;
        }
    } 

  },
  playerMove: function()
  {
	var forwardAccel = new Phaser.Point();
	var rightAccel = new Phaser.Point();
	var leftAccel = new Phaser.Point();
	if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR))
    {
        this.fireBullet();
    }
	if (cursors.up.isDown)
    {
        forwardAccel = this.game.physics.arcade.accelerationFromRotation(player.rotation, 300);
    }
	if (this.game.input.keyboard.isDown(Phaser.KeyCode.D))
    {
        rightAccel = this.game.physics.arcade.accelerationFromRotation(player.rotation + Math.PI/2, 150);
    }
	else if (this.game.input.keyboard.isDown(Phaser.KeyCode.A))
    {
        leftAccel = this.game.physics.arcade.accelerationFromRotation(player.rotation - Math.PI/2, 150);
    }
	Phaser.Point.add(Phaser.Point.add(forwardAccel, leftAccel), rightAccel, player.body.acceleration);
	
    if (cursors.left.isDown)
    {
        player.body.angularVelocity = -300;
    }
    else if (cursors.right.isDown)
    {
        player.body.angularVelocity = 300;
    }
    else
    {
        player.body.angularVelocity = 0;
    }
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(player.x, player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  shotAsteroid: function(bullet, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    bullet.kill();
	asteroid.kill();
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  }
};

/*
TODO

-audio
-asteriod bounch
*/
