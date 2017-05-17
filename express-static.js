/* What about serving up static content, kind of like apache? */
//API STUFF WILL BE HERE

//mongo --host mcsdb.utm.utoronto.ca -u 'jaggisi1' -p '74162' --authenticationDatabase 'jaggisi1_309'

var setconn = require('./setupdbconn');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/',express.static('static_files')); // this directory has files to be returned

var MongoClient = require('mongodb');
var url = setconn.returnconn();
//var url = 'mongodb://jaggisi1:74162@mcsdb.utm.utoronto.ca:27017/jaggisi1_309';


// Use connect method to connect to the server


    //**********Authorising LOGIN ********************
    app.post('/login', function(req,res){


		db = MongoClient.connect(url, function(err, db) {
        console.log(err);	   
        //console.log(db);
        var collection = db.collection('players');
        collection.find({"name" : req.body.username, "password" : req.body.password}).count().then(function(numItems){
        	if (numItems ==1 ){
        		res.statusCode = 200;
        		res.sendStatus(res.statusCode);
        		console.log("user logged in");
        	}
        	else{
        		//Get proper response codes based on whether wrong password or user doesnt exist
        		res.statusCode = 401;
        		res.sendStatus(res.statusCode);
        		console.log("Sorry, unauthorised. Please try again.")
        	}
        });


	    db.close();  
	});
	});

    //************Registering user *******************
    app.post('/register', function (req,res){
		db = MongoClient.connect(url, function(err, db) {
		console.log(err);	   
		var collection = db.collection('players');
		collection.insert({"name":req.body.username, "password":req.body.password, "email":req.body.email}
			, function(error,result){
				if (result){
					res.statusCode = 201;
        		    res.sendStatus(res.statusCode);

					console.log("Successfully added user to database.");

				}
				else{//do better error check to tell them what went wrong
					res.statusCode = 403;
        		    res.sendStatus(res.statusCode);

					console.log("Could not add user");
				}
			});
 
 		   db.close();  
		});
	});


	//*******************Add new user to highscores table **********************
	app.post('/registerhighscore', function (req,res){
		console.log("Entered register highscore in express static");
		db = MongoClient.connect(url, function(err, db) {
		console.log(err);	   
		var collection = db.collection('highscores');
		collection.insert({"name":req.body.username, "highsore":0}
			, function(error,result){
				if (result){
					res.statusCode = 201;
        		    res.sendStatus(res.statusCode);

					console.log("Successfully added user to highscores table.");

				}
				else{//do better error check to tell them what went wrong
					res.statusCode = 403;
        		    res.sendStatus(res.statusCode);

					console.log("Could not add user highscore");
				}
			});
 
 		   db.close();  
		});



	});

	//********************** Update highscores ************************
	app.put('/updateHighscores', function (req, res){ //show updated profile
	
		db = MongoClient.connect(url, function(err, db) {
		var collection = db.collection('highscores');
		collection.updateOne({"name":req.body.username},{$set:{highsore:req.body.highscore}}).then(function(result){
				if (result.matchedCount == 1){
					    res.statusCode = 200;
					    res.status(res.statusCode).send("Highscore sucessfully updated");
					    console.log("Succesfully updated user highscore.");					
				}
				else{
					res.statusCode = 404;
					res.status(res.statusCode).send("Account does not exist");

					console.log("Could not update highscore");
				    }
			});
 
 		   db.close();  
		});
		
		
	});


     //********************************* User management, get profile **************************
	//SOURCE: http://stackoverflow.com/questions/39072592/fetch-a-particular-value-using-node-js-and-mongodb
	app.get('/users/retrieveprofile/:username/:password', function (req, res){ //gives you 'users profile
		db = MongoClient.connect(url, function(err, db) {
		var collection = db.collection('players');
		console.log({'username': req.params.username});
		console.log({'password': req.params.password});
		collection.find({"name":req.params.username,  "password" : req.params.password}, {name:1, email:1, password:1 }).toArray(function(err,items){
			if (items.length > 0){
			    res.statusCode = 200;
			    res.status(res.statusCode).send(items);
			}
			else{
				res.statusCode = 404;
			    res.status(res.statusCode).send("Account does not exist");
			}
		db.close();
				});
	});

	});

	 //********************************* User management, update profile **************************
	app.put('/updateprofile', function (req, res){ //show updated profile
	
		db = MongoClient.connect(url, function(err, db) {
		var collection = db.collection('players');
		collection.updateOne({"name":req.body.username},{$set:{password:req.body.password}}).then(function(result){
				if (result.matchedCount == 1){
					    res.statusCode = 200;
					    res.status(res.statusCode).send("Account sucessfully updated");
					    console.log("Succesfully updated user profile.");
					   
					
					
				}
				else{
					res.statusCode = 404;
					res.status(res.statusCode).send("Account does not exist");

					console.log("Could not update user");
				    }
			});
 
 		   db.close();  
		});
		
		
	});

	//********************************* User management, delete profile **************************
	app.post('/users/deleteprofile/:username/:password', function (req, res){ //delete profile
		
		
	});





     //********************************* Get high scores **************************
	app.get('/retrievehighscores', function (req, res){ //gives you 'username's profile
		db = MongoClient.connect(url, function(err, db) {
		var collection = db.collection('highscores');
		collection.find({}, {name:1, highsore:1 }).sort({highsore: -1}).toArray(function(err,items){
			res.statusCode = 200;
			res.status(res.statusCode).send(items);
		db.close();
				});
	});
		
		
	});

	 //********************************* Get users **************************
	app.get('/retrieveusers', function (req, res){ //gives you 'username's profile
		db = MongoClient.connect(url, function(err, db) {
		var collection = db.collection('players');
		console.log(req.body.username);
		collection.find({"name":req.body.username}, {name:1}).toArray(function(err,items){
		console.log(items);
		if(items.length == 0){
			console.log("name unique");
			res.statusCode = 200;
			res.status(res.statusCode).send(items);
		}
		else{
			res.statusCode = 403;
			res.status(res.statusCode).send(items);
		}
		

		db.close();
				});
	});
		
		
	});





	app.listen(10390, function () {
	  console.log('Example app listening on port 10390!');
	});

