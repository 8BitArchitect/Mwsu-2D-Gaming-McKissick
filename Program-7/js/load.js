var loadState = {

    preload: function () {
        var loadingLabel = game.add.text(game.width/2, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);

        var progressBar = game.add.sprite(game.width/2, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
		
		game.load.image('jumpButton', 'assets/jumpButton.png');
		game.load.image('rightButton', 'assets/rightButton.png');
		game.load.image('leftButton', 'assets/leftButton.png');
    
        //game.load.image('player', 'assets/player.png');
		game.load.spritesheet('player', 'assets/player_sheet.png', 32, 32);
        //game.load.image('enemy', 'assets/enemy.png');
		game.load.spritesheet('enemy', 'assets/enemy_sheet.png', 32, 32);
        //game.load.image('coin', 'assets/coin.png');
		game.load.spritesheet('ticket', 'assets/ticket_sheet.png', 32, 32);
		// Load the tileset information
		game.load.image('tileset', 'assets/tileset.png');
		game.load.tilemap('level', 'assets/level.json', null, Phaser.Tilemap.TILED_JSON);
        //game.load.image('wall', 'assets/wall.png');
        game.load.image('background', 'assets/background.png');
		game.load.image('pixel', 'assets/pixel.png');
		game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
		
		// Sound when the player jumps
		game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
		// Sound when the player takes a coin
		game.load.audio('coin', ['assets/coin.ogg', 'assets/coin.mp3']);
		// Sound when the player dies
		game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);
		
		// Load the music in 2 different formats in the load.js file
		game.load.audio('menuMusic', ['assets/Menu.ogg', 'assets/Menu.mp3']);
		game.load.audio('gameMusic', ['assets/Game.ogg', 'assets/Game.mp3']);
    },

    create: function() {
		game.global.menuMusic = game.add.audio('menuMusic', .5, true), // Add the music
		game.global.gameMusic = game.add.audio('gameMusic', .01, true), // Add the music
		
		//game.global.gameMusic.play();
		//game.global.menuMusic.play();
		
        game.state.start('menu');
    }
};