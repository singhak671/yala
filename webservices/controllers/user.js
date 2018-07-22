const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');
const config = require("../../config/config");
const jwt = require('jsonwebtoken');
var waterfall = require('async-waterfall');
//var countries   = require('country-data-list').countries;
var countryCodes = require('country-data');

const User=require("../../models/user")
//--------------------------Add Users-----------------------------------------------------------
const signup=(req,res)=>{
	console.log("req.body---->>",req.body)
	otp=message.getOTP();
	req.body.otp = otp
	let flag = Validator(req.body, ['email', 'password', ])  
	if(flag)
	return Response.sendResponse(res, flag[0], flag[1])
	else if(!req.body)
	return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.PROVIDE_DATA)
	else{
	var query={
		email:req.body.email
	}
	userServices.findUser(query,(err,success)=>{
	  if(err)
	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
	  else if(success)
	  return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
	  else{
	  let salt = bcrypt.genSaltSync(10);
	  req.body.password = bcrypt.hashSync(req.body.password, salt)
		    message.sendSMS("Your verification code is " + otp,req.body.countryCode,req.body.mobileNumber, (error, sent) => {
				if(error){
				  console.log(error);
				  console.log("invaliddddd")
			      return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.WRONG_PHONE)
					  }
					 
				else{
					userServices.addUser(req.body,(err,success)=>{
						if(err){
							console.log("err--->>",err)
						return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
						}
						else if(!success)
						return Response.sendResponse(res.responseCode.BAD_REQUEST,responseMsg.CORRECT_EMAIL_ID);
						else{
					  console.log("successfully sent")
					   return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SIGNUP_SUCCESS,success)
				}
				
			})
		}
	  })
	}
	})
   }
}
//--------------------------Verify OTP-----------------------------------------------------------
const verifyOtp=(req,res)=>{
	console.log("otp----->>",req.body)
	console.log("_id----->>>",req.body._id)
	let flag =Validator(req.body,['otp'])
	if(flag)
	Response.sendResponse(res,flag[0],flag[1])
	else if(!req.body._id)
	return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	else
	userServices.getOTP(mongoose.Types.ObjectId(req.body._id),(err,success)=>{
		console.log("secret key is "+config.secret_key)
		var token =  jwt.sign({_id:success._id,email:success.email,password:success.password},config.secret_key);
		console.log("token--->>",token)
		console.log(success.otp)
		if(success.otp==req.body.otp){
			var query={
				_id:mongoose.Types.ObjectId(req.body._id),
			}
			let set={
					phoneVerified: true,
					jwt:token
			}
			let options={
				new:true,
				select:{"password":0}
			}
			userServices.updateUser(query,set,options,(err,success)=>{
				if(err)
				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
				else
				return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.VERIFICATION_SUCCESSFULLY_DONE,success)
			})
		}
		else{
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CORRECT_OTP)
		}
	
	})
}
//--------------------------Resend OTP-----------------------------------------------------------
const resendOtp=(req,res)=>{
	console.log("user Id------>>>>",req.query._id)
	
	if(!req.query._id)
	return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	else{
      const otp=message.getOTP();
  let set={
	  otp:otp
  }
  let options={
	  new:true
  }
  userServices.updateUser({_id:req.query._id},set,options,(err,success)=>{
	  if(err)
	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
	  else if(!success)
	  return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_IS_REQ)
	  else{
		  console.log(success)
		message.sendSMS("Your verification code is "+otp,success.countryCode,success.mobileNumber,(err,sent)=>{
			if (err)
			Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
			else{
			Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.OTP_SENDS)
			}
			
		})
	  }

  })
}
}
//--------------------------Log In-----------------------------------------------------------
const login=(req,res)=>{
	console.log("req.body--->>",req.body)
	let flag = Validator(req.body, ['email', 'password'])  
	if(flag)
	Response.sendResponse(res, flag[0],flag[1]) 
	else{
		let query={
			email:req.body.email
		}
		User.findOne(query).lean().exec((err,result)=>{
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!result)
			return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.EMAIL_NOT_EXISTS)
			else{
            bcrypt.compare(req.body.password,result.password,(err,success)=>{
				if(err)
				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
				else if(!success)
				return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.WRONG_PASSWORD)
				else{
				// console.log("secret key is "+config.secret_key)
				var token =  jwt.sign({_id:result._id,email:result.email,password:result.password},config.secret_key);
				console.log("token>>>>>>>",token)
				result.jwt=token;
				delete result["password"];
				// console.log("new>>>",newResult)
				// userServices.updateUser({_id:result._id},{new:true,select:{"password":0}},(err,success)=>{
				// 	if(err)
				// 	return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
				// 	else if(!success)
				// 	return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
				// 	else
                    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.LOG_SUCCESS,result)
				}
				
				})
			}
		})
		
	}
}
//--------------------------Update User-----------------------------------------------------------
const updateUser=(req,res)=>{
	console.log("req.body",req.body)
	if(!req.body._id){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else{
		var query={
			_id:req.body._id
		}
		userServices.findUser(query,(err,success)=>{
			if(err)
			return Response.sendResponse(res,response.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!success)
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
			else{
				if(req.body.image){
					waterfall([(callback)=>{
                        message.uploadImg(req.body.image,(err,success)=>{
                            if(err){
                             return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
                            } 
                            else{
                               console.log("image.url",success)
                               callback(null,success.secure_url)
                            }  
                           })
                       },(imageurl,callback)=>{
                           req.body.image=imageurl;
                           callback(null,req.body)
                       }
                    ],(err,result)=>{
                        console.log("result--->>",result)

                        let options={
							new:true,
							select:{"password":0}
                        }
                        userServices.updateUser(query,result,options,(err,success)=>{
                            if(err)
                            Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
                            else 
                            Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.USER_UPDATE_SUCCESS,success)
                    
                        })
                    }
                    )
				}
				else{
					let options={
						new:true
					}
					userServices.updateUser(query,req.body,options,(err,success)=>{
						if(err)
						return Response.sendResponse(res,response.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
						else
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_UPDATE_SUCCESS, success);
					})
				}
			}
		})
	}
}
//--------------------------Get Detail of User for update-----------------------------------------------------------

