const Media=require("../../models/media")

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
    Media.findOne(bodydata,(err,result)=>{
        callback(err,result)
    })
}
module.exports={
    "addMedia":addMedia,
    "getListOfMedia":getListOfMedia,
    "findMedia":findMedia
}