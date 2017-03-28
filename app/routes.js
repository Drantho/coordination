// app/routes.js
var RSVP = require('./models/rsvpSchema');

module.exports = function(app, passport) {


	var merge = require('merge');
	var yelp = require('node-yelp-api');
	var user = require("./models/rsvpSchema");
	var request = require("request");
	var cookieParser = require('cookie-parser');
	
	app.use(cookieParser());
 
	var options = {
		consumer_key: process.env.YELP_Consumer_Key,
		consumer_secret: process.env.YELP_Consumer_Secret,
		token: process.env.YELP_Token,
		token_secret: process.env.YELP_Token_Secret,
	};

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		if(req.cookies.searchText){
			console.log('cookie found: ' + req.cookies.searchText)
			var searchText = req.cookies.searchText;
			req.body.search = searchText;
			res.clearCookie('searchText');
			
			res.redirect('/' + searchText)
			
		} else{
			console.log('cookie not found');
			
		}
		res.render('index.handlebars'); // load the index.ejs file	
	});

	// =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
    
    app.get('/unauthenticatedSearch/:search', function(req, res){
    	console.log('search: ' + req.params.search);
    	res.cookie('searchText', req.params.search);
		console.log('cookie set');
		console.log(req.cookies.searchText);
			
		res.redirect('/auth/twitter');	
    });
    
    app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/',
            failureRedirect : '/'
        })
    );
    
    // =====================================
    // SEARCH RESULTS
    // =====================================
    
    app.post('/', function(req, res){
		console.log('post fires');
		
		var parameters = {
			term: 'bar',
			location: req.body.search,
			
		};
		yelp.search(merge(options, parameters), function(err, response, data){
			if(err){
				console.log(err);
			}
			
			var results = JSON.parse(data);
			
			var businesses = results.businesses;
			
			//console.log(businesses);
			
			var start = new Date();
			start.setHours(0,0,0,0);

			var end = new Date();
			end.setHours(23,59,59,999);
			
			RSVP.find ({ $and: [ { "location" : { $in: YelpResponseObjectToArray(businesses) } }, {"date": {$gte: start, $lt: end}} ] }, function(err, results){
				if(err){
					console.log(err);
				}
				
				//console.log('===============================RESULTS===========================')
				//console.log(results);
				businesses = AddCount(businesses, results);
				
				try{
					var userName = req.user.twitter.id;
					businesses = AddGoing(businesses, results, req.user.twitter.id);	
				}catch(err){
					var userName = null;
				}
		
				res.render('index.handlebars', {
					userName : userName,
					businesses : businesses,
					searchText : req.body.search
				});
				
				
			} );
			
			
		});
		
		
		
	});
	
	app.get('/:location', function(req, res){
		console.log('post fires');
		
		var parameters = {
			term: 'bar',
			location: req.params.location,
			
		};
		yelp.search(merge(options, parameters), function(err, response, data){
			if(err){
				console.log(err);
			}
			
			var results = JSON.parse(data);
			
			var businesses = results.businesses;
			
			//console.log(businesses);
			
			var start = new Date();
			start.setHours(0,0,0,0);

			var end = new Date();
			end.setHours(23,59,59,999);
			
			RSVP.find ({ $and: [ { "location" : { $in: YelpResponseObjectToArray(businesses) } }, {"date": {$gte: start, $lt: end}} ] }, function(err, results){
				if(err){
					console.log(err);
				}
				
				//console.log('===============================RESULTS===========================')
				//console.log(results);
				businesses = AddCount(businesses, results);
				
				try{
					var userName = req.user.twitter.id;
					businesses = AddGoing(businesses, results, req.user.twitter.id);
				}catch(err){
					var userName = null;
				}
				console.log(businesses);
		
				res.render('index.handlebars', {
					userName : userName,
					businesses : businesses,
					searchText : req.params.location
				});
				
				
			} );
			
			
		});
		
		
		
	});
	
	// ==================================================
	// ADD DB GOING ENTRY
	// ==================================================
	
    app.get('/api/:rsvpLocation', isLoggedIn, function(req, res) {
	console.log(req.user);
		
		if(req.user){
			
			var addedDate = new Date();
			
			var rsvp = new RSVP({
				user: req.user.twitter.id,
				location : req.params.rsvpLocation,
				date : addedDate
			});
		
			rsvp.save();
			
			var start = new Date();
			start.setHours(0,0,0,0);

			var end = new Date();
			end.setHours(23,59,59,999);
			
			RSVP.find({ $and: [ { "location" : req.params.rsvpLocation }, {date: {$gte: start, $lt: end}} ] }, function(err, count){
				if(err){
					console.log(err);
				}
				var response = {};
				//console.log('========================ADD to db section =======================');
				//console.log('req.params.rsvpLocation: ' + req.params.rsvpLocation + ' addedDate: ' + addedDate + ' start: ' + start + ' end: ' + end + ' add db count: ' + count)
				response.count = count.length + 1;
				console.log("count returned after add to db: " + response.count)
				res.send(response);
				
			});
			
		
		} else{
			
			
			
			res.redirect('/auth/twitter');
		}
		
	});
	
	
	// ==================================================
	// DELETE DB GOING ENTRY
	// ==================================================
	
    app.get('/delete/:rsvpLocation', isLoggedIn, function(req, res) {
	console.log(req.user);
		
		if(req.user){
		
			RSVP.find
		
			var response = {};
			
			var start = new Date();
			start.setHours(0,0,0,0);

			var end = new Date();
			end.setHours(23,59,59,999);
			
			
			RSVP.find({ $and: [ { "location" : req.params.rsvpLocation }, {date: {$gte: start, $lt: end}}, {user : req.user.twitter.id} ] }).remove().exec();
			
			
			
			RSVP.find({ $and: [ { "location" : req.params.rsvpLocation }, {date: {$gte: start, $lt: end}} ] }, function(err, count){
				if(err){
					console.log(err);
				}
				
				response.count = count.length;
				res.send(response);
				
			});
		
			
		
		} else{
			res.redirect('/auth/twitter');
		}
		
	});
	
	
	app.get('/auth/twitter', passport.authenticate('twitter'));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect : '/',
            failureRedirect : '/'
        })
    );

};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/auth/twitter');
	console.log('not logged in');
}

// extract ids from yelp response
function YelpResponseObjectToArray(businesses){
	var names=[];
	for(var i=0; i<businesses.length; i++){
		names.push(businesses[i].id);
	}
	//console.log(names);
	return names;
}

// add count property to yelp results
function AddCount(yelpObject, goingObject){
	for(var i=0; i<yelpObject.length; i++){
		yelpObject[i].count=0;
		for(var j=0; j<goingObject.length; j++){
			//console.log(yelpObject[i].id + ' ?= ' + goingObject[j].location);
			if(yelpObject[i].id == goingObject[j].location){
				yelpObject[i].count ++;
			}
		}
	}
	return yelpObject;
}


// add going property to yelp results
function AddGoing(yelpObject, goingObject, user){
	for(var i=0; i<yelpObject.length; i++){
		yelpObject[i].going = false;
		for(var j=0; j<goingObject.length; j++){
			if(yelpObject[i].id == goingObject[j].location && goingObject[j].user == user){
				yelpObject[i].going = true;
			}
		}
	}
	return yelpObject;
}