const getDetail=(req,res)=>{
	console.log("req---->",req.query._id)
	if(!req.query._id){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else{
		var query={
			_id:req.query._id
		}
		select={
             "password":0
		}
		userServices.findUserDetail(query,select,(err,success)=>{
			if(err)
			return Response.sendResponse(res,response.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!success)
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
			else{
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_DETAIL, success);
				
			}
		})
	}
}
//------------------------------Change Password-----------------------------------------------------------
const changePassword=(req,res)=>{
	let flag =Validator(req.body,['password','newPassword'])
	if(!req.body._id){
        return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else if(flag){
		Response.sendResponse(res,flag[0],flag[1])
	}
	else{
		var query={
			_id:req.body._id
		}
		userServices.findUser(query,(err,result)=>{
			if(err){
				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			}
			else if(!result){
				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
			}
			else{
				bcrypt.compare(req.body.password,result.password,(err,success)=>{
					if(err){
						return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
					}
					else if(!success){
						return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.WRONG_PASSWORD)
					}
					else{
						let salt = bcrypt.genSaltSync(10);
						req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)
						console.log("cdcfhfvf=----->",req.body.newPassword)
						var options={
							new:true
						}
						let set={
							password:req.body.newPassword
						}
						userServices.updateUser(query,set,options,(err,success)=>{
                          if(err){
							return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
						  }
						  else if(!success){
							return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
						  }
						  else {
							return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg. PASSWORD_UPDATE);
						  }
						})
					}
				})
			}
		})
	}
}
//--------------------------Forget Password-----------------------------------------------------------
const forgetPassword=(req,res)=>{
	console.log("req.body----->>>",req.body)
	const password=message.genratePassword();
	req.body.password=password
	console.log("password---->>>",req.body.password)
	
	let flag=Validator(req.body,['email'])
     if(flag){
	return Response.sendResponse(res,flag[0],flag[1])
	}
	else{
		query={
			email:req.body.email
		}
		userServices.findUser(query,(err,success)=>{
			if(err){
				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);	
			}
			else if(!success){
				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.EMAIL_NOT_EXISTS);			
			}
			else{
				let salt = bcrypt.genSaltSync(10);
						req.body.password = bcrypt.hashSync(req.body.password, salt)
						console.log("forgetPassword=----->",req.body.password)
						var options={
							new:true
						}
						let set={
							password:req.body.password
						}
						userServices.updateUser(query,set,options,(err,success)=>{
                          if(err){
							return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
						  }
						  else if(!success){
							return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
						  }
						  else {
							message.sendMail(success.email,"Forgot Password","Your New Password is "+password,(err,result)=>{
								if(err){
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.EMAIL_NOT_SEND);
								}
								else if(!result)
								return Response.sendResponse(res,responseCode.UNAUTHORIZED.responseMsg.SIGN_IN_WITH_VALID)
								else{
									return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PASSWORD_UPDATE_SUCCESS);
								}
							}) 
							
						  }
						})
				
			}
		})
	}

}
//-----------------------------------changePlan------------------------------------------------------------------------------------
const changePlan=(req,res)=>{
	console.log("req.body--->>",req.body)
	let flag=Validator(req.body,['role','plan'])
	if(!req.body._id){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else if(flag){
	return Response.sendResponse(res,flag[0],flag[1])
	}
	else{
		let query={
			_id:req.body._id,
			role:req.body.role
		}
		var options={
			new:true,
			select:{"password":0}
		}
		let set={ 
			subscription:req.body.plan
		}
		userServices.updateUser(query,set,options,(err,success)=>{
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!success)
			return Response.sendResponse(res,responseCode.NOT_MODIFIED,responseMsg.NOT_MODIFIED)
			else
			return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.USER_PLAN_UPDATE,success)
		})

	}
}
//------------------------LogOut-------------------
const logOut=(req,res)=>{
	if(!req.query._id){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
		else{
			query={
				_id:req.query._id
			}
			set={
				jwt:''
			}
			options={
				new:true
			}
         userServices.updateUser(query,set,options,(err,success)=>{
			 if(err)
			 return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			 else
			 return Response.sendResponse(res,responseCode.SUCCESSFULLY_DONE,responseMsg.LOGOUT)
		 })
		}
	}
//---------------------------------Add Card Details-------------------------------------
const addCard=(req,res)=>{
	console.log("req.body--->>",req.body)
	let flag = Validator(req.body,["cardDetails"],["cardNumber","cvv","expiryDate"]); 
	if(!req.body._id)
	return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
     else if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
    User.findById(req.body._id,(err,result)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
        if(!result)
            return Response.sendResponse(res,responseCode.USER_NOT_EXISTS,responseMsg.USER_NOT_EXISTS);

        for (let x of result.cardDetails){
            if(x.cardNumber==req.body.cardDetails.cardNumber)
            return Response.sendResponse(res,responseCode.BAD_REQUEST,"Card number already exist"); 
        }
        result.cardDetails.push(req.body.cardDetails);
        console.log(result)
        result.save((err,success)=>{
        // User.findByIdAndUpdate(req.body.userId,{$push : {cardDetails :req.body.cardDetails}},{new:true,select:{"password":0}},(err,success)=>{
            if(err)
                return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
            if(!success)
                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
    
        return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,"Card details added successfully",success);
        }); 
    });
}
//-----------------------------Get Card Details----------------------------------------
const getCardDetails=(req,res)=>{
	if(!req.query._id){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_NOT_EXISTS)
	}
	else{
		let query={
			_id:req.query._id
		}
		userServices.findUser(query,(err,success)=>{
		  if(err)
		  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
		  else if(!success)
		  return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
		  else
		  return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CARD_DETAIL,success.cardDetails)
		})
	}
}
//------------------------Edit Card Details---------------------------------------------------
const editCardDetails=(req,res)=>{
	console.log("req.body--->>",req.body)
	let flag = Validator(req.body,["cardDetails"],["_id","cardNumber","cvv","expiryDate"],["_id"]); 

if (flag)
        return Response.sendResponse(res, flag[0], flag[1]);
User.findOneAndUpdate({_id:req.body._id,"cardDetails._id":req.body.cardDetails._id},{$set : {"cardDetails.$" :req.body.cardDetails}},{new:true},(err,success)=>{
if(err)
return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
if(!success)
return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CARD_NOT_FOUND);
// for (let x of success.cardDetails)
// if(x._id==req.body.cardDetails._id)
// success=x;
return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.CARD_UPDATE,success);
}) 

}


