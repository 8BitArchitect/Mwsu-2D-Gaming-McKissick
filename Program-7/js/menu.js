var menuState = {

    create: function() { 
        game.add.image(0, 0, 'background');
		
		game.global.menuMusic.fadeTo(1000, .5);
		game.global.gameMusic.fadeTo(2000, .01);

        // Changed the y position to -50 so we don't see the label
		var nameLabel = game.add.text(game.width/2, -50, 'Circus Clown Catastrophe', { font: '50px Arial', fill: '#ffffff' });
		nameLabel.anchor.setTo(.5, .5);
		
		// Create a tween on the label
		var tween = game.add.tween(nameLabel).to({y: 80}, 1000).easing(Phaser.Easing.Bounce.Out).start();

		// If 'bestScore' is not defined
		// It means that this is the first time the game is played
		if (!localStorage.getItem('bestScore')) {
			// Then set the best score to 0
			localStorage.setItem('bestScore', 0);
		}
		// If the score is higher than the best score
		if (game.global.score > localStorage.getItem('bestScore')) {
			// Then update the best score
			localStorage.setItem('bestScore', game.global.score);
		}
		var text = 'score: ' + game.global.score + '\nbest score: ' + localStorage.getItem('bestScore');
		var scoreLabel = game.add.text(game.width/2, game.height/2, text, { font: '25px Arial', fill: '#ffffff', align: 'center' });
		scoreLabel.anchor.setTo(0.5, 0.5);

        // Store the relevant text based on the device used
		var text;
		if (game.device.desktop) {
			text = 'press the up arrow key to start';
		}
		else {
			text = 'touch the screen to start';
		}
		// Display the text variable
		var startLabel = game.add.text(game.width/2, game.height-80, text, { font: '25px Arial', fill: '#ffffff' });
        startLabel.anchor.setTo(0.5, 0.5);
		
		// Add the button that calls the 'toggleSound' function when pressed
		this.muteButton = game.add.button(20, 20, 'mute', this.toggleSound,this);
		
		// Create the tween
		tween = game.add.tween(startLabel);
		// Rotate the label to -2 degrees in 500ms
		tween.to({angle: -2}, 500);
		// Then rotate the label to +2 degrees in 1000ms
		tween.to({angle: 2}, 1000);
		// And get back to our initial position in 500ms
		tween.to({angle: 0}, 500);
		// Loop indefinitely the tween
		tween.loop();
		// Start the tween
		tween.start();

		if (!game.device.desktop) {
			game.input.onDown.add(this.start, this);
		}
		else
		{
			var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
			upKey.onDown.add(this.start, this);
		}
    },
	
	update: function() {
		if (!game.global.gameMusic.isPlaying) {
			game.global.gameMusic.play();
			game.global.menuMusic.play();
		}
		this.syncMusic(game.global.gameMusic, game.global.menuMusic);
	},
	
	syncMusic: function(song1, song2) {
		if (game.math.fuzzyGreaterThan(song1.curentTime, song2.currentTime, 50))
		{
			song1.pause();
		}
		else if (game.math.fuzzyGreaterThan(song2.curentTime, song1.currentTime, 50))
		{
			song2.pause();
		}
		if (!song1.isPlaying && game.math.fuzzyEqual(song2.curentTime, song1.currentTime, 50))
		{
			song1.play();
		}
		if (!song2.isPlaying && game.math.fuzzyEqual(song2.curentTime, song1.currentTime, 50))
		{
			song2.play();
		}
	},
	
	// Function called when the 'muteButton' is pressed
	toggleSound: function() {
		// Switch the variable from true to false, or false to true
		// When 'game.sound.mute = true', Phaser will mute the game
		game.sound.mute = !game.sound.mute;
		// Change the frame of the button
		this.muteButton.frame = game.sound.mute ? 1 : 0;
	},

    start: function() {
		// If we tap in the top left corner of the game on mobile
		if (!game.device.desktop && game.input.y < 50 && game.input.x < 60) {
			// It means we want to mute the game, so we don't start the game
			return;
		}
		game.global.score = 0;
        game.state.start('level1');   
    },
};