const Media=require("../../models/media")
const  Competition=require("../../models/competition");
const addMedia=(bodydata,callback)=>{
    Media.create(bodydata,(err,result)=>{
        callback(err,result)
    })
}
const getListOfMedia=(bodydata,option,callback)=>{
    Media.paginate(bodydata,option,(err,result)=>{
        callback(err,result)
    })
}
const findMedia=(bodydata,callback)=>{
    // Media.findOne(bodydata,(err,result)=>{
    //     callback(err,result)
    // })
    Media.findOne(bodydata).lean().populate([{path:"competitionId",model:Competition.competition,select:'imageURL'},{path:"membershipId",model:"orgmembership",select:'imageURL'}]).exec((err,result)=>{
        callback(err,result)
    })
}
const updateMedia=(bodydata,set,option,callback)=>{
    Media.findOneAndUpdate(bodydata,set,option,(err,success)=>{
        callback(err,success)
    })
}
const findCommentStatus=(bodydata,callback)=>{
    Competition.competition.findOne(bodydata,(err,result)=>{
        callback(err,result)
    })
}
const findMediaUrl=(bodydata,select,callback)=>{
    Media.findOne(bodydata,select,(err,result)=>{
        callback(err,result)
    })
}
const deleteMedia=(bodydata,callback)=>{
    Media.findOneAndRemove(bodydata,(err,result)=>{
        callback(err,result)
    })
}

module.exports={
    "addMedia":addMedia,
    "getListOfMedia":getListOfMedia,
    "findMedia":findMedia,
    "updateMedia":updateMedia,
    "findCommentStatus":findCommentStatus,
    "findMediaUrl":findMediaUrl,
    "deleteMedia":deleteMedia
}