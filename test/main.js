var mainState = {

    preload: function()
	{
		game.load.image('tiles', 'BasicTiles.png');
		game.load.image('square', 'square.png');
		game.load.tilemap('blank', 'blank.json', null, Phaser.Tilemap.TILED_JSON);
    },

    create: function()
	{ 
        // Create the tilemap
		this.map = game.add.tilemap('blank');
		this.map.addTilesetImage('tiles');
		this.layer = this.map.createLayer('Tile Layer 1');
		//this.map.fill(15, 0, 0, 64, 64, layer)

		// Add the tileset to the map
		
		this.addRooms(this.map, 10000);
		
    },
	
	addRooms: function(map, maxFails)
	{
		var fails = 0;
		while (fails < maxFails)
		{
			var roomWidth = Math.floor(Math.sqrt(this.rnd.integerInRange(9, 80)));
			var roomHeight = Math.floor(Math.sqrt(this.rnd.integerInRange(9, 80)));
			var originX = this.rnd.integerInRange(0, 64 - roomWidth);
			var originY = this.rnd.integerInRange(0, 64 - roomHeight);
			var bValid = true
			for (i = originX; i < originX + roomWidth; i++)
			{
				for (j = originY; j < originY + roomHeight; j++)
				{
					if (map.hasTile(i, j, 'Tile Layer 1'))
					{
						bValid = false;
					}
				}
			}
			if (bValid)
			{
				//top row
				map.fill(2, originX + 1, originY, roomWidth-2, 1, 'Tile Layer 1');
				//bottom row
				map.fill(5, originX + 1, originY + roomHeight - 1, roomWidth-2, 1, 'Tile Layer 1');
				//right side
				map.fill(9, originX, originY+1, 1, roomHeight-2, 'Tile Layer 1');
				//left side
				map.fill(3, originX + roomWidth - 1, originY+1, 1, roomHeight-2, 'Tile Layer 1');
				//body
				map.fill(1, originX+1, originY+1, roomWidth-2, roomHeight-2, 'Tile Layer 1');
				//corners
				map.putTile(10, originX, originY, 'Tile Layer 1');
				map.putTile(4, originX + roomWidth - 1, originY, 'Tile Layer 1');
				map.putTile(13, originX, originY + roomHeight - 1, 'Tile Layer 1');
				map.putTile(7, originX + roomWidth - 1, originY + roomHeight - 1, 'Tile Layer 1');
				//tint
				/* var color = game.add.sprite(originX * 16, originY * 16, 'square', 0);
				color.scale.x = roomWidth/16;
				color.scale.y = roomHeight/16;
				//color.frame = 0;
				color.tint = game.rnd.integerInRange(0, 0xffffff)
				color.alpha = 0.5 */
			}
			else
			{
				fails++;
			}
		}
	}
};

//start the game
var game = new Phaser.Game(1024, 1024, Phaser.AUTO, 'gameDiv');
game.state.add('main', mainState);
game.state.start('main');