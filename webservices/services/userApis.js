const User=require("../../models/user")


const addUser=(bodyData,callback)=>{
	User.create(bodyData,(err,result)=>{
		callback(err,result);
	});
}
const findUser=(bodyData,callback)=>{
	User.findOne(bodyData,(err,result)=>{
		callback(err,result);
	})
}
const getOTP=(bodyData,callback)=>{
	User.findById(bodyData,(err,result)=>{
		callback(err,result);
	})
}
const updateUser=(bodyData,set,options,callback)=>{
	User.findOneAndUpdate(bodyData,set,options,(err,result)=>{
		callback(err,result);
	})
}
module.exports={
	"addUser":addUser,
	"findUser":findUser,
	"getOTP":getOTP,
	"updateUser":updateUser
}