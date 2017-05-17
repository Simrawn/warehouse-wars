var WebSocketServer = require('ws').Server
   ,wss = new WebSocketServer({port: 10391})
   ,stage = require('./static_files/whgame');

Player_id = 0;
Num_currentPlayers = 0; // so we want to start the game when we have reached 2 players
PlayerBoard_info = {}; // stores players location
WallsBoard_info = {}; //stores monsters, boxes and walls location
MonsterBoard_info = {};
BoxesBoard_info = {};
positions_taken = [];
var players = {};
var INTERVAL = 1000;
//var messages=null;
//var MainStage = null;
wss.broadcast = function(message){
	for(let ws of this.clients){ 
		ws.send(message);

	}
}


console.log("SET UP SERVER");
init();

wss.on('close', function() {
    console.log('disconnected');
});



wss.on('connection', function(ws) {
	

	console.log("Entered wss.on connection stuff");
	ws.on('message', function(message) {
		var purpose = JSON.parse(message).purpose;
		var info = JSON.parse(message).info_;
		switch(purpose){
			case "logged in":
				username = info;
				//console.log("in case logged in on server side");
				GeneratePlayerPosition(username);
				wss.broadcast(JSON.stringify({"purpose":"add player","info_":PlayerBoard_info}));
				wss.broadcast(JSON.stringify({"purpose": "add monsters","info_":MonsterBoard_info}));
				wss.broadcast(JSON.stringify({"purpose": "add boxes","info_":BoxesBoard_info}));

				Num_currentPlayers = Num_currentPlayers + 1;
				break;
			case "move on click":
			 	var player_moving = JSON.parse(message).username;
			 	//get position of this player who is trying to move
				
						position = PlayerBoard_info[player_moving];
						direction = info;
						console.log("Direction is:");
						console.log(direction);
						move(player_moving,position, direction);
					

				
			    //wss.broadcast(JSON.stringify({"purpose":"arrow clicked","info_":"a player has made a move"}));
			    break;

		    }

	});


});

function move(player_moving,player_position,direction){
    //"swapper" is being used to address the cell that we are swapping the player with
	var player_x = player_position[0];
	var player_y = player_position[1];
	var swapper_x;
	var swapper_y;
	
	if (direction == "nw"){
		swapper_x = player_x-1;
		var swapper_y = player_y-1;
	}
	else if (direction == "n"){
		swapper_x = player_x;
		var swapper_y = player_y-1;
	}
	else if (direction == "ne"){ 
		swapper_x = player_x+1;
		var swapper_y = player_y-1;
	}
	else if (direction == "s"){
		swapper_x = player_x;
		var swapper_y = player_y+1;
	}
	else if (direction == "sw"){
		swapper_x = player_x-1;
		var swapper_y = player_y+1;
	}
	else if (direction == "se"){
		swapper_x = player_x+1;
		var swapper_y = player_y+1;
	}
	else if (direction == "e"){ 
		 swapper_x = player_x+1;
		var swapper_y = player_y;
	}
	else if (direction == "w"){
		swapper_x = player_x-1;
		var swapper_y = player_y;
	}

	if(NotOutOfBounds(swapper_x,swapper_y) == true){
		console.log("Entered not out of bounds");
		swapper = [swapper_x,swapper_y];
		var swapper_id = getStageId(swapper_x,swapper_y);
		swapper_source = "blank";
		//get sources of the two images swapping
		for (var key in PlayerBoard_info){
			if (PlayerBoard_info[key] == swapper){
				swapper_source = "player";
			}
		}
		for (var key in MonsterBoard_info){
			    console.log("MonsterBoard_info[key] is");
				console.log(MonsterBoard_info[key]);

				console.log("swapper is");
				console.log(swapper);

			if (MonsterBoard_info[key] == swapper){
				

				swapper_source = "monster";
				console.log("rying to swap with a monster");
			}
		}
		for (var key in BoxesBoard_info){
			console.log("BoxesBoard_info[key] is");
				console.log(BoxesBoard_info[key]);

				console.log("swapper is");
				console.log(swapper);

			if (BoxesBoard_info[key][0] == swapper[0] && BoxesBoard_info[key][1] == swapper[1]){
				swapper_source = "box";
				console.log("rying to swap with a box");

			}
		}
		switch(swapper_source){
			case "player":
				//can't swap with another player
				//do nothing

			break;

			case "monster":
				//you die
				//TO DO: take player off screen 
				//		: take player off player list
				// 		: notify everyone that a player has died
				//alert("YOU DIE");
			break;

			case "box":
				//TO DO: move box
				//FOR NOW: Do nothing since you havent implemented move boxes yet
			

			break;

			case "blank": //if nothing else, then it is a blank. You just swap.
				player = [player_x, player_y];
				swapper = [swapper_x, swapper_y];
				PlayerBoard_info[player_moving][0] = swapper_x;
	            PlayerBoard_info[player_moving][1] = swapper_y;	
			    wss.broadcast(JSON.stringify({"purpose":"move player to blank","info_":[player_x,player_y,swapper_x, swapper_y]}));
			    break;
		}

	}


}

