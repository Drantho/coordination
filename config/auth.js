// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'twitterAuth' : {
		'consumerKey' 		: process.env.TWITTER_API_KEY,
		'consumerSecret' 	: process.env.TWITTER_API_SECRET,
		'callbackURL' 		: 'https://coordination-drantho.c9users.io/auth/twitter/callback'
	},

};      