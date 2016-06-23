var mainState = {

    preload: function() {
		
    },

    create: function() { 
        
    },

    update: function() {
		
    },
};

//start the game
var game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');