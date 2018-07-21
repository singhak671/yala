const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const User=require("../../models/user")
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices=require('../services/userApis');
const mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const addUser=(req,res)=>{
	otp=message.getOTP();
	req.body.otp = otp
	let flag = Validator(req.body, ['email', 'password', ]) ;
	if(flag)
	return Response.sendResponse(res, flag[0], flag[1])
	else
	var query={
		email:req.body.email
	}
	userServices.findUser(query,(err,success)=>{
	  if(err)
	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err)
	  else if(success)
	  return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.ALREADY_EXISTS);
	  else
	{
	   var salt = bcrypt.genSaltSync(10);
	   req.body.password = bcrypt.hashSync(req.body.password, salt);
	   userServices.addUser(req.body,(err,success)=>{
		  if(err)
		  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
		  else if(!success)
		  return Response.sendResponse(res.responseCode.BAD_REQUEST,responseMsg.CORRECT_EMAIL_ID);
		  else
		  message.sendSMS("Your verification code is " + otp, req.body.phoneNumber, (error, sent) => {
			  if(error)
			  console.log(error);
			  else
			  console.log("successfully sent")
		  })
		  return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success)

	  })}
	})

}
const verifyOtp=(req,res)=>{
	let flag =Validator(req.body,['otp'])
	if(flag)
	Response.sendResponse(res,flag[0],flag[1])
	else
	userServices.getOTP(mongoose.Types.ObjectId(req.body.userId),(err,success)=>{
		console.log(success.otp)
		if(success.otp==req.body.otp){
			var query={
				_id:mongoose.Types.ObjectId(req.body.userId),
			}
			let set={
					phoneVerified: true
			}
			let options={
				new:true
			}
			userServices.updateUser(query,set,options,(err,success)=>{
				if(err)
				return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
				else
				return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success)
			})
		}
		else{
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CORRECT_OTP)
		}
	
	})
}
const resendOtp=(req,res)=>{
	let flag =Validator(req.body,['userId'])
	if(flag)
	Response.sendResponse(res,flag[0],flag[1])
	else{
      const otp=message.getOTP();
  let set={
	  otp:otp
  }
  let options={
	  new:true
  }
  userServices.updateUser(mongoose.Types.ObjectId(req.body.userId),set,options,(err,success)=>{
	  if(err)
	  return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
	  else if(!success)
	  return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_IS_REQ)
	  else{
		message.sendSMS("Your verification code is "+otp,success.phoneNumber,(err,sent)=>{
			console.log("WWWWWWWWWWWWWWW",err,success);
			if (err)
			Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
			else
			Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
		})
	  }

  })
}
}

const login=(req,res)=>{
	let flag = Validator(req.body, ['email', 'password', 'role'])  
	if(flag)
	Response.sendResponse(res, flag[0], flag[1]) 
	else{
		
		let query={
			email:req.body.email,
			role:req.body.role
		}
		userServices.findUser(query,(err,success)=>{
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!success)
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.WRONG)
			else if(bcrypt.compareSync(req.body.password, success.password))
			return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,responseMsg.SUCCESSFULLY_DONE,success)
			else 
			return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.CORRECT_PASS)
		})
	}
}
const updateUser=(req,res)=>{
	if(!req.body.userId){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else{
		var query={
			_id:req.body.userId
		}
		userServices.findUser(query,(err,success)=>{
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(success==null)
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
			else{
				var options={
					new:true
				}
				userServices.updateUser(query,req.body,options,(err,success)=>{
					if(err)
					return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
					else
					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_UPDATE_SUCCESS, success);
				})
			}
		})
	}
}
const getDetail=(req,res)=>{
	if(!req.body.userId){
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.USER_IS_REQ)
	}
	else{
		var query={
			_id:req.body.userId
		}
		userServices.findUser(query,(err,success)=>{
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
			else if(!success)
			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
			else{
					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_DETAIL, success);
				
			}
		})
	}
}
const forgotPassword=(req,res)=>{
	if(!req.body.email)
		return Response.sendResponse(res,responseCode.BAD_REQUEST,responseMsg.EMAIL_IS_REQ);
	let flag = Validator(req.body, ['email'])  
	if(flag)
	Response.sendResponse(res, flag[0], flag[1]) 
	else{
		var randomstring = Math.random().toString(36).slice(-8);
		var salt = bcrypt.genSaltSync(10);
		salt = bcrypt.hashSync(randomstring, salt);
		userServices.updateUser({email:req.body.email},{$set:{password:salt}},{new:true},(err,success)=>{
			console.log(success,req.body.email,salt,randomstring);
			if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
			if(!success)
				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CORRECT_EMAIL_ID);
			message.sendMail(req.body.email,"Regarding New Password Of YALA App",`Hey ${success.fullName}, your new password is ` + randomstring,(error, sent) => {
					if(error)
					console.log(error);
					else
					console.log("successfully sent")
				})
			return Response.sendResponse(res,responseCode.NEW_RESOURCE_CREATED,responseMsg.SUCCESSFULLY_DONE,success);
	  
			


		})
	}	



}

