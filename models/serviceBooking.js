const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user");
let membershipFollowSchema = new Schema({ 
    organizerId:{
        type: Schema.Types.ObjectId, ref:'user'
    },
    membershipId:{
        type: Schema.Types.ObjectId, ref:'orgmembership'
    },
    membershipName:{
       type:String
    },
    startDate:{

    },
    endDate:{

    },
    timeSlot:[],
    booking:{
        type:Boolean,
        default:false
    },
    playerId:{
        type:Schema.Types.ObjectId,ref:"user"
    },
    status:{
        type:String,
        default:"confirmed",
    },
    serviceId:{
        type:Schema.Types.ObjectId,ref:"service"
    },
    serviceName:{
        type:String
    },
    followStatus:{
        type:String,
        default:"PENDING",
        uppercase:true
    },
    paymentMode:{
        type:String,
        enum:["online","cash"]
    },
    amount:{
        type:Number
    }
}, 
    
    {
    timestamps: true
});

membershipFollowSchema.plugin(paginate);
membershipFollowSchema.plugin(mongooseAggregatePaginate);
var followSchema = mongoose.model('membershipFollow', membershipFollowSchema);




module.exports={
    membershipFollow:followSchema
}
