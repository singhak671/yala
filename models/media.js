const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

let mediaSchema = new Schema({
     organizer:{
         type:Schema.Types.ObjectId,
         ref:"user"
     },
     typeOfMedia:{
          type:String,
          uppercase:true
     },
     competitionId:{type:Schema.Types.ObjectId,ref:'competition'},
     competitionName:String,
     title:String,
     description:String,
     like:[{
         type:Schema.Types.ObjectId
     }],
     comments:[{
         commentId:{type:Schema.Types.ObjectId,ref:"user"},
         text:String
     }],
     mediaUrls:[{public_id:String,url:String}],
     youtubeUrls:{
         type:String
     }
    },{
    timestamps:true
    })
    mediaSchema.plugin(paginate);
    mediaSchema.plugin(mongooseAggregatePaginate);
    var media=mongoose.model("media",mediaSchema)
    module.exports=media
    