const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user");
let serviceBookingSchema = new Schema({ 
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
      type:Date
    },
    endDate:{
        type:Date
    },
    playerAttendence:[{
        attendenceDate:Date,
attendenceStatus:Boolean
    }],
    duration:[{
        startTime:String,
        endTime:String,
        totalDuration:String,
        price:String
      }
    ],
    totalPrice:String,
    timeSlots:Array,
    booking:{
        type:Boolean,
        default:false
    },
    playerId:{
        type:Schema.Types.ObjectId,ref:"user"
    },
    transactionDetailId:{ type: Schema.Types.ObjectId, ref:'transaction'},
    status:{
        type:String,
        default:"Confirmed",
    },
    serviceId:{
        type:Schema.Types.ObjectId,ref:"service"
    },
    serviceName:{
        type:String
    },
    paymentMethod:String,
    followStatus:{
        type:String,
        default:"PENDING",
        uppercase:true
    },
    newsLetterVisible:{
        type:Boolean,
        default:true
    },
    visibleInMemberCard:{
        type:Boolean,
        default:true
    },
    visibleInBooking:{
        type:Boolean,
        default:true        
    }

}, 
    
    {
    timestamps: true
});

serviceBookingSchema.plugin(paginate);
serviceBookingSchema.plugin(mongooseAggregatePaginate);
var serviceBooking = mongoose.model('serviceBooking', serviceBookingSchema);




module.exports={
    serviceBooking:serviceBooking
}