const changePassword=(req,res)=>{
    let flag = Validator(req.body, ['oldPassword', 'newPassword', 'confirmPassword','userId'])
    if (flag)
		return Response.sendResponse(res, flag[0], flag[1])
	else{
		 console.log("i am here")
         let query={
             _id:mongoose.Types.ObjectId(req.body.userId)
         }
         userServices.findUser(query,(err,success)=>{
            if (err)
            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
        else if (!success)
            return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS);
        else {
            bcrypt.compare(req.body.oldPassword, success.password, (err, result) => {
                if (result) {
                    if (req.body.newPassword != req.body.confirmPassword) {
                        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.NEW_CONFIRM_INCORRECT);
                    }
                    let salt = bcrypt.genSaltSync(10);
                    success.password = bcrypt.hashSync(req.body.newPassword, salt)
                    success.save((err, success) => {
                        if (err) {
                            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
                        } else {
                            return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PASSWORD_UPDATE_SUCCESS,success);

                        }
                    })
                } else {
                    return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.OLD_PASSWORD_INCORRECT);
                }
            })
           }
         })

     }

}

const changePlan=(req,res)=>{
	let flag = Validator(req.body, ['userId']) //if(!paymentId || !type) condition is not included 
    if (flag)
		return Response.sendResponse(res, flag[0], flag[1])
	else{
	 var query={
		 $set:{
			 type:req.body.type,
			 paymentId:req.body.paymentId,
			 
		 }
	 }
	User.update({_id:req.body.userId},query,{new:true},(err,result)=>{
		if (err) 
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
		if(!result)
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS);
		return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Subscribed Successfully");
			
		})
   }
}

const addCard=(req,res)=>{
	let flag = Validator(req.body,['userId',"cardDetails"],["cardNumber","cvv","expiryDate"]); 
    if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	User.findById(req.body.userId,(err,result)=>{
		if(err)
			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
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

const editCard=(req,res)=>{
	let flag = Validator(req.body,['userId',"cardDetails"],["_id","cardNumber","cvv","expiryDate"]); 
    if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
    User.findOneAndUpdate({_id:req.body.userId,"cardDetails._id":req.body.cardDetails._id},{$set : {"cardDetails.$" :req.body.cardDetails}},{new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);
        // for (let x of success.cardDetails)
        //     if(x._id==req.body.cardDetails._id)
        //         success=x;
    return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Card details edited successfully");
    }) 

}

const deleteCard=(req,res)=>{
	let flag = Validator(req.body,['userId',"cardDetails"],["_id"]); 
    if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);   
    User.findOneAndUpdate({"_id":req.body.userId,"cardDetails._id":req.body.cardDetails._id },{ $pull: { cardDetails : { _id : req.body.cardDetails._id } } },{ safe: true,new:true},(err,success)=>{
        if(err)
            return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
        if(!success)
            return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.NOT_FOUND);         
        return Response.sendResponse(res,responseCode.RESOURCE_DELETED,"Successfully deleted");
    })
}


module.exports={
	addUser,
	verifyOtp,
	resendOtp,
	login,
	updateUser,
	getDetail,
	forgotPassword,
	changePassword,
	changePlan,
	addCard,
	editCard,
	deleteCard
}