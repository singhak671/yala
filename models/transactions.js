const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
let transactionSchema = new Schema({
    type:{
        type:String,
        enum:["COMPETITION","MEMBERSHIP","VENUE","PRODUCT"]
    },
    productId:{ type: Schema.Types.ObjectId, ref: 'product'},
    productName:String,
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user' 
    },
    organizerName:String,
    
    playerId:{
        type: Schema.Types.ObjectId, ref: 'user' 

    },
    playerName:String,
    paymentDetails:[{
        createdAt:{
           type:Date,
           default:Date.now
        }
    }],
    productStatus:{
        type:String,
        default:"PENDING",
    }
},{
    timestamps:true,
    strict:false
})
transactionSchema.plugin(paginate);
var transaction=mongoose.model("transaction",transactionSchema)
module.exports={
    organizerTransaction:transaction
}