//---------------------------Delete Card Details---------------------------------------------------
const deleteCard=(req,res)=>{
	console.log("req.body--->>",req.body)
    let flag = Validator(req.body,['_id',"cardDetails"],["_id"]); 
if (flag)
        return Response.sendResponse(res, flag[0], flag[1]); 
User.findOneAndUpdate({"_id":req.body._id,"cardDetails._id":req.body.cardDetails._id },{ $pull: { cardDetails : { _id : req.body.cardDetails._id } } },{ safe: true,new:true},(err,success)=>{
if(err)
return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
else if(!success)
return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CARD_NOT_FOUND); 
else
return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.CARD_DELET);
})
}
//--------------------------Get A card Detail----------------------------
const getCard=(req,res)=>{
	console.log("req.body--->>",req.body)
    let flag = Validator(req.body,['_id',"cardDetails"],["_id"]); 
     if (flag)
     return Response.sendResponse(res, flag[0], flag[1]); 
     else{
		 let query={
			 $and:[{_id:req.body._id},{"cardDetails._id":req.body.cardDetails._id}]
		 }
		 console.log("gehwdgdggg",query)
         User.findOne(query,(err,success)=>{
if(err)
return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
else if(!success)
return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CARD_NOT_FOUND); 
else
    return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.CARD_DETAIL,success.cardDetails);
	})
	 }

}
//------------------------Country Name and Codes------------------------------
const code=(req,res)=>{
	let country=[];
	let count=0
	//console.log("country------>>>",countryCodes.countries.all)
	for(i=0;i<countryCodes.countries.all.length;i++){
		if(countryCodes.countries.all[i].name&&countryCodes.countries.all[i].countryCallingCodes[0]&&countryCodes.countries.all[i].emoji){
			country[i]={
				countryName:countryCodes.countries.all[i].name,
				callingCode:countryCodes.countries.all[i].countryCallingCodes[0],
				flag:countryCodes.countries.all[i].emoji
			   }
		}
			
	    
	}
	for(i=0;i<country.length;i++){
	
		if(country[i]==null){
		    country.splice(i,1)
		}
	
	}
	for(i=0;i<country.length;i++){
	
		if(country[i]==null){
		    country.splice(i,1)
		}
	
	}
	

	//console.log("codeAndCountries===>>",country)
	console.log("count----->>>",country.length)
	 Response.sendResponse(res,responseCode.SUCCESSFULLY_DONE,responseMsg.EVERYTHING_IS_OK,country)
}




