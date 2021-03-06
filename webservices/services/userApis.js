const User=require("../../models/user")
const TermsAndPolicy=("../../model/termsAndPrivacyModel")

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
const findUserDetail=(bodyData,select,callback)=>{
	User.findOne(bodyData,select,(err,result)=>{
		callback(err,result)
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
const deleteUser=(bodyData,callback)=>{
	User.findOneAndRemove(bodyData,(err,result)=>{
		callback(err,result)
	})
}
const findTermsAndUpdate=(bodyData,set,options,callback)=>{
    TermsAndPolicy.findOneAndUpdate(bodyData,set,options,(err,result)=>{
		callback(err,result)
	})
}
const findTerms=(bodyData,callback)=>{
	TermsAndPolicy.find(bodyData,(err,result)=>{
		callback(err,result)
	})
}
const getListOfEmployee=(bodyData,option,callback)=>{
	User.paginate(bodyData,option,(err,result)=>{
		callback(err,result)
	})
}
const findUserRole=(bodyData,select,callback)=>{
	User.findOne(bodyData,select,(err,result)=>{
		callback(err,result);
	})
}
const updateEmployee=(bodyData,set,option,callback)=>{
	User.update(bodyData,set,option,(err,result)=>{
		callback(err,result)
	})
}
module.exports={
	"addUser":addUser,
	"findUser":findUser,
	"getOTP":getOTP,
	"updateUser":updateUser,
	"deleteUser":deleteUser,
	"findUserDetail":findUserDetail,
	"findTermsAndUpdate":findTermsAndUpdate,
	"findTerms":findTerms,
	"getListOfEmployee":getListOfEmployee,
	"findUserRole":findUserRole,
	"updateEmployee":updateEmployee
}