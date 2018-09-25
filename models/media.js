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
          uppercase:true,
          enum:["NEWS","VIDEO","ALBUM"]
     },
     competitionId:{type:Schema.Types.ObjectId,ref:'competition',default:null},
     competitionName:String,
     membershipId:{type:Schema.Types.ObjectId,ref:'orgmembership',default:null},
     membershipName:{type:String},
     title:String,
     description:String,
     like:[{
        type:Schema.Types.ObjectId,ref:"user"
     }],
     noOfLike:{
         type:Number,
         default:0
     },
     comments:[{
         commentId:{type:Schema.Types.ObjectId,ref:"user"},
         text:String,
         commentImage:String,
         commentFirstName:String,
         commentLastName:String,
         createdAt: {
            type: Date,
            default: Date.now
        }
     }],
     noOfComment:{
        type:Number,
        default:0
    },
    date:{
        type:String
    },
    time:{
        type:String
    },
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
    