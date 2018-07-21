const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const Competition=require("./competition.js");
let userSchema = new Schema({ 
   
    role: {
        type: String,
        trim: true
    },
    fullName: {
        type: String,
        sparse: true
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
        sparse: true
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    dob: {
        type: String,
        trim: true
    },
    otp: {
        type: Number
    },
    gender: {
        type: String,
    },
    nationality:{
        type:String
    },
    organiser:{
      type:String
    },
    cardDetails:[{
        cardNumber:{type:Number,
            max:9999999999999999,
            min:0000000000000001
       },
        expiryDate:{type:Date,
        min:Date.now()},
        cvv:{type:Number,
            max:999,
            min:1
       }
    }],
    subscription:{
      type:String
    },
    organizerCompetition:[{ type: Schema.Types.ObjectId, ref: 'competition' }]
    ,
    deviceType: {
        type: String,
        enum: ['iOS', 'android'],

    },
    deviceToken: {
        type: String
    },
}, {
    timestamps: true
},);
userSchema.plugin(paginate);
module.exports = mongoose.model('user', userSchema);


