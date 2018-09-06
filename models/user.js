const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var aggregatePaginate = require('mongoose-aggregate-paginate');
const Competition=require("./competition.js");
let userSchema = new Schema({ 
   
    role: [{
        type: String,
        enum:["PLAYER","ORGANIZER","VENUE"],
        trim: true
    }],
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
    emailVerified: {
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
        type:Array,
        uppercase:true
    },

    cardDetails:[{
        cardNumber:{type:Number,
            max:9999999999999999,
            min:0000000000000001
       },
        expiryDate:{type:String},
       
       autoRenew:{
           type:Boolean,
           default:false
       }
    }],
    image:{
        type:String,
    },
    jwt:{
        type:String
    },

    subscription:{
      type:String
    },
    subscriptionPrice:{
        type:Number
    },
    optionalSubsPrices:Object,
    subscriptionAccess:{
        type:Array
    },
    subscriptionStartDate:{
        type:Number
    },
    subscriptionEndDate:{
        type:Number
    },
    payment:{
        type:Object
    },
    paymentStatus:{
        type:Boolean,
        default: false
    },
    organizerCompetition:[{ type: Schema.Types.ObjectId, ref: 'competition' }]
    ,
    competitionNotify:{
        email:{type:Array},
        mobile:{type:Array}
    },
    membershipNotify:{
        email:{type:Array},
        mobile:{type:Array}
    },
    playDetail:[{
        teamId:Schema.Types.ObjectId,
        competitionId:Schema.Types.ObjectId,
        organizer:Schema.Types.ObjectId,
        playerId:Schema.Types.ObjectId
    }],
    venueNotify:{
        email:{type:Array},
        mobile:{type:Array}
    },
    organizerNotification:{
        type:Array
    },
    deviceType: {
        type: String,
        enum: ['iOS', 'android'],

    },
    deviceToken: {
        type: Array
    },
    employeeRole:{
        type:String,
        enum:["COORDINATOR","ADMINSTRATOR"]
    },
    employeerId:{
        type:Schema.Types.ObjectId
    },
    employeePermissionForCoordinator:{
          dataBase:Array,
          myCompetition:Array,
          myVenue:Array,
          media:Array,
          myMembership:Array
    },
    employeePermissionForAdminstartor:{
        dataBase:Array,
        myCompetition:Array,
        myVenue:Array,
        media:Array,
        myMembership:Array
  },
    status:{
        type:String,
        default:"ACTIVE"
    },
    autoRenewPlan:{
        type:Boolean,
        default:false
    },
    playerDynamicDetails:{
        type:Array
    }

}, {
    timestamps: true
},);
userSchema.plugin(paginate);
userSchema.plugin(aggregatePaginate);
module.exports = mongoose.model('user', userSchema);


