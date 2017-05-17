function Stage(width, height, stageElementID){
	this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
	this.player=null; // a special actor, the player
    this.spaces_to_move = 0;
    this.score = 0;
	// the logical width and height of the stage
	this.width=width;
	this.height=height;
	this.count_monsters;
	// the element containing the visual representation of the stage
	this.stageElementID=stageElementID;
	// take a look at the value of these to understand why we capture them this way
	// an alternative would be to use 'new Image()'
	this.blankImageSrc=document.getElementById('blankImage').src;
	this.monsterImageSrc=document.getElementById('monsterImage').src;
	this.playerImageSrc=document.getElementById('playerImage').src;
	this.boxImageSrc=document.getElementById('boxImage').src;
	this.wallImageSrc=document.getElementById('wallImage').src;
	wallWidth = this.wallImageSrc.clientWidth;
	wallHeight = this.wallImageSrc.clientHeight;
	this.GameOutline = null;

}

// initialize an instance of the game
Stage.prototype.initialize=function(){
    // Put it in the stageElementID (innerHTML)
    // Add the player to the center of the stage
	document.getElementById(this.stageElementID).innerHTML = this.build_stage();

}


Stage.prototype.build_stage = function(){
	var s='<table border=2 frame=void border="1" cellpadding=0 cellspacing=0">';
	for(var i=0; i<=this.height+1; i++){
		s += '<tr><td> <img width = "35" height = "35" src = '.concat(this.wallImageSrc).concat('></td>');
		for(var j=0; j<this.width; j++){
			if (i == 0 || i == this.height+1){ //insert wall for top
			     s += '<td> <img width = "35" height = "35" src = '.concat(this.wallImageSrc).concat('></td>');    // Add walls around the outside of the stage, so actors can't leave the stage
		        }
		    else{
		         s += '<td> <img src = '.concat(this.blankImageSrc).concat(' id =\"'+ this.getStageId(j,i-1) + '\"></td>'); 
		        }
		    }
		s += '<td> <img width = "35" height = "35" src = '.concat(this.wallImageSrc).concat('></td>').concat('</tr>');    // Add walls around the outside of the stage, so actors can't leave the stage

	    } 	

	s+="</table>";
	this.GameOutline = s;
	//console.log(this.GameOutline);
	return s;
   
}



Stage.prototype.place_actors = function(actor,positions){
	//Loop through the player positions and place them on the board
	if (actor == "player"){
		var image = this.playerImageSrc;
	}

	else if(actor == "monster"){
		var image = this.monsterImageSrc;
	}

	else if(actor == "box"){
		var image = this.boxImageSrc;
	}


    for (var key in positions) {
		var x = positions[key][0];
		var y = positions[key][1];
	    var k = this.getStageId(x,y);
			$("#" + k).attr("src",image);
	}
}


Stage.prototype.swap_actors = function(action, positions){
	if(action == "swap a monster" || action == "swap a player"){ 
        var source_id = this.getStageId(positions[0],positions[1]); 
	    var source_src = document.getElementById(source_id).src; //Getting the image that is at swapper_id
	
   
	    var dest_id = this.getStageId(positions[2],positions[3]);
	    var dest_src = document.getElementById(dest_id).src; //Getting the image that is at swapper_id


	    this.setImage(source_id, dest_src); //Changing the image at player
	    this.setImage(dest_id, source_src); 
    }


}

Stage.prototype.remove_player = function(position){
	var pos = this.getStageId(position[0],position[1]);
	this.setImage(pos, this.blankImage);
	alert("Player out.");
}


Stage.prototype.generate_random_coordinate = function(min,max){
	min = Math.ceil(min);
    max = Math.floor(max);
	var rand = Math.floor(Math.random() * (max - min + 1)) + min;
    return rand;
}


Stage.prototype.getStageId=function(x,y){ 
	return x +"_"+ y;
}


Stage.prototype.setImage=function(id, src){
    //var id = this.getStageId(x,y);
    $("#" + id).attr("src",src);
    
}
