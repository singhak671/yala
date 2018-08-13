const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
const userSchema=require("./user")
let competitionSchema = new Schema({ 
   playerFollowStatus:{
       type:Array
    //    playerId:{
    //        type: Schema.Types.ObjectId, ref:'user'},
    //     followStatus:String
   },

    competitionName: {
        type: String,
        trim: true
    },
    venue: {
        type: String,
        trim:true
    },
    division: {
        type: String,
        trim:true
    },
    period: {
        type: String,
        trim:true
    },
    sports: {
        type: String,
        trim:true
    },
    club: {
        type: String,
        trim: true,
    },
    privacy: {
        type: String,
        enum:["public","private"]
    },
    status:{
        type:String,
        trim:true,
        default:"settingUp"
    },
    organizer:{
      type: Schema.Types.ObjectId, ref:'user'
    },
    prize:[{
        
        name:{
            type:String,
            trim:true
        },
        value:{
            type:Number,
            trim:true
        },
        description:{
            type:String,
        }
            
        }],
    allowComment:{
            type:Boolean,
            default:false,
        },
    allowFollow:{
            type:String,
            enum:["public,private"]
        },
    clubRegistration:{
            type:Boolean,
            default:false
        },
    startDate:{
        type:Date,
        //min:Date.now(),
    },
    endDate:{
        type:Date,
        //min:Date.now(),
    },
    allowPublicToFollow:{
        type:Boolean,
        default:false
    },
    imageURL:{
        type:String,
        trim:true
    },
    file:[{
        
        fileName:{
        type:String,
        trim:true
                },
        file:{
           type:String,
           trim:true
       },
        name:{
           type:String,
           trim:true
       },
        public_id:{
           type:String
       },
           
       }],
    registrationForm:{
        type:Boolean,
        default:false
    },
    published:{
        type:Boolean,
        default:false
    },
    deviceType: {
        type: String,
        enum: ['iOS', 'android']
    },
    deviceToken: {
        type: String
    },
    sportType:{
        type:String
    }
}, {
    timestamps: true
});

competitionSchema.plugin(paginate);
var competition = mongoose.model('competition', competitionSchema);

let registrationSchema = new Schema({
    competitionId:{
        type: Schema.Types.ObjectId, ref:'competition'
    },
    organizer:{
        type: Schema.Types.ObjectId, ref:'user'
      },
    imageURL:{
        type:String
    },
    freeOrPaid:{
        type:String,
        trim:true,
        enum:["free","paid"]
    },
    registrationFee:{
        type:Number,
    },
    paymentInHandDetails:{
        type:String
    },
    description:{
        type:String,
    },
    startDate:{
        type:Date,
        
    },
    endDate:{
        type:Date,
        
    },
    configTeamField:{
        type:Array
    },
    configPlayerField:{
        type:Array
    },
},{
    timestamps:true,
})
registrationSchema.plugin(paginate);
var competitionReg=mongoose.model("competitionreg",registrationSchema);



// let createTeamInComp = new Schema({
//     competitionId:{
//         type: Schema.Types.ObjectId, ref:'competition'
//     },
//     organizer:{
//         type: Schema.Types.ObjectId, ref:'user'
//       },
//     imageURL:{
//         type:String
//     },
//     teamName:{
//         type:String
//     },
//     phone:{
//         type:String
//     },
//     email:{
//         type:String
//     },
//     venue:{
//         type:String
//     },
//     category:{
//         type:String
//     },
//     status:{
//         type:String
//     }

// },{
//     timestamps:true
// })
// createTeamInComp.plugin(paginate);
// var createTeamInCompetition=mongoose.model("createTeamInCompetition",createTeamInComp)








module.exports={
    competition:competition,
    competitionReg:competitionReg,
    // createTeamInCompetition:createTeamInCompetition

}