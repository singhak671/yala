const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const userSchema=require("./user")
const Schema = mongoose.Schema;
let standingSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref:"user"
    },
    standingName:String,
    status:{
        type:String,
        enum:["active","cancelled"]
    },
    sport:{
        type:String
    },
    visibleColumns:{
        type:Array
    },
    criterias:[{
        criteria:String,
        order:String
    }]

}, {
    timestamps: true
});
standingSchema.plugin(paginate);
var standing = mongoose.model('standing', standingSchema);




let matchConfigSchema = new Schema({
    organizerId:{
        type:String,
        ref:"user"
    },
    standingName:{
        type:String
    },
    status:{
        type:String,
        enum:["active","cancelled"]
    },
    sport:{
        type:String
    },
    visibleColumns:{
        type:Array
    },
    criterias:[{
        criteria:String,
        order:String
    }]

}, {
    timestamps: true
});
matchConfigSchema.plugin(paginate);
var matchConfig = mongoose.model('matchConfig', matchConfigSchema);
module.exports={
    standing:standing,
    matchConfig:matchConfig
}