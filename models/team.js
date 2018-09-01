const mongoose = require('mongoose');
global.Promise = mongoose.Promise;
const paginate = require('mongoose-paginate');
const Schema = mongoose.Schema;
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
let createTeamInComp = new Schema({
    competitionId: {
        type: Schema.Types.ObjectId,
        ref: 'competitions'
    },
    competitionName: {
        type: String
    },
    venue: {
        type: String
    },
    organizer: {
        type: Schema.Types.ObjectId, ref: 'user'
    },
    imageURL: {
        type: String
    },
    playerId: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    teamName: {
        type: String
    },
    mobileNumber: {
        type: String
    },
    email: {
        type: String
    },
    venueId: {
        type: Schema.Types.ObjectId,
        ref: 'venues'
    },
    division: {
        type: String
    },
    status: {
        type: String
    },
    sports: {
        type: String
    },
    teamDynamicDetail:{
        type:Object
    },
    visibleStatus:{
        type:String,
        default:"ACTIVE"
    }
}, {
        timestamps: true
    })
createTeamInComp.plugin(paginate);
createTeamInComp.plugin(mongooseAggregatePaginate);
var createTeamInCompetition = mongoose.model("createTeamInCompetition", createTeamInComp)
module.exports = createTeamInCompetition
