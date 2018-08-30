const Data=require("../../models/data")
const General=require("../../models/generalSchema")



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
    // Data.club.find(bodyData).sort(options).exec((err,result)=>{
    //     callback(err,result)
    // })
    Data.club.paginate(bodyData,options,(err,result)=>{
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
    Data.sponsor.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfSponser=(bodyData,options,callback)=>{
    Data.sponsor.paginate(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const findSponser=(bodyData,callback)=>{
    Data.sponsor.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const editSponser=(bodyData,set,option,callback)=>{
    Data.sponsor.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}
const deleteSponser=(bodyData,callback)=>{
    Data.sponsor.findOneAndRemove(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const selectClub=(bodyData,select,callback)=>{
    Data.club.find(bodyData,select,(err,result)=>{
        callback(err,result)
    })
}
//-------------------------Venues Apis---------------------------------
const addVenue=(bodyData,callback)=>{
    Data.venue.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const findVenue=(bodyData,callback)=>{
    Data.venue.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfVenue=(bodyData,options,callback)=>{
    Data.venue.paginate(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const updateVenue=(bodyData,set,options,callback)=>{
    Data.venue.findOneAndUpdate(bodyData,set,options,(err,result)=>{
        callback(err,result)
    })
}
const deleteVenue=(bodyData,callback)=>{
    Data.venue.findOneAndRemove(bodyData,(err,result)=>{
        callback(err,result)
    })
}
//-------------APIS of Refree---------------------------
const addRefree=(bodyData,callback)=>{
    Data.referee.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const findRefree=(bodyData,callback)=>{
    Data.referee.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfRefree=(bodyData,options,callback)=>{
    Data.referee.paginate(bodyData,options,(err,result)=>{
        callback(err,result)
    })
}
const updateRefree=(bodyData,set,options,callback)=>{
    Data.referee.findOneAndUpdate(bodyData,set,options,(err,result)=>{
        callback(err,result)
    })
}
const deleteRefree=(bodyData,callback)=>{
    Data.referee.findOneAndRemove(bodyData,(err,result)=>{
        callback(err,result)
    })
}
//------------------APis of Sports-----------
const addSport=(bodyData,callback)=>{
    General.sport.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const findSport=(bodyData,callback)=>{
    General.sport.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const getListOfSport=(bodyData,option,callback)=>{
    General.sport.paginate(bodyData,option,(err,result)=>{
        callback(err,result)
    })
}
const editSport=(bodyData,set,option,callback)=>{
    General.sport.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}
const selectSport=(bodyData,callback)=>{
    General.sport.find(bodyData,(err,result)=>{
        callback(err,result)
    })
}

//  //------------------APis of Sports-----------
//  const addSport = (bodyData, callback) => {
//     Data.sport.create(bodyData, (err, result) => {
//         callback(err, result)
//     })
// }
// const findSport = (bodyData, callback) => {
//     Data.sport.findOne(bodyData, (err, result) => {
//         callback(err, result)
//     })
// }
// const getListOfSport = (bodyData, option, callback) => { 
//     Data.sport.paginate(bodyData, option, (err, result) => {
//         callback(err, result)
//     })
// }
// const editSport = (bodyData, set, option, callback) => {
//     Data.sport.findOneAndUpdate(bodyData, set, option, (err, result) => {
//         callback(err, result)
//     })
// }
// const selectSport = (bodyData, callback) => {
//     Data.sport.find(bodyData, (err, result) => {
//         callback(err, result)
//     })
// }
 
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
    "deleteSponser":deleteSponser,
    "addVenue":addVenue,
    "findVenue":findVenue,
    "selectClub":selectClub,
    "getListOfVenue":getListOfVenue,
    "updateVenue":updateVenue,
    "deleteVenue":deleteVenue,
    "addRefree":addRefree,
    "findRefree":findRefree,
    "getListOfRefree":getListOfRefree,
    "updateRefree":updateRefree,
    "deleteRefree":deleteRefree,
    "addSport":addSport,
    "findSport":findSport,
    "getListOfSport":getListOfSport,
    "editSport":editSport,
    "selectSport":selectSport
}