module.exports={
	signup,
	verifyOtp,
	resendOtp,
	login,
	updateUser,
	changePassword,
	getDetail,
	forgetPassword,
	changePlan,
	logOut,
	code,
	addCard,
	getCardDetails,
	editCardDetails,
	deleteCard,
	getCard
}
























// const Response = require("../../global_functions/response_handler")
// const message = require("../../global_functions/message");
// const User=require("../../models/user")
// const Validator = require('../../middlewares/validation').validate_all_request;
// const responseCode = require('../../helper/httpResponseCode')
// const responseMsg = require('../../helper/httpResponseMessage')
// const userServices=require('../services/userApis');
// const mongoose = require('mongoose');
// var bcrypt = require('bcrypt');
// const addUser=(req,res)=>{
// 	otp=message.getOTP();
// 	req.body.otp = otp
// 	let flag = Validator(req.body, ['email', 'password', ]) ;
// 	if(flag)
// 	return Response.sendResponse(res, flag[0], flag[1])
// 	else
// 	var query={
// 		email:req.body.email
// 	}
// 	userServices.findUser(query,(err,success)=>{
// 	  if(err)
// 	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
// 	  else if(success)
// 	  return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
// 	  else
// 	{
// 	   var salt = bcrypt.genSaltSync(10);
// 	   req.body.password = bcrypt.hashSync(req.body.password, salt);
// 	   userServices.addUser(req.body,(err,success)=>{
// 		  if(err)
// 		  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
// 		  else if(!success)
// 		  return Response.sendResponse(res.responseCode.BAD_REQUEST,responseMsg.CORRECT_EMAIL_ID);
// 		  else
// 		  message.sendSMS("Your verification code is " + otp, req.body.phoneNumber, (error, sent) => {
// 			  if(error)
// 			  console.log(error);
// 			  else
// 			  console.log("successfully sent")
// 		  })
// 		  return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success)

// 	  })}
// 	})

