const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user")
let chatSchema = new Schema({ 
    organizerId:{
        type: Schema.Types.ObjectId, ref:'user'
    },
    playerId:{
        type: Schema.Types.ObjectId, ref:'user'
    },
    message:[{
        senderId:{
            type: Schema.Types.ObjectId, ref:'user'
        },
        message:String,
        createdAt:{
            type:Date,
            default:Date.now
        }
                 
    }]
}, {
    timestamps: true
});

chatSchema.plugin(paginate);
var chat = mongoose.model('chat', chatSchema);
module.exports={
    chat:chat,
}