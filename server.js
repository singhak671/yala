const express=require('express')
const bodyParser=require('body-parser')
const path=require('path')
const db=require('./db_connections/mongodb')
const app=express();
var FCM = require('fcm-push');
const cors = require('cors');
const TermsAndPolicy=("../model/termsAndPrivacyModel");
var Twocheckout = require('2checkout-node');
app.set('port',(process.env.PORT||5000));
app.use(bodyParser.urlencoded({
	extended:false
}));
app.use(bodyParser.json({
	limit:'50mb'
}));

app.use(cors());  

app.all('/*', function(req, res, next) {
	// CORS body
	res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	// Set custom body for CORS
	res.header('Access-Control-Allow-body', 'Content-type,Accept,X-Access-Token,X-Key');
	if (req.method == 'OPTIONS') {
	res.status(200).end();
	} else {
	next();
	}
	}); 
	
app.use('/api/v1/users',require('./routes/user'));
app.use('/api/v1/terms',require('./routes/terms'))
app.use('/api/v1/organizer',require('./routes/organizer'));
app.use('/api/v1/player',require('./routes/player.js'));
app.use('/api/v1/data',require('./routes/data.js'));


// var serverKey = 'AAAAQ0w6JT0:APA91bH6-L7dFYkPFneAiwevxN4rFPaewAylGJitQ4RnHVpsF2fuJpJPJ2gnxMJ2VPavo4PIqO8jcN2pWLuF0WCtQVHUjvlbtBcZAbhkkF5C3R5JMuC5ClfrMdocAaqJntGZ1yYYw5s50I-PCtSBQ4Ylk-m06navCA';
// var fcm = new FCM(serverKey);

// var message = {
//     to: 'cObLOr6Y1TE:APA91bEOMRY2_ZhxuZH3pBySfbuQLfd_gZkiUwj9uu7UClOZo6vVr0lUmPxegcrvctLe2AZ9BLZHlgWr-A43TwiAOR8s5rMTVt3xK0_0oTykIHlwmJsCC7FQE7R4pvq1lEwISn2vle_hWGD3_tRavG59D66QS5RB4Q', // required fill with device token or topics
//     // collapse_key: 'your_collapse_key', 
//     // data: {
//     //     your_custom_data_key: 'your_custom_data_value'
//     // },
//     notification: {
//         title: 'YALA App',
//         body: 'Player is added !'
//     }
// };

// //callback style
// fcm.send(message, function(err, response){
//     if (err) {
//         console.log("Something has gone wrong!");
//     } else {
//         console.log("Successfully sent with response: ", response);
//     }
// });

// //promise style
// fcm.send(message)
//     .then(function(response){
//         console.log("Successfully sent with response: ", response);
//     })
//     .catch(function(err){
//         console.log("Something has gone wrong!");
//         console.error(err);
//     })

app.listen(app.get('port'),()=>console.log('Server running on ' + app.get('port')));
