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
    firstName: {
        type: String,
        sparse: true
    },
    lastName:{
        type:String
    },
    password: {
        type: String,
    },
    mobileNumber: {
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
    countryCode:{
        type:String
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
    organizerType:{
        type:String,
        uppercase:true
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
    image:{
        type:String,
    },
    jwt:{
        type:String
    },

    subscription:{
      type:String,
      uppercase:true
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