// }
// const verifyOtp=(req,res)=>{
// 	let flag =Validator(req.body,['otp'])
// 	if(flag)
// 	Response.sendResponse(res,flag[0],flag[1])
// 	else
// 	userServices.getOTP(mongoose.Types.ObjectId(req.body.userId),(err,success)=>{
// 		console.log(success.otp)
// 		if(success.otp==req.body.otp){
// 			var query={
// 				_id:mongoose.Types.ObjectId(req.body.userId),
// 			}
// 			let set={
// 					phoneVerified: true
// 			}
// 			let options={
// 				new:true
// 			}
// 			userServices.updateUser(query,set,options,(err,success)=>{
// 				if(err)
// 				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 				else
// 				return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success)
// 			})
// 		}
// 		else{
// 			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CORRECT_OTP)
// 		}
	
// 	})
// }
// const resendOtp=(req,res)=>{
// 	let flag =Validator(req.body,['userId'])
// 	if(flag)
// 	Response.sendResponse(res,flag[0],flag[1])
// 	else{
//       const otp=message.getOTP();
//   let set={
// 	  otp:otp
//   }
//   let options={
// 	  new:true
//   }
//   userServices.updateUser(mongoose.Types.ObjectId(req.body.userId),set,options,(err,success)=>{
// 	  if(err)
// 	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 	  else if(!success)
// 	  return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_IS_REQ)
// 	  else{
// 		message.sendSMS("Your verification code is "+otp,success.phoneNumber,(err,sent)=>{
// 			console.log("WWWWWWWWWWWWWWW",err,success);
// 			if (err)
// 			Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 			else
// 			Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
// 		})
// 	  }

//   })
// }
// }

// const login=(req,res)=>{
// 	let flag = Validator(req.body, ['email', 'password', 'role'])  
// 	if(flag)
// 	Response.sendResponse(res, flag[0], flag[1]) 
// 	else{
		
// 		let query={
// 			email:req.body.email,
// 			role:req.body.role
// 		}
// 		userServices.findUser(query,(err,success)=>{
// 			if(err)
// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
// 			else if(!success)
// 			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.WRONG)
// 			else if(bcrypt.compareSync(req.body.password, success.password))
// 			return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
// 			else 
// 			return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.CORRECT_PASS)
// 		})
// 	}
// }
// const updateUser=(req,res)=>{
// 	if(!req.body.userId){
// 		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
// 	}
// 	else{
// 		var query={
// 			_id:req.body.userId
// 		}
// 		userServices.findUser(query,(err,success)=>{
// 			if(err)
// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
// 			else if(success==null)
// 			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
// 			else{
// 				var options={
// 					new:true
// 				}
// 				userServices.updateUser(query,req.body,options,(err,success)=>{
// 					if(err)
// 					return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
// 					else
// 					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_UPDATE_SUCCESS, success);
// 				})
// 			}
// 		})
// 	}
// }
// const getDetail=(req,res)=>{
// 	if(!req.body.userId){
// 		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
// 	}
// 	else{
// 		var query={
// 			_id:req.body.userId
// 		}
// 		userServices.findUser(query,(err,success)=>{
// 			if(err)
// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
// 			else if(!success)
// 			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
// 			else{
// 					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_DETAIL, success);
				
// 			}
// 		})
// 	}
// }
// const forgotPassword=(req,res)=>{
// 	if(!req.body.email)
// 		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.EMAIL_IS_REQ);
// 	let flag = Validator(req.body, ['email'])  
// 	if(flag)
// 	Response.sendResponse(res, flag[0], flag[1]) 
// 	else{
// 		var randomstring = Math.random().toString(36).slice(-8);
// 		var salt = bcrypt.genSaltSync(10);
// 		salt = bcrypt.hashSync(randomstring, salt);
// 		userServices.updateUser({email:req.body.email},{$set:{password:salt}},{new:true},(err,success)=>{
// 			console.log(success,req.body.email,salt,randomstring);
// 			if(err)
// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 			if(!success)
// 				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CORRECT_EMAIL_ID);
// 			message.sendMail(req.body.email,"Regarding New Password Of YALA App",`Hey ${success.fullName}, your new password is ` + randomstring,(error, sent) => {
// 					if(error)
// 					console.log(error);
// 					else
// 					console.log("successfully sent")
// 				})
// 			return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
	  
			


// 		})
// 	}	



// }

