const Data=require("../../models/data")
const Team=require("../../models/team")
const  Competition=require("../../models/competition");
const Follow=require("../../models/compFollowOrgPlay");
const General=require("../../models/generalSchema.js")
const selectCompition=(bodyData,select,callback)=>{
    Competition.competition.find(bodyData,select,(err,result)=>{
        callback(err,result)
    })
}
const selectVenue=(bodyData,select,callback)=>{
    Data.venue.find(bodyData,select,(err,result)=>{
        callback(err,result)
    })
}
const findCompition=(bodyData,callback)=>{
    Competition.competition.findOne(bodyData,(err,success)=>{
        callback(err,success)
    })
}

const findTeam=(bodyData,callback)=>{
    Team.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const addTeam=(bodyData,callback)=>{
    Team.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfTeam=(bodyData,options,callback)=>{
    Team.paginate(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const selectTeam=(bodyData,select,callback)=>{
    Team.find(bodyData,select,(err,result)=>{
        callback(err,result)
    })
}
const followStatus=(bodyData,select,callback)=>{
    Follow.competitionFollow.find(bodyData,select,(err,result)=>{
        callback(err,result)
    })
}
const follow=(bodyData,callback)=>{
    Follow.competitionFollow.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const updateCompetition=(bodyData,set,option,callback)=>{
    Competition.competition.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}
const addCompetitonFollow=(bodyData,callback)=>{
    Follow.competitionFollow.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const updateTeam=(bodyData,set,option,callback)=>{
    Team.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}
const findDivision=(bodyData,callback)=>{
  General.division.findOne(bodyData,(err,result)=>{
      callback(err,result)
  })
}
module.exports={
    "selectCompition":selectCompition,
    "selectVenue":selectVenue,
    "findCompition":findCompition,
    "findTeam":findTeam,
    "addTeam":addTeam,
    "getListOfTeam":getListOfTeam,
    "selectTeam":selectTeam,
    "followStatus":followStatus,
    "updateCompetition":updateCompetition,
    "addCompetitonFollow":addCompetitonFollow,
    "updateTeam":updateTeam,
    "findDivision":findDivision,
    "follow":follow
}