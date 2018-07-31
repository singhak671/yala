const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

let playerSchema = new Schema({
   organizer:Schema.Types.ObjectId,
   firstName:String,
   lastName:String,
   teamId:{type:Schema.Types.ObjectId, ref:'createteamincompetitions'},
   teamName:String,
   competitionId:{type:Schema.Types.ObjectId,ref:'competition'},
   competitionName:String,
   dob:String,
   status:String,
   email:String,
   gender:String,
   countryCode:String,
   mobileNumber:String,
   country:String
    },{
    timestamps:true
    })
    playerSchema.plugin(paginate);
    playerSchema.plugin(mongooseAggregatePaginate);
    var player=mongoose.model("player",playerSchema)
    module.exports=player
    