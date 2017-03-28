// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'twitterAuth' : {
		'consumerKey' 		: process.env.TWITTER_API_KEY,
		'consumerSecret' 	: process.env.TWITTER_API_SECRET,
		'callbackURL' 		: 'https://immense-retreat-13727.herokuapp.com//auth/twitter/callback'
	},

};      