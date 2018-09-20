const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
var Object = mongoose.Types.ObjectId;


const Schema = mongoose.Schema;

let membershipSchema = new Schema({
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user'
    },
    membershipName:{
        type:String
    },

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
    }]

}, {
    timestamps: true,
}

)


membershipSchema.plugin(paginate);

var membership = mongoose.model('orgmembership', membershipSchema);


let serviceSchema = new Schema({
    organizerId:{
        type: Schema.Types.ObjectId, ref: 'user'
    },
    membershipId:{
        type: Schema.Types.ObjectId, ref: 'orgmembership'
    },
    serviceName:{
        type:String
    },
    amount:{
        type:Number
    },
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
    published:Boolean,
    offDays:[{
        type:String
    }],
    startDate:Date,
    endDate:Date,
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
    services:[{
        serviceId: {
            type:Schema.Types.ObjectId, ref: 'service'}
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