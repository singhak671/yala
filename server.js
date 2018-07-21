const express=require('express')
const bodyParser=require('body-parser')
const path=require('path')
const db=require('./db_connections/mongodb')
const app=express();
var Twocheckout = require('2checkout-node');
app.set('port',(process.env.PORT||5000));
app.use(bodyParser.urlencoded({
	extended:false
}));
app.use(bodyParser.json({
	limit:'50mb'
}));

app.use('/api/v1/users',require('./routes/user'));
app.use('/api/v1/organizer',require('./routes/organizer'));

app.listen(app.get('port'),()=>console.log('Server running on ' + app.get('port')));
