const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');

var Object = mongoose.Types.ObjectId;


const Schema = mongoose.Schema;

let membershipSchema = new Schema({
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user'
    },
    membershipName:{
        type:String
    },
    playerFollowStatus:[{
        _id:false,
        playerId:{
            type: Schema.Types.ObjectId, ref: 'user'
        },
        followStatus:String
    }],
    imageURL:String,
    clubName:{
        type:String
    },
    imagePublicId:String,
    clubId:{
        type: Schema.Types.ObjectId, ref: 'club'
    },
    status:{
        type:String
    },
    allowPublicToFollow:{
        type:Boolean
    },
    services:[{
        type: Schema.Types.ObjectId, ref: 'service'
    }],
    allowComments:{
        type:Boolean,
        default:true
    },
    enableRegistration:{
        type:Boolean,
        default:true
    },
    

    dynamicFormField:{
        type:Array
    }

}, {
    timestamps: true,
}

)


membershipSchema.plugin(paginate);
membershipSchema.plugin(mongooseAggregatePaginate);

var membership = mongoose.model('orgmembership', membershipSchema);


let serviceSchema = new Schema({
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user'
    },
    organizerName:String,
    membershipId:{
        type: Schema.Types.ObjectId, ref: 'orgmembership'
    },
    membershipName:String,
    serviceName:{
        type:String
    },
    amount:{
        type:String
    },
    playerId: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
        }],
    duration:{
        type:String
    },
    professionals:[{
        professionalId: {type:Schema.Types.ObjectId, ref: 'professional'},
        professionalName:String
    }],
    status:String,
    venueName:String,
    venueId:{type:Schema.Types.ObjectId, ref: 'venue'},
    description:String,
    noOfPlayersPerSlot:Number,
    serviceType:{
        type:String,
        enum:["free","paid"]
    },
    published:{
        type:Boolean,
        default:false},
    offDays:[{
        type:String
    }],
    startDate:Date,
    endDate:Date,
    showStatus:{
        type:String,
        default:"ACTIVE"
    },
    startDuration:String,
    endDuration:String,
    slots:[{
        time:String,
        noOfSeats:Number
    }]

}, {
    timestamps: true,
}

)


serviceSchema.plugin(paginate);

var service = mongoose.model('service', serviceSchema);


let professionalSchema = new Schema({
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user'
    },
    
    professionalName:{
        type:String
    },
    email:{
        type:String
    },
    countryCode:{
        type:String
    },
    mobileNumber:{
        type:String
    },
    imageURL:{
        type:String
    },
    showStatus:{
        type:String,
        default:"ACTIVE"
    },
    imagePublicId:String,
    services:[{type:Schema.Types.ObjectId, ref: 'service'
    }],
    status:String

}, {
    timestamps: true,
})


professionalSchema.plugin(paginate);

var professional = mongoose.model('professional', professionalSchema);


module.exports = {
    serviceSchema: service,
    membershipSchema:membership,
    professionalSchema:professional
}