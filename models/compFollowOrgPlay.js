const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user");
let competitionFollowSchema = new Schema({ 
    organizer:{
        type: Schema.Types.ObjectId, ref:'user'
    },
    competitionId:{
        type: Schema.Types.ObjectId, ref:'competition'
    },
    playerId:{
        type:Schema.Types.ObjectId,ref:"user"
    },
    status:{
        type:String,
        default:"ACTIVE",
        uppercase:true
    },
    followStatus:{
        type:String,
        default:"PENDING",
        uppercase:true
    }}, 
    {
    timestamps: true
});

competitionFollowSchema.plugin(paginate);
var competitionFollow = mongoose.model('competitionFollow', competitionFollowSchema);




module.exports={
    competitionFollow:competitionFollow
}
