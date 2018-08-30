const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');


let notificationSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user"},
    
    notification:[{
        createdAt:{
            type:Date,
            default:Date.now()
        }
    }]
    },{
    timestamps:true,
    strict:false
    })
    notificationSchema.plugin(paginate);
    notificationSchema.plugin(mongooseAggregatePaginate);
    
    var notification=mongoose.model("notification",notificationSchema)
    module.exports=notification
    