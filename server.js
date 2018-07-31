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








var serverKey = 'AAAAhTQQvgs:APA91bHYy14WxdIN6yAmGZJ3Utu07vukU3Yjonevmgq5-_zUeTkmgo2Aw_ldeNHJ7vLC29Iquoc1IqBQqabD_qSLDypMY3axWuHoN0N7JYMj3EbNyzmg9ApYQYDBiDiI9SZnt1JRVoWoYjV5ZVFZEOmGzMedL1Vv5A';
var fcm = new FCM(serverKey);

var message = {
    to: 'ddMQdHYWfB4:APA91bHmiaJtIJAlonDRDEKSlZFi3-6tvvMJ9qRIs_IBRbZakJG1HUgmOZRkHQJ54uVwvcuPXhGHk-cc3AmZL0Cvnnklx5wC7-nQQXQtAiB5D5ttAOR-RkBZI6ZrjLeOD9uh6SttStoN2g2dmETfBpRqTpqUUhtXqQ', // required fill with device token or topics
    // collapse_key: 'your_collapse_key', 
    // data: {
    //     your_custom_data_key: 'your_custom_data_value'
    // },
    notification: {
        title: 'YALA App',
        body: 'Player is added !'
    }
};

//callback style
fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Successfully sent with response: ", response);
    }
});

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
