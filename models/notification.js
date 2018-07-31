const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

let notificationSchema = new Schema({
    organizer:Schema.Types.ObjectId,
    title:String,
    message:String
}
    ,{
    timestamps:true
    })
    notificationSchema.plugin(paginate);
    notificationSchema.plugin(mongooseAggregatePaginate);
    var notification=mongoose.model("notification",notificationSchema)
    module.exports=notification
    