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
    module.exports={
        sport:sport,
        period:period,
        division:division
    }
