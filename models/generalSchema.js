const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user");
//Sports Schema
let sportSchema=new Schema({
    organizer:{
                type:Schema.Types.ObjectId,
                ref:"user"
    },
    status:{
                type:String,
                default:"ACTIVE"
    },
    sportName:{
                 type:String
    },
    sportType:{
        type:String
    }
    },
    {
        timestamps:true
    })    
    sportSchema.plugin(paginate);
    const sport=mongoose.model('sport',sportSchema)

    //Period schema
    let periodSchema=new Schema({
    organizer:{
    type:Schema.Types.ObjectId,
    ref:"user"
    },
    periodName:String,
    status:{
        type:String,
        default:"ACTIVE"
    }
    },{
    timestamps:true
    })
    periodSchema.plugin(paginate);
    const period=mongoose.model('period',periodSchema)

    //-------------- Division Schema-------------
    let divisionSchema=Schema({
        organizer:{
            type:Schema.Types.ObjectId,
            ref:"user"  
        },
        divisionName:String,
        sports:String,
        gender:String,
        minAge:Number,
        maxAge:Number,
        date:Date,
        status:{
            type:String,
            default:"ACTIVE"
        }
        
    },{
        timestamps:true
    });
    divisionSchema.plugin(paginate);
    const division=mongoose.model('division',divisionSchema);

//----------Smtp Mail and Message schema---------
    let mailMessageSchema=Schema({
        organizer:{
            type:Schema.Types.ObjectId,
            ref:"user"  
        },
        smtpUsername:String,
        smtpPassword:String,
        mailerId:String
    },{
        timestamps:true
    });
    const mailMessage=mongoose.model("mailMessage",mailMessageSchema);

//--------Payment gatway and sms schema----------
let paymentSchema=Schema({
    organizer:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    paymentDetails:{
        allowCashPayment:{type:Boolean,default:false},
        allowPaymentOnline:{type:Boolean,default:true},
        privateKey:String,
        publicKey:String,
        sellerId:String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    smsDetail:{
        sid:String,
        auth_token:String,
        number:String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }},
    {
        timestamps:true
   });
   const paymentSms=mongoose.model("paymentSms",paymentSchema);

    //=========================CHAT SCHEMA ==================================
    let chatSchema = new Schema({ 
        organizerId:{
            type: Schema.Types.ObjectId, ref:'user'
        },
        organizerRead:{
            type:Boolean,
            default:false
        },
        playerRead:{
            type:Boolean,
            default:false
        },
        playerId:{
            type: Schema.Types.ObjectId, ref:'user'
        },
        message:[{
            senderId:{
                type: Schema.Types.ObjectId, ref:'user'
            },
            message:String,
            createdAt:{
                type:Date,
                default:Date.now
            }
                     
        }]
    });
    
    chatSchema.plugin(paginate);
    var chat = mongoose.model('chat', chatSchema);
    
    module.exports={
        sport:sport,
        period:period,
        division:division,
        mailMessage:mailMessage,
        chat:chat,
        paymentSms:paymentSms
        
    }
