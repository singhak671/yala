const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const log = console.log;
const db_name = require('../config/config').db.name;
const DB_URL = `mongodb://127.0.0.1/${db_name}`

mongoose.connection.openUri(DB_URL);
/************************************ Events of mongoose connection. ******************************************************/
// CONNECTION EVENTS
// When successfully connected

mongoose.connection.on('connected',  ()=> {  
 log('success','Mongoose default connection open to ' + DB_URL);

});                
// If the connection throws an error
mongoose.connection.on('error', (err) =>{  
  log('error','Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected',  ()=> {  
  log('warning','Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', () =>{  
  mongoose.connection.close( ()=> { 
    log('warning','Mongoose default connection disconnected through app termination'); 
    process.exit(0); 
  }); 
});