const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
let transactionSchema = new Schema({
    type:{
        type:String,
        enum:["COMPETITION","MEMBERSHIP","VENUE"]
    },
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user' 
    },
    playerId:{
        type: Schema.Types.ObjectId, ref: 'user' 

    },
    paymentDetails:[{
        createdAt:{
           type:Date,
           default:Date.now
        }
    }],
},{
    timestamps:true,
    strict:false
})
transactionSchema.plugin(paginate);
var transaction=mongoose.model("transaction",transactionSchema)
module.exports={
    organizerTransaction:transaction
}