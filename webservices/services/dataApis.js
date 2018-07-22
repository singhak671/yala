const Data=require("../../models/data")


//Club Apis 
const addClub=(bodyData,callback)=>{
    Data.club.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const findClub=(bodyData,callback)=>{
    Data.club.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfClub=(bodyData,options,callback)=>{
    Data.club.find(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const editClub=(bodyData,set,options,callback)=>{
    Data.club.findOneAndUpdate(bodyData,set,options,(err,result)=>{
        callback(err,result)
    })
}
const deleteClub=(bodyData,callback)=>{
    Data.club.findByIdAndRemove(bodyData,(err,result)=>{
        callback(err,result)
    })
}
//Sponsers Apis
const addSponsers=(bodyData,callback)=>{
    Data.sponser.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfSponser=(bodyData,options,callback)=>{
    Data.sponser.paginate(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const findSponser=(bodyData,callback)=>{
    Data.sponser.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const editSponser=(bodyData,set,option,callback)=>{
    Data.sponser.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}
const deleteSponser=(bodyData,callback)=>{
    Data.sponser.findOneAndRemove(bodyData,(err,result)=>{
        callback(err,result)
    })
}
module.exports={
    "addClub":addClub,
    "getListOfClub":getListOfClub,
    "findClub":findClub,
    "editClub":editClub,
    "deleteClub":deleteClub,
    "addSponsers":addSponsers,
    "getListOfSponser":getListOfSponser,
    "findSponser":findSponser,
    "editSponser":editSponser,
    "deleteSponser":deleteSponser
}