// const changePassword=(req,res)=>{
//     let flag = Validator(req.body, ['oldPassword', 'newPassword', 'confirmPassword','userId'])
//     if (flag)
// 		return Response.sendResponse(res, flag[0], flag[1])
// 	else{
// 		 console.log("i am here")
//          let query={
//              _id:mongoose.Types.ObjectId(req.body.userId)
//          }
//          userServices.findUser(query,(err,success)=>{
//             if (err)
//             return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
//         else if (!success)
//             return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS);
//         else {
//             bcrypt.compare(req.body.oldPassword, success.password, (err, result) => {
//                 if (result) {
//                     if (req.body.newPassword != req.body.confirmPassword) {
//                         return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.NEW_CONFIRM_INCORRECT);
//                     }
//                     let salt = bcrypt.genSaltSync(10);
//                     success.password = bcrypt.hashSync(req.body.newPassword, salt)
//                     success.save((err, success) => {
//                         if (err) {
//                             return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
//                         } else {
//                             return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PASSWORD_UPDATE_SUCCESS,success);

//                         }
//                     })
//                 } else {
//                     return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.OLD_PASSWORD_INCORRECT);
//                 }
//             })
//            }
//          })

//      }

// }

// const changePlan=(req,res)=>{
// 	let flag = Validator(req.body, ['userId']) //if(!paymentId || !type) condition is not included 
//     if (flag)
// 		return Response.sendResponse(res, flag[0], flag[1])
// 	else{
// 	 var query={
// 		 $set:{
// 			 type:req.body.type,
// 			 paymentId:req.body.paymentId,
			 
// 		 }
// 	 }
// 	User.update({_id:req.body.userId},query,{new:true},(err,result)=>{
// 		if (err) 
// 			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
// 		if(!result)
// 			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS);
// 		return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Subscribed Successfully");
			
// 		})
//    }
// }

// const addCard=(req,res)=>{
// 	let flag = Validator(req.body,['userId',"cardDetails"],["cardNumber","cvv","expiryDate"]); 
//     if (flag)
// 		return Response.sendResponse(res, flag[0], flag[1]);
// 	User.findById(req.body.userId,(err,result)=>{
// 		if(err)
// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 		if(!result)
// 			return Response.sendResponse(res,responseCode.USER_NOT_EXISTS,responseMsg.USER_NOT_EXISTS);

// 		for (let x of result.cardDetails){
// 			if(x.cardNumber==req.body.cardDetails.cardNumber)
// 			return Response.sendResponse(res,responseCode.BAD_REQUEST,"Card number already exist");                             
// 		}
// 		result.cardDetails.push(req.body.cardDetails);
// 		console.log(result)
// 		result.save((err,success)=>{
// 		// User.findByIdAndUpdate(req.body.userId,{$push : {cardDetails :req.body.cardDetails}},{new:true,select:{"password":0}},(err,success)=>{
// 			if(err)
// 				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
// 			if(!success)
// 				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
	
// 		return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,"Card details added successfully",success);
// 		});     
// 	});
// }

// const editCard=(req,res)=>{
// 	let flag = Validator(req.body,['userId',"cardDetails"],["_id","cardNumber","cvv","expiryDate"]); 
//     if (flag)
// 		return Response.sendResponse(res, flag[0], flag[1]);
//     User.findOneAndUpdate({_id:req.body.userId,"cardDetails._id":req.body.cardDetails._id},{$set : {"cardDetails.$" :req.body.cardDetails}},{new:true},(err,success)=>{
//         if(err)
//             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
//         if(!success)
//             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
//         // for (let x of success.cardDetails)
//         //     if(x._id==req.body.cardDetails._id)
//         //         success=x;
//     return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Card details edited successfully");
//     }) 

// }

// const deleteCard=(req,res)=>{
// 	let flag = Validator(req.body,['userId',"cardDetails"],["_id"]); 
//     if (flag)
// 		return Response.sendResponse(res, flag[0], flag[1]);   
//     User.findOneAndUpdate({"_id":req.body.userId,"cardDetails._id":req.body.cardDetails._id },{ $pull: { cardDetails : { _id : req.body.cardDetails._id } } },{ safe: true,new:true},(err,success)=>{
//         if(err)
//             return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
//         if(!success)
//             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);         
//         return Response.sendResponse(res,responseCode.RESOURCE_DELETED,"Successfully deleted");
//     })
// }


// module.exports={
// 	addUser,
// 	verifyOtp,
// 	resendOtp,
// 	login,
// 	updateUser,
// 	getDetail,
// 	forgotPassword,
// 	changePassword,
// 	changePlan,
// 	addCard,
// 	editCard,
// 	deleteCard
// }