function init(){
	var num_boxes = 10;
	var num_monsters = 2;
	var grid_width = 22;
	var grid_height = 22;

	//call a function to populate the monster board
	create_coordinates(num_monsters,MonsterBoard_info);
	create_coordinates(num_boxes,BoxesBoard_info);

	handle = setInterval(function(){move_monsters();}, INTERVAL);

}

function getStageId(x,y){ 
	return x +"_"+ y;
}


function move_monsters(){ //want to move monsters if the destination is blank only, else do nothing , if destination is player game over.
    

	for (var key in MonsterBoard_info) {

		old_posx = MonsterBoard_info[key][0];
		old_posy = MonsterBoard_info[key][1];

		new_pos = find_Monsterpos(old_posx,old_posy);

		if (NotOutOfBounds(new_pos[0],new_pos[1]) == true){
			if (!if_player(new_pos[0],new_pos[1]) && !ifBox(new_pos[0],new_pos[1])){
				console.log("moving monster");
				MonsterBoard_info[key][0] = new_pos[0];
	            MonsterBoard_info[key][1] = new_pos[1];			   
			    wss.broadcast(JSON.stringify({"purpose": "move monsters","info_":[old_posx, old_posy, new_pos[0],new_pos[1]]}));

			}
		}
		else{
			console.log("out of bounds:");
			console.log(new_pos);
		}


	}


}

function if_player(x,y){
	for (var key in PlayerBoard_info){
		postion = PlayerBoard_info[key];
		if (position[0] == x && position[1] == y){
			return true;
		}

	}
	return false;
}

function ifBox(x,y){
	console.log("in posiiton move");
	// check if box
	for (var key in BoxesBoard_info){
		if (BoxesBoard_info[key][0] == x && BoxesBoard_info[key][1]==y){
			return true;
		}
	}
	return false;
}

function NotOutOfBounds(new_position_x,new_position_y ){
    return new_position_x >= 0 && new_position_x <= 19 &&  new_position_y >=0 && new_position_y <= 19;
}

function find_Monsterpos(x,y){
	 delta_x = generate_random_coordinate(-1,1);
     delta_y = generate_random_coordinate(-1,1);
     new_pos_x = x + delta_x;
     new_pos_y = y + delta_y;

     return [new_pos_x,new_pos_y];
}

function find_valid_position(){
	var posx  = create_player_coordinate();
	var posy = create_player_coordinate();
	while (verify_position(posx,posy)==false){ // just checking that the post is not taken
		posx  = create_player_coordinate();
	    posy = create_player_coordinate();
	   
	}	
	return [posx,posy];
}

//Create monster positions for the board
function create_coordinates(num,collection){
	var posx = 0;
	var posy = 0;
	var position;
	for (var i = 1; i <= num; i++){
		position = find_valid_position();
		collection[i] = position;
		
		positions_taken.push(position);
	}
}

//create a function to initialize the game
function GeneratePlayerPosition(username){
	Player_id  = Player_id +1;
    var posx  = create_player_coordinate();
	var posy = create_player_coordinate();
	position = find_valid_position();

	PlayerBoard_info[username] = position;	
	positions_taken.push(position);
	//this.stage.initialize();
}

function create_player_coordinate(){
	var x = generate_random_coordinate(0,19);
	return x;
}

function generate_random_coordinate(min,max){
	min = Math.ceil(min);
    max = Math.floor(max);
	var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
}


function verify_position(x, y){
	for (var i = 0; i < positions_taken.length;i++ ){
		if (x == positions_taken[i][0] && y== positions_taken[i][1]){
			return false;
		}
	}
	return true;
}

