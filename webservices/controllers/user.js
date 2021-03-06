const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const Validator = require('../../middlewares/validation').validate_all_request;
const communicationValidator = require('../../middlewares/validation').validate_communication_credentials;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const userServices = require('../services/userApis');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcryptjs');
const config = require("../../config/config");
const moment = require("moment")
const Notification = require('../../models/notification.js')
const jwt = require('jsonwebtoken');
var Twocheckout = require('2checkout-node');
var waterfall = require('async-waterfall');
var paymentAmount;
//var countries   = require('country-data-list').countries;
var countryCodes = require('country-data');

const User = require("../../models/user");
//--------------------------Add Users-----------------------------------------------------------
const signup = (req, res) => {
	console.log("req.body---->>", req.body)
	otp = message.getOTP();
	req.body.otp = otp
	let flag = Validator(req.body, ['email', 'password',])
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1])
	else if (!req.body)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.PROVIDE_DATA)
	else {
		req.body.email = req.body.email.toLowerCase();
		var query = {
			$or: [{ email: req.body.email },
			{ mobileNumber: req.body.mobileNumber }]
		}
		userServices.findUser(query, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (success)
				return Response.sendResponse(res, responseCode.BAD_REQUEST, "Email or mobile number already exists.");
			else {
				let salt = bcrypt.genSaltSync(10);
				req.body.password = bcrypt.hashSync(req.body.password, salt)

				message.sendSMS("Your verification code is " + otp, req.body.countryCode, req.body.mobileNumber, (error, sent) => {
					if (error || !sent) {
						console.log(error);
						console.log("invaliddddd")
						return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.WRONG_PHONE)
					}

					else {
						message.sendMail(req.body.email, "Yala Sports App ✔", "Your verification code is " + otp, (err, result) => {
							if (err || !result) {
								return Response.sendResponse(res, responseCode.UNAUTHORIZED, "Enter valid email")
							}
							else {
								if (req.body.role == "ORGANIZER") {

									let obj = {
										"oneEvent": "50",
										"yearly": "1000",
										"monthly": "200"
									};
									req.body.subscriptionPrice = obj[req.body.subscription];
									req.body.optionalSubsPrices = {
										"web&hosting": "50",
										"event&membershipManagement": "50"

									};

								}
								if (req.body.role == "PLAYER") //changes done by sammer sir
									req.body.paymentStatus = true;
								userServices.addUser(req.body, (err, success) => {
									if (err) {
										console.log("err--->>", err)
										return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
									}
									else if (!success)
										return Response.sendResponse(res,responseCode.BAD_REQUEST, responseMsg.CORRECT_EMAIL_ID);
									else {
										console.log("successfully sent")

										return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Signed up successfully", success)
									}

								})
							}
						})

					}
				})
			}
		})
	}
}
//--------------------------Verify OTP-----------------------------------------------------------
const verifyOtp = (req, res) => {
	console.log("otp----->>", req.body)
	console.log("_id----->>>", req.body._id)
	let flag = Validator(req.body, ['otp'])
	if (flag)
		Response.sendResponse(res, flag[0], flag[1])
	else if (!req.body._id)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	else
		userServices.getOTP(mongoose.Types.ObjectId(req.body._id), (err, success) => {
			console.log("secret key is " + config.secret_key)
			var token = jwt.sign({ _id: success._id, email: success.email, password: success.password }, config.secret_key);
			console.log("token--->>", token)
			console.log(success.otp)
			if (success.otp == req.body.otp) {
				var query = {
					_id: mongoose.Types.ObjectId(req.body._id),
				}
				let set = {
					phoneVerified: true,
					emailVerified: true
				}
				let options = {
					new: true,
					select: { "password": 0 }
				}
				userServices.updateUser(query, set, options, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
					else
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "OTP verified successfully", success, "", token)
				})
			}
			else {
				return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.CORRECT_OTP)
			}

		})
}
//--------------------------Resend OTP -----------------------------------------------------------
const resendOtp = (req, res) => {
	console.log("user Id------>>>>", req.query._id)

	if (!req.query._id)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	else {
		const otp = message.getOTP();
		let set = {
			otp: otp,
		}
		let options = {
			new: true
		}
		userServices.updateUser({ _id: req.query._id }, set, options, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else {
				console.log(success)
				message.sendSMS("Your verification code is " + otp, success.countryCode, success.mobileNumber, (err, sent) => {
					if (err || !sent)
						Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
					else {
						message.sendMail(success.email, "Yala Sports App ✔", "Your verification code is " + otp, (err, result) => {
							if (err || !result)
								Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
							else {
								Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "OTP sent successfully")
							}
						})
					}

				})
			}

		})
	}
}
//--------------------------Log In-----------------------------------------------------------
const login = (req, res) => {
	console.log("LOGIN >>> req.body--->>", req.body)
	let flag = Validator(req.body, ['email', 'password'], [], ["currentDate"]);
	if (flag)
		Response.sendResponse(res, flag[0], flag[1])
	else {
		req.body.email = req.body.email.toLowerCase();
		let query = {
			email: req.body.email
		}
		userServices.findUser(query, (err, result) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			else if (!result)
				return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.EMAIL_NOT_EXISTS)
			else {
				bcrypt.compare(req.body.password, result.password, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
					else if (!success)
						return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.WRONG_PASSWORD1)
					else {
						//console.log(result.subscriptionEndDate)
						if (result.role.indexOf("ORGANIZER") !== -1 && result.subscription != "oneEvent") {
							if (req.body.deviceToken && req.body.deviceType)
								User.findOneAndUpdate({ email: req.body.email }, { $addToSet: { deviceToken: req.body.deviceToken }, $set: { deviceType: req.body.deviceType } }, (error, result) => {
									if (error || !result)
										return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.EMAIL_NOT_EXISTS)
									else if (result) {
										console.log("device token and device type setted successfully")
									}

								})

							if (moment(Number(req.body.currentDate)).isSameOrBefore(result.subscriptionEndDate)) {
								console.log("secret key is " + config.secret_key)
								// var calculatedExpiresIn = (((d.getTime()) + (60 * 60 * 1000)) - (d.getTime() - d.getMilliseconds()) / 1000);
								// console.log("secret key is "+calculatedExpiresIn)
								//var token =  jwt.sign({_id:result._id,email:result.email,password:result.password},config.secret_key,{ expiresIn: calculatedExpiresIn }
								var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);
								console.log("token----->>", token)
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LOG_SUCCESS, result, "", token)
							}
							else {
								User.findOneAndUpdate({ email: req.body.email }, { $set: { paymentStatus: false } }, (error, result) => {
									if (error || !result)
										return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.EMAIL_NOT_EXISTS)
									else if (result) {
										var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);
										console.log("token----->>", token)
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Your subscription plan has expired! Please renew to continue.", result, "", token)
									}

								})

							}
						}
						else {
							if (req.body.deviceToken && req.body.deviceType)
								User.findOneAndUpdate({ email: req.body.email }, { $addToSet: { deviceToken: req.body.deviceToken }, $set: { deviceType: req.body.deviceType } }, (error, result) => {
									if (error || !result)
										return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.EMAIL_NOT_EXISTS)
									else if (result) {
										console.log("device token and device type setted successfully")
									}

								})
							var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);
							console.log("token----->>", token)
							return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LOG_SUCCESS, result, "", token)
						}
					}
				})
			}
		})
	}
}

//--------------------------Update User-----------------------------------------------------------
const updateUser = (req, res) => {
	console.log("req.body", req.body)
	if (!req.body._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		var query = {
			_id: req.body._id
		}
		userServices.findUser(query, (err, success) => {
			if (err)
				return Response.sendResponse(res, response.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else {
				if (req.body.image) {
					waterfall([(callback) => {
						message.uploadImg(req.body.image, (err, success) => {
							if (err) {
								return Reponse.sendResponse(res, reponseCode.INTERNAL_SERVER_ERROR, reponseMsg.INTERNAL_SERVER_ERROR)
							}
							else {
								console.log("image.url", success)
								callback(null, success.secure_url)
							}
						})
					}, (imageurl, callback) => {
						req.body.image = imageurl;
						callback(null, req.body)
					}
					], (err, result) => {
						console.log("result--->>", result)

						let options = {
							new: true,
							select: { "password": 0 }
						}
						userServices.updateUser(query, result, options, (err, success) => {
							if (err)
								Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
							else
								Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_UPDATE_SUCCESS, success)

						})
					}
					)
				}
				else {
					let options = {
						new: true
					}
					userServices.updateUser(query, req.body, options, (err, success) => {
						if (err)
							return Response.sendResponse(res, response.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
						else
							return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_UPDATE_SUCCESS, success);
					})
				}
			}
		})
	}
}
//-------------------------- Get Detail of User for update -----------------------------------------------------------

const getDetail = (req, res) => {
	console.log("req---->", req.query._id)
	if (!req.query._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		var query = {
			_id: req.query._id
		}
		select = {
			"password": 0
		}
		userServices.findUserDetail(query, select, (err, success) => {
			if (err)
				return Response.sendResponse(res, response.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else {
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.USER_DETAIL, success);

			}
		})
	}
}
//------------------------------Change Password-----------------------------------------------------------
const changePassword = (req, res) => {
	let flag = Validator(req.body, ['password', 'newPassword'])
	if (!req.body._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else if (flag) {
		Response.sendResponse(res, flag[0], flag[1])
	}
	else {
		var query = {
			_id: req.body._id
		}
		userServices.findUser(query, (err, result) => {
			if (err) {
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			}
			else if (!result) {
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			}
			else {
				bcrypt.compare(req.body.password, result.password, (err, success) => {
					if (err) {
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
					}
					else if (!success) {
						return Response.sendResponse(res, responseCode.UNAUTHORIZED, responseMsg.WRONG_PASSWORD)
					}
					else {
						let salt = bcrypt.genSaltSync(10);
						req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)
						console.log("cdcfhfvf=----->", req.body.newPassword)
						var options = {
							new: true
						}
						let set = {
							password: req.body.newPassword
						}
						userServices.updateUser(query, set, options, (err, success) => {
							if (err) {
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
							}
							else if (!success) {
								return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
							}
							else {
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PASSWORD_UPDATE);
							}
						})
					}
				})
			}
		})
	}
}
//--------------------------Forget Password-----------------------------------------------------------
const forgetPassword = (req, res) => {
	console.log("req.body----->>>", req.body)
	const password = message.genratePassword();
	req.body.password = password;
	console.log("password---->>>", req.body.password)

	let flag = Validator(req.body, ['email'])
	if (flag) {
		return Response.sendResponse(res, flag[0], flag[1])
	}
	else {
		if (req.body.email)
			req.body.email = req.body.email.toLowerCase();
		query = {
			email: req.body.email
		}
		userServices.findUser(query, (err, success) => {
			if (err) {
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
			}
			else if (!success) {
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMAIL_NOT_EXISTS);
			}
			else {
				let salt = bcrypt.genSaltSync(10);
				req.body.password = bcrypt.hashSync(req.body.password, salt)
				console.log("forgetPassword=----->", req.body.password)
				var options = {
					new: true
				}
				let set = {
					password: req.body.password
				}
				userServices.updateUser(query, set, options, (err, success) => {
					if (err) {
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
					}
					else if (!success) {
						return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
					}
					else {
						message.sendMail(success.email, "Forgot Password", "Your New Password is " + password, (err, result) => {
							if (err) {
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.EMAIL_NOT_SEND);
							}
							else if (!result)
								return Response.sendResponse(res, responseCode.UNAUTHORIZED.responseMsg.SIGN_IN_WITH_VALID)
							else {
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Password sent to your registered email ID");
							}
						})

					}
				})

			}
		})
	}

}
//-----------------------------------changePlan------------------------------------------------------------------------------------
const changePlan = (req, res) => {
	console.log("req.body--->>", req.body)
	let flag = Validator(req.body, [], [], ["subscription"])
	if (flag) {
		return Response.sendResponse(res, flag[0], flag[1])
	}
	else {
		User.findById(req.query.userId, (err, success) => {
			if (err) {
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			}
			else if (!success) {
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			}
			else {



				let obj = {
					"oneEvent": "50",
					"yearly": "1000",
					"monthly": "200"
				};
				let price = {};
				price.price = obj[req.body.subscription];
				price.optionalSubsPrices = success.optionalSubsPrices;
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, price);


			}
		})
	}
}
//------------------------LogOut-------------------
const logOut = (req, res) => {
	if (!req.query._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		query = {
			_id: req.query._id
		}

		options = {
			new: true
		}
		User.findOneAndUpdate(query, { $pull: { deviceToken: req.query.deviceToken } }, options, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else
				return Response.sendResponse(res, responseCode.SUCCESSFULLY_DONE, responseMsg.LOGOUT)
		})
	}
}
//---------------------------------Add Card Details-------------------------------------
const addCard = (req, res) => {
	console.log("req.body--->>", req.body)
	let flag = Validator(req.body, ["cardDetails"], ["cardNumber", "expiryDate"]);
	if (!req.body._id)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	else if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	User.findById(req.body._id, (err, result) => {
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
		if (!result)
			return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);

		for (let x of result.cardDetails) {
			if (x.cardNumber == req.body.cardDetails.cardNumber)
				return Response.sendResponse(res, responseCode.BAD_REQUEST, "Card number already exist");
		}
		result.cardDetails.push(req.body.cardDetails);
		console.log(result)
		result.save((err, success) => {
			// User.findByIdAndUpdate(req.body.userId,{$push : {cardDetails :req.body.cardDetails}},{new:true,select:{"password":0}},(err,success)=>{
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
			if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND);

			return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Card details added successfully", success);
		});
	});
}
//-----------------------------Get Card Details----------------------------------------
const getCardDetails = (req, res) => {
	if (!req.query._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
	}
	else {
		let query = {
			_id: req.query._id
		}
		userServices.findUser(query, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CARD_DETAIL, success)
		})
	}
}
//------------------------Edit Card Details---------------------------------------------------
const editCardDetails = (req, res) => {
	console.log("req.body--->>", req.body)
	let flag = Validator(req.body, ["cardDetails"], ["_id", "cardNumber", "expiryDate"], ["_id"]);

	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	User.findOneAndUpdate({ _id: req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $set: { "cardDetails.$": req.body.cardDetails } }, { new: true }, (err, success) => {
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
		if (!success)
			return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
		// for (let x of success.cardDetails)
		// if(x._id==req.body.cardDetails._id)
		// success=x;
		return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.CARD_UPDATE, success);
	})

}

//===============================================change card for auto renew plan============================================//
const changeCardforAutoRenew = (req, res) => {
	console.log("changeCardforAutoRenew req.body--->>", req.body);
	let flag = Validator(req.body, ['_id', "cardDetails"], ["_id", "cardNumber", "expiryDate"]);
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	else {
		User.findOne({ "_id": req.body._id, "cardDetails.autoRenew": true }, (err, success1) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
			else if (!success1) {
				if (req.body.cardDetails.autoRenew == false)
					User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $set: { "cardDetails.$": req.body.cardDetails, autoRenewPlan: req.body.cardDetails.autoRenew } }, { safe: true, new: true }, (err, success) => {
						if (err)
							return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
						else if (!success)
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
						else {
							if (req.body.cardDetails.autoRenew == true)
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully added a new card for </br> auto renewal of your plan!", success);
							else
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully removed card from auto renewal of your plan!", success);


						}
					})
				else {

					User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $set: { "cardDetails.$": req.body.cardDetails } }, { safe: true, new: true }, (err, success) => {
						if (err)
							return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
						else if (!success)
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
						else {
							if (req.body.cardDetails.autoRenew == true)
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully added a new card for </br> auto renewal of your plan!", success);
							else
								return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully removed card from auto renewal of your plan!", success);


						}
					})

				}
			}
			else {
				if (req.body.cardDetails.autoRenew == true)
					User.findOneAndUpdate({ "_id": req.body._id, "cardDetails.autoRenew": true }, { $set: { "cardDetails.$.autoRenew": false } }, { safe: true, new: true }, (err, success) => {
						if (err)
							return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
						else if (!success)
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
						else {
							User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $set: { "cardDetails.$": req.body.cardDetails } }, { safe: true, new: true }, (err, success) => {
								if (err)
									return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
								else if (!success)
									return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
								else {
									if (req.body.cardDetails.autoRenew == true)
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully added a new card for </br> auto renewal of your plan!", success);
									else
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully removed card from auto renewal of your plan!", success);
								}
							})
						}

					})
				else {
					User.findOneAndUpdate({ "_id": req.body._id, "cardDetails.autoRenew": true }, { $set: { "cardDetails.$.autoRenew": false } }, { safe: true, new: true }, (err, success) => {
						if (err)
							return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
						else if (!success)
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
						else {
							User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $set: { "cardDetails.$": req.body.cardDetails, autoRenewPlan: req.body.cardDetails.autoRenew } }, { safe: true, new: true }, (err, success) => {
								if (err)
									return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
								else if (!success)
									return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
								else {
									if (req.body.cardDetails.autoRenew == true)
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully added a new card for </br> auto renewal of your plan!", success);
									else
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully removed card from auto renewal of your plan!", success);
								}
							})
						}

					})
				}
			}
		})
	}
}
// 		User.findOneAndUpdate({"_id":req.body._id,"cardDetails._id":req.body.cardDetails._id },{$set : {"cardDetails.$" :req.body.cardDetails}},{ safe: true,new:true},(err,success)=>{
// 		if(err)
// 		return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
// 		else if(!success)
// 		return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CARD_NOT_FOUND); 
// 		else
// 		return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.CARD_DELET);
// })
// }
//---------------------------Delete Card Details---------------------------------------------------

const deleteCard = (req, res) => {
	console.log("req.body--->>", req.body)
	let flag = Validator(req.body, ['_id', "cardDetails"], ["_id"]);
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	User.findOne({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id, "cardDetails.autoRenew": true }, (err, success1) => {
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
		else if (!success1) {
			console.log("i have comed for direct deletion")
			User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $pull: { cardDetails: { _id: req.body.cardDetails._id } } }, { safe: true, new: true }, (err, success) => {
				if (err)
					return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
				else if (!success)
					return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
				else
					return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.CARD_DELET);
			})
		}
		else {
			console.log("I am success)))))))))))))))))***************", success1)

			User.findOneAndUpdate({ _id: req.body._id }, { $set: { autoRenewPlan: false } }, { new: true, safe: true }, (err, success2) => {
				if (err)
					return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
				else if (!success2)
					return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
				else {
					User.findOneAndUpdate({ "_id": req.body._id, "cardDetails._id": req.body.cardDetails._id }, { $pull: { cardDetails: { _id: req.body.cardDetails._id } } }, { safe: true, new: true }, (err, success) => {
						if (err)
							return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
						else if (!success)
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
						else
							return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.CARD_DELET);
					})

				}
			})

			// else{
			// 	User.findOneAndUpdate({"_id":req.body._id,"cardDetails._id":req.body.cardDetails._id },{ $pull: { cardDetails : { _id : req.body.cardDetails._id } } },{ safe: true,new:true},(err,success)=>{
			// 		if(err)
			// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR);
			// 		else if(!success)
			// 				return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.CARD_NOT_FOUND); 
			// 			else
			// 				return Response.sendResponse(res,responseCode.RESOURCE_DELETED,responseMsg.CARD_DELET);
			// 		})

			// }
		}

	})

}
//-----------------------------------------------Get A card Detail--------------------------------------
const getCard = (req, res) => {
	console.log("req.body--->>", req.body)
	let flag = Validator(req.body, ['_id', "cardDetails"], ["_id"]);
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	else {
		let query = {
			$and: [{ _id: req.body._id }, { "cardDetails._id": req.body.cardDetails._id }]
		}
		console.log("gehwdgdggg", query)
		User.findOne(query, { 'cardDetails.$._id': 1 }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.CARD_NOT_FOUND);
			else
				return Response.sendResponse(res, responseCode.RESOURCE_DELETED, responseMsg.CARD_DETAIL, success.cardDetails);
		})
	}
}
//------------------------Country Name and Codes------------------------------
const code = (req, res) => {
	let country = [];
	let count = 0
	//console.log("country------>>>",countryCodes.countries.all)
	for (i = 0; i < countryCodes.countries.all.length; i++) {
		if (countryCodes.countries.all[i].name && countryCodes.countries.all[i].countryCallingCodes[0] && countryCodes.countries.all[i].emoji) {
			country[i] = {
				countryName: countryCodes.countries.all[i].name,
				callingCode: countryCodes.countries.all[i].countryCallingCodes[0],
				flag: countryCodes.countries.all[i].emoji
			}
		}


	}
	for (i = 0; i < country.length; i++) {

		if (country[i] == null) {
			country.splice(i, 1)
		}

	}
	for (i = 0; i < country.length; i++) {

		if (country[i] == null) {
			country.splice(i, 1)
		}

	}


	//console.log("codeAndCountries===>>",country)
	console.log("count----->>>", country.length)
	Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, country)
}

const paymentOrder = (req, res) => {
	console.log("req.body>>>", req.body);
	//console.log("req.body>>>",req.body.response.token.token);
	let flag = Validator(req.body, [], [], ["optionalSubsPrices", "subscription"])
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	else
		if (!req.body || !req.body.response.token)
			return Response.sendResponse(res, responseCode.BAD_REQUEST, "Payment failed");
		else {
			paymentAmount = 0;
			User.findById(req.headers.userid, (err, success) => {
				if (err)
					return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
				else if (!success)
					return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
				else {
					if (req.body.optionalSubsPrices !== false) {
						for (let data of req.body.optionalSubsPrices)
							paymentAmount += Number(success.optionalSubsPrices[data]);

						paymentAmount = paymentAmount + (Number(success.subscriptionPrice));
					}
					else
						paymentAmount = success.subscriptionPrice;
					console.log("@@@@@@@@@@@@@@@@@@@@>>>>>", paymentAmount);
					var tco = new Twocheckout({
						sellerId: "901386003",         // Seller ID, required for all non Admin API bindings 
						privateKey: "CA54E803-AC54-41C3-8677-A36DE6C276A4",     // Payment API private key, required for checkout.authorize binding
						sandbox: true                          // Uses 2Checkout sandbox URL for all bindings
					});

					var params = {
						"merchantOrderId": "123",
						"token": req.body.response.token.token,
						"currency": "USD",
						"total": paymentAmount,
						"billingAddr": {
							"name": "Testing Tester",
							"addrLine1": "123 Test St",
							"city": "Columbus",
							"state": "Ohio",
							"zipCode": "43123",
							"country": "USA",
							"email": "example@2co.com",
							"phoneNumber": "5555555555"
						}
					};

					tco.checkout.authorize(params, function (error, data) {
						console.log("i am data and error", data, error);
						if (error || !data) {
							return Response.sendResponse(res, responseCode.BAD_REQUEST, "UNAUTHORIZED");
						} else {
							if (data.response.responseCode == "APPROVED" && data.response.orderNumber && !data.response.errors) {
								let subscriptionOverDate;
								if (req.body.subscription == "monthly")
									subscriptionOverDate = (moment(req.body.response.token.dateCreated).add(29, 'd'));
								if (req.body.subscription == "yearly")
									subscriptionOverDate = (moment(req.body.response.token.dateCreated).add(364, 'd'));
								// if(req.body.autoRenewPlan=="false")
								// 	req.body.autoRenewPlan=false;
								// else
								// 	req.body.autoRenewPlan=true;

								var access = ["Competition", "Membership", "Create Team & Player", "Media", "Online Registration", "Standing & Fixture", "Product", "WebsiteManagement", "Social Media", "employeeUserManagement", "financialManagement", "userNotification"];
								access.push.apply(access, req.body.optionalSubsPrices);
								User.findByIdAndUpdate(req.headers.userid, { $set: { subscription: req.body.subscription, paymentStatus: true, payment: data, subscriptionStartDate: req.body.response.token.dateCreated, subscriptionEndDate: subscriptionOverDate, autoRenewPlan: req.body.autoRenewPlan }, $push: { subscriptionAccess: access } }, { new: true }, (err, result) => {
									if (err)
										return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
									else if (!result)
										return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
									else {

										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Payment done successfully", result);
									}
								})

							}
							else
								return Response.sendResponse(res, responseCode.BAD_REQUEST, "Payment not successfull");


						}
					});
				}
			})
		}

























	// 	tco.checkout.authorize(params, function (error, data) {
	// 		if (error) {
	// 			res.send(error.message);
	// 		} else {
	// 		  tco.sales.retrieve({sale_id: data.orderNumber}, function (error, data) {
	// 	  if (error) {
	// 		  console.log(error);
	// 	  } else {
	// 		  console.log(data);
	// 	  }
	//   });
	// 		  console.log(data)
	// 			res.send(data);
	// 		}
	// 	});


	// 	{
	// 		var tco = new Twocheckout({
	// 			sellerId: "901386003",         // Seller ID, required for all non Admin API bindings 
	// 			privateKey: "E8733BDE-152A-4A66-83FF-3BA893702860",     // Payment API private key, required for checkout.authorize binding
	// 			sandbox: true                          // Uses 2Checkout sandbox URL for all bindings
	// 		});

	// 		var params = {
	// 			"merchantOrderId": "123",
	// 			"token": req.body.response.token.token,
	// 			"currency": "USD",
	// 			"total":"20.00",

	// 		};

	// 		tco.checkout.authorize(params, function (error, data) {
	// 			console.log("i am data and error",data,error);
	// 			if (error || !data ) {
	// 				return Response.sendResponse(res,responseCode.BAD_REQUEST,"UNAUTHORIZED");
	// 			} else {
	// 	// 		  tco.sales.retrieve({sale_id: data.orderNumber}, function (error, data) {
	// 	// 	  if (error) {
	// 	// 		  console.log(error);
	// 	// 	  } else {
	// 	// 		  console.log(data);
	// 	// 	  }
	// 	//   });
	// 				if(data.response.responseCode=="APPROVED" && data.response.orderNumber && !data.response.errors){




	// 	User.findById(req.headers.userid,(err,success)=>{
	// 		if(err)
	// 			return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
	// 		else if(!success)
	// 			return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
	// 			else
	// 			User.findByIdAndUpdate(req.headers.userid,{$set:{paymentStatus:true,payment:data}},{new:true},(err,result)=>{
	// 				if(err)
	// 					return Response.sendResponse(res,responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR,err);
	// 				else if(!result)
	// 						return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS);
	// 					else
	// 					return Response.sendResponse(res,responseCode.EVERYTHING_IS_OK,"Payment is successfull",result);
	// 			})
	// 	})
	// } 
	// else
	// return Response.sendResponse(res,responseCode.BAD_REQUEST,"Payment not successfull");


	// 			}
	// 		});
	// 	}












}

const changeAutoRenew = (req, res) => {
	let flag = Validator(req.body, [], [], []);
	if (flag)
		return Response.sendResponse(res, flag[0], flag[1]);
	User.findById({ _id: req.query.userId }, (err, success) => {
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
		else if (!success)
			return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS);
		else {
			console.log("******************************", success.cardDetails.length)
			if (success.cardDetails.length != 0) {
				User.findOne({ _id: req.query.userId, "cardDetails.autoRenew": true }, (err, success1) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
					else if (!success1)
						return Response.sendResponse(res, responseCode.BAD_REQUEST, "Please select card for auto renewal!");
					else {


						success.autoRenewPlan = req.body.autoRenewPlan;
						success.save((err, success1) => {
							if (err || !success1)
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
							else {
								if (req.body.autoRenewPlan == true)
									return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully enabled your auto renewal plan!");
								else
									return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "You've successfully disabled your auto renewal plan!");
							}
						})
					}
				})
			}
			else
				return Response.sendResponse(res, responseCode.BAD_REQUEST, "Please add card first!");

		}
	})
}



const addEmployee = (req, res) => {
	console.log("req.body--->>", req.body)
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED);
	else
		communicationValidator(req.query.userId, ["mail"], (err, flag) => {
			if (flag[0] !== 200)
				return Response.sendResponse(res, flag[0], flag[1], flag[2]);
			else {
				if (req.body.email)
					req.body.email = req.body.email.toLowerCase();
				let query = {
					_id: req.query.userId
				}
				userServices.findUser(query, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
					else if (!success)
						return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND)
					else {
						if (req.body.employeeRole == "ADMINSTRATOR")
							req.body.employeePermissionForAdminstartor = {
								dataBase: success.employeePermissionForAdminstartor.dataBase,
								myCompetition: success.employeePermissionForAdminstartor.myCompetition,
								myVenue: success.employeePermissionForAdminstartor.myVenue,
								myMembership: success.employeePermissionForAdminstartor.myMembership,
								media: success.employeePermissionForAdminstartor.media
							}
						if (req.body.employeeRole == "COORDINATOR")
							req.body.employeePermissionForCoordinator = {
								dataBase: success.employeePermissionForCoordinator.dataBase,
								myCompetition: success.employeePermissionForCoordinator.myCompetition,
								myVenue: success.employeePermissionForCoordinator.myVenue,
								myMembership: success.employeePermissionForCoordinator.myMembership,
								media: success.employeePermissionForCoordinator.media
							}
						const password = message.genratePassword();
						console.log("@@@@@@", password)
						let salt = bcrypt.genSaltSync(10);
						req.body.password = bcrypt.hashSync(password, salt)
						req.body.role = success.role
						req.body.employeerId = success._id,
							req.body.phoneVerified = true,
							req.body.organizerType = success.organizerType,
							req.body.subscription = success.subscription,
							req.body.subscriptionAccess = success.subscriptionAccess
						req.body.paymentStatus = success.paymentStatus
						console.log(req.body)
						userServices.findUser({ email: req.body.email }, (err, success1) => {
							if (err)
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
							else if (success1)
								return Response.sendResponse(res, responseCode.ALREADY_EXIST, responseMsg.EMPLOYEE_EXISTS)
							else {
								userServices.addUser(req.body, (err, success2) => {
									if (err)
										return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
									else {
										message.sendMail(success2.email, "YALA App Login Credentials", "Your Login Credentials are :" + "<br/>UserId : " + req.body.email + "<br/>Password : " + password, (err, result1) => {
											if (err || !result1) {
												return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.EMAIL_NOT_SEND);
											}
											else {
												return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, responseMsg.EMPLOYEE_CREATED, success2)
											}
										}, success._id)
									}
								})
							}
						})
					}
				})
			}
		})

}
//-------------------------------------------------------Get List of employee---------------------------------
const getListOfEmployee = (req, res) => {
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
	else {
		let query = {
			employeerId: req.query.userId,
			status: "ACTIVE",
		}
		if (req.body.employeeRole) {
			query.employeeRole = req.body.employeeRole
		}
		let option = {
			page: req.body.page || 1,
			limit: req.body.limit || 10,
			sort: { createdAt: -1 }
		}
		userServices.getListOfEmployee(query, option, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success.docs.length)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMPLOYEE_NOT_FOUND)
			else
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_EMPLOYEE, success)
		})
	}
}
//-----------------------------------Delete User-----------------------------
const deleteEmployee = (req, res) => {
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
	else if (!req.query.employeeId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.EMPLOYEE_IS_REQUIRED)
	else {
		userServices.findUser({ _id: req.query.employeeId, employeerId: req.query.userId }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMPLOYEE_NOT_FOUND)
			else {
				userServices.updateUser({ employeerId: req.query.userId }, { status: "INACTIVE" }, { new: true }, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
					else if (!success)
						return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NO_DATA_FOUND)
					else
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.EMPLOYEE_DELETE)
				})
			}
		})
	}
}
//-----------------------------Search User-----------------------------------
const searchUser = (req, res) => {
	let search = new RegExp("^" + req.body.search)
	let query = {
		$or: [{ firstName: search }, { employeeRole: search }],
		employeerId: req.query.userId
	}
	var options = {
		page: req.body.page || 1,
		limit: req.body.limit || 10,
		sort: { createdAt: -1 }
	}
	userServices.getListOfEmployee(query, options, (err, success) => {
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
		else if (!success.docs.length)
			return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMPLOYEE_NOT_FOUND);
		else
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_EMPLOYEE, success)
	})
}
//----------------------------Role Matrix-----------------------------
const setRoleForEmployee = (req, res) => {
	console.log("req.body--->>", req.body)
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
	else {
		let query = {}
		if (req.body.employeePermissionForCoordinator.dataBase)
			query["employeePermissionForCoordinator.dataBase"] = req.body.employeePermissionForCoordinator.dataBase
		if (req.body.employeePermissionForCoordinator.myCompetition)
			query["employeePermissionForCoordinator.myCompetition"] = req.body.employeePermissionForCoordinator.myCompetition
		if (req.body.employeePermissionForCoordinator.myVenue)
			query["employeePermissionForCoordinator.myVenue"] = req.body.employeePermissionForCoordinator.myVenue
		if (req.body.employeePermissionForCoordinator.media)
			query["employeePermissionForCoordinator.media"] = req.body.employeePermissionForCoordinator.media
		if (req.body.employeePermissionForCoordinator.myMembership)
			query["employeePermissionForCoordinator.myMembership"] = req.body.employeePermissionForCoordinator.myMembership
		if (req.body.employeePermissionForAdminstartor.dataBase)
			query["employeePermissionForAdminstartor.dataBase"] = req.body.employeePermissionForAdminstartor.dataBase
		if (req.body.employeePermissionForAdminstartor.myCompetition)
			query["employeePermissionForAdminstartor.myCompetition"] = req.body.employeePermissionForAdminstartor.myCompetition
		if (req.body.employeePermissionForAdminstartor.myVenue)
			query["employeePermissionForAdminstartor.myVenue"] = req.body.employeePermissionForAdminstartor.myVenue
		if (req.body.employeePermissionForAdminstartor.media)
			query["employeePermissionForAdminstartor.media"] = req.body.employeePermissionForAdminstartor.media
		if (req.body.employeePermissionForAdminstartor.myMembership)
			query["employeePermissionForAdminstartor.myMembership"] = req.body.employeePermissionForAdminstartor.myMembership
		userServices.findUser({ _id: req.query.userId }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND, "anurag")
			else {
				let set = query;
				let option = {
					new: true
				};
				userServices.updateUser({ _id: req.query.userId }, set, option, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
					else {
						let set = {
							employeePermissionForCoordinator: success.employeePermissionForCoordinator
						}
						userServices.updateEmployee({ employeerId: req.query.userId, employeeRole: "COORDINATOR" }, set, { new: true }, (err, success1) => {
							if (err)
								return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
							else {
								let set = {
									employeePermissionForAdminstartor: success.employeePermissionForAdminstartor
								}
								userServices.updateEmployee({ employeerId: req.query.userId, employeeRole: "ADMINSTRATOR" }, set, (err, success2) => {
									if (err)
										return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
									else
										return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.EMPLOYEE_ROLE, success)
								})
							}
						})
					}
				})
			}
		})
	}
}
//---------------------------------Get Role Matrix----------------------------
const getRoleForEmployee = (req, res) => {
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORGANIZER_IS_REQUIRED)
	else {
		let select = {
			employeePermissionForCoordinator: 1,
			employeePermissionForAdminstartor: 1,
			_id: 0
		}
		userServices.findUserRole({ _id: req.query.userId }, select, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.ORGANIZER_NOT_FOUND);
			else
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.ROLE_MATRIX, success)
		})
	}
}


//--------------------Control Notification--------------------------------------------
const controlNotification = (req, res) => {
	console.log("req.body--->>", req.body)
	if (!req.query.userId) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		userServices.findUser({ _id: req.query.userId }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS, err)
			else {
				let set = {
					competitionNotify: req.body.competitionNotify,
					membershipNotify: req.body.membershipNotify,
					venueNotify: req.body.venueNotify
				}
				userServices.updateUser({ _id: req.query.userId }, set, { new: true }, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
					else if (!success)
						return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.MODIFICATION_FAILED)
					else
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.NOTIFICATION, success)
				})
			}
		})
	}
}

//-------------------------Get List of Notificaton Settings----------------
const getControlNotification = (req, res) => {
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	else {
		userServices.findUserDetail({ _id: req.query.userId }, { competitionNotify: 1, membershipNotify: 1, venueNotify: 1, _id: 0, organizerNotification: 1 }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.NOTIFICATION_SETTING, success)
		})
	}
}

//--------Notification list -------------------
const getnotificationList = (req, res) => {
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)

	else {
		User.findOne({ _id: req.query.userId }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else {
				let query = {
					userId: ObjectId(req.query.userId)
				}
				var aggregate = Notification.aggregate([{
					$match: query
				}, {
					$unwind: "$notification"
				}, {
					$project: { message: "$notification", _id: 0 }
				}, {
					$sort: { "message.createdAt": -1 }
				},
				])
				let option = {
					page: req.body.page || 1,
					limit: req.body.limit || 10,
				}
				Notification.aggregatePaginate(aggregate, option, (err, result, pages, total) => {
					if (!err) {
						const success = {
							"docs": result,
							"total": total,
							"limit": option.limit,
							"page": option.page,
							"pages": pages,
						}
						console.log(success)
						if (success.docs.length)
							return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.NOTIFICATION_LIST, success)
						else
							return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.NOT_FOUND)
					}
					else {
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
					}
				})
			}
		})
	}
}
//------------------Delete Notification For player------------
const deleteNotification = (req, res) => {
	console.log("anurag&&&&&&&&&&&&&&&&&&&&&&&&&&&&& <<", req.query.notificationId);
	if (!req.query.userId)
		return Response.sendResponse(res, reponseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	else if (!req.query.notificationId)
		return Response.sendResponse(res, reponseCode.BAD_REQUEST, responseMsg.NOTIFICATION_IS_REQ)
	else {
		Notification.findOneAndUpdate({ userId: req.query.userId, "notification._id": req.query.notificationId }, { $pull: { notification: { _id: req.query.notificationId } } }, { new: true, safe: true }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, "Notification not found!")
			else
				return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Successfully deleted!")
		})
	}
}

const orgNotification = (req, res) => {
	console.log("xxxxxxxx-->>", req.body)
	if (!req.query.userId)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
	else {
		userServices.findUser({ _id: req.query.userId }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else {
				let set = {
					organizerNotification: req.body.organizerNotification
				}
				userServices.updateUser({ _id: req.query.userId }, set, { new: true }, (err, success) => {
					if (err)
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
					else
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.NOTIFICATION, success)
				})
			}
		})
	}
}

const updateDeviceToken = (req, res) => {
	if (!req.query.userId || !req.query.deviceToken)
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ);
	else {
		User.findByIdAndUpdate(req.query.userId, { $set: { deviceToken: req.query.deviceToken } }, { new: true }, (err, success) => {
			if (err)
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			else if (!success)
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			else {
				console.log(success)
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Device-Token updated successfully")
			}

		})
	}

}



//----------------------------------------------------------------ADMIN APIS----------------------------------------------------------------------------



//Add users

const addUser = (req, res) => {

	var email = req.body.email;
	var password = req.body.password;
	var hash = bcrypt.hashSync(password);
	var name = req.body.name;
	var mobileNumber = req.body.mobileNumber;
	var sportsName = req.body.sportsName;
	var state = req.body.state;
	var city = req.body.city;
	var addressLine1 = req.body.addressLine1;
	var addressLine2 = req.body.addressLine2;
	var zipcode = req.body.zipcode;
	var package = req.body.package;
	var status = req.body.status;

	var userData = new User({
		email: email,
		password: hash,
		name: name,
		mobileNumber: mobileNumber,
		sportsName: sportsName,
		address: req.body.address,
		package: package,
		status: status

	})
	User.findOne({ 'email': email } && { 'mobileNumber': mobileNumber }, (err, result1) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (result1) {
			return Response.sendResponse(res, responseCode.BAD_REQUEST, "Email or mobile number already exists.");
		}
		else {
			userData.save((err, result) => {
				if (err) {
					return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
				}
				else if (!result) {
					return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
				}
				else {
					//console.log('@@@@@@@@@@@@@@@',result);
					var obj = {
						_id: result._id,
						email: result.email,
						name: result.name,
						mobileNumber: result.mobileNumber,
						sportsName: result.sportsName,
						address: result.address,
						zipcode: result.zipcode,
						package: result.package,
						status: result.status
					}
					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "User added successfully !!!", obj);
				}
			})
		}

	})
}

//block user

const createBlockUser = (req, res) => {
	var status = req.body.status;
	var _id = req.body._id;

	User.findByIdAndUpdate({ _id: _id }, { $set: { status: status } }, (err, result) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!result) {
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "User Blocked !!!!");
		}
	})

}

//View User Details by Admin
const viewUser = (req, res) => {
	var _id = req.body._id;

	User.findById({ _id: _id }, (err, result) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!result) {
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "User Details !!!!", result);
		}
	})
}

//Edit user details by admin

const editUser = (req, res) => {

	var name = req.body.name;
	var sportsName = req.body.sportsName;
	//var mobileNumber=req.body.mobileNumber;
	// var state = req.body.state;
	// var city = req.body.city;
	var address = req.body.address;
	// var addressLine1 = req.body.addressLine1;
	// var addressLine2 = req.body.addressLine2;
	// var zipcode = req.body.zipcode;
	var package = req.body.package;
	var status = req.body.status;
	var _id = req.body._id;
	User.findById({ _id: _id }, (err, result) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!result) {
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
		}
		else {
			User.findByIdAndUpdate({ _id: _id }, {
				$set: {
					name: name,
					sportsName: sportsName,
					address:address ,
					package: package,
					status: status

				}
			}, (err, result) => {
				if (err) {
					return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
				}
				else if (!result) {
					return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
				}
				else {
					return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, " Users profile Updated successfully !!!!")
				}
			})
		}
	})
}

//search users

const userSearch = (req, res) => {
	let query = {
		$or:[{email:{$regex: new RegExp(req.body.search, "ig")}},{mobileNumber:{$regex: new RegExp(req.body.search, "ig")}}]
	}
	
	var options = {
		page: req.body.page || 1,
		limit: req.body.limit || 10,
		sort: { createdAt: -1 }
	}
	User.paginate(query, options, (err, success) => {
		//console.log('@@@@@@@@@',success)
		if (err)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR);
		else if (!success.docs.length)
			return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.EMPLOYEE_NOT_FOUND);
		else
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.LIST_OF_EMPLOYEE, success)
	})
}


//delete User by admin

const deleteUser = (req, res)=>{
	var _id = req.body._id;

	User.findByIdAndRemove({_id:_id},(err, result)=>{
		if(err){
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err) 
		}
		else if(!result){
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
		}
		else{
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, " User deleted parmanently !!!!!");
		}
		
	})
}

//About us Page 

const aboutUs = (req, res)=>{
 
var text = " Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum";

res.send({text:text});

}


const sendLink = (req, res) => {
	if (req.body.email)
		req.body.email = req.body.email.toLowerCase();
	User.findOne({
		email: req.body.email
	}, (error, result) => {
		if (error)
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		else if (!result)
			return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
		else {
			var token = jwt.sign({ _id: result._id, email: result.email, password: result.password }, config.secret_key);

			message.sendMail(req.body.email, "Your reset password link", `Here is link to reset the password....Click here !!! :- ${req["headers"]["origin"]}/admin/reset-password/${token}`, (err1, res1) => {
				if (err1)
					return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.EMAIL_NOT_EXISTS)
				else {
					Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Reset link sent successfully to registered emailId")
					User.findByIdAndUpdate(result._id, { $set: { verifyToken: token } }, { new: true }, (error, success) => {
						if (error)
							console.log("error in updating document");
						else {
							console.log("Document updated successfully.")
						}

					})
				}
			})
		}
	})
}


const authenticateUser = (req, res) => {
	if (!req.params._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		User.findOne({ _id: req.params._id }, (err, success) => {
			if (err) {
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
			}
			else if (!success) {
				return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_NOT_EXISTS)
			}
			else {
				return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "valid user");
			}
		})
	}
}
const resetPassword = (req, res) => {
	if (!req.params._id) {
		return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
	}
	else {
		var query = {
			_id: req.params._id
		}
		userServices.findUser(query, (err, result) => {
			if (err) {
				return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
			}
			else if (!result) {
				return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
			}
			else {

				let salt = bcrypt.genSaltSync(10);
				req.body.newPassword = bcrypt.hashSync(req.body.newPassword, salt)
				console.log("cdcfhfvf=----->", req.body.newPassword)
				var options = {
					new: true
				}
				let set = {
					password: req.body.newPassword
				}
				userServices.updateUser(query, set, options, (err, success) => {
					if (err) {
						return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR)
					}
					else if (!success) {
						return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
					}
					else {
						return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.PASSWORD_UPDATE);
					}
				})


			}
		})
	}
}


const userList = (req, res) => {
	let query={
		status:"ACTIVE"
	}
	if(req.body.search){
		let search = new RegExp("^" + req.body.search)
		query.$or = [
			{ firstName: { $regex: search, $options: 'i' } },
			{ lastName: { $regex: search, $options: 'i' } },
			{ email: { $regex: search, $options: 'i' } },
			{ mobileNumber: { $regex: search, $options: 'i' } },
			{ status: { $regex: search, $options: 'i' } },
			{ gender: { $regex: search, $options: 'i' } },
			{ role: { $regex: search, $options: 'i' } },
			{ organizerType: { $regex: search, $options: 'i' } }
		]
	}
	let option={
		page:req.body.page||1,
		limit:req.body.limit||10,
		sort:{createdAt:-1},
		select:{password:0}
	}
	User.paginate(query,option,(err,success)=>{
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR,err)
		}
		else if (!success) {
			return Response.sendResponse(res, responseCode.NO_DATA_FOUND, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK,"list of users",success);
		}
	})
}

const activeUser = (req, res) => {
	let option = {
		page: req.params.pageNumber || 1,
		limit: 20,
		sort: { createdAt: -1 },
		select: { password: 0 },

	}

	User.paginate({ status: "ACTIVE" }, option, (err, result) => {

		
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!result) {
			return Response.sendResponse(res, responseCode.NO_DATA_FOUND, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Active User Lists", result);
		}
	})

}


const blockUser = (req, res) => {
	let option = {
		page: req.params.pageNumber || 1,
		limit: 20,
		sort: { createdAt: -1 },
		select: { password: 0 },

	}

	User.paginate({ status: "INACTIVE" }, option, (err, result) => {

		
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!result) {
			return Response.sendResponse(res, responseCode.NO_DATA_FOUND, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Block User Lists", result);
		}
	})

}

const countUserActive = (req, res) => {
	User.count({ status: "ACTIVE" }, (err, success) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!success) {
			return Response.sendResponse(res, responseCode.NO_DATA_FOUND, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Number of Active Users", success);
		}
	})
}

const countUserInActive = (req, res) => {
	User.count({ status: "INACTIVE" }, (err, success) => {
		if (err) {
			return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
		}
		else if (!success) {
			return Response.sendResponse(res, responseCode.NO_DATA_FOUND, responseMsg.USER_NOT_EXISTS)
		}
		else {
			return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Number of InActive Users", success);
		}
	})
}
module.exports = {
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
	getCard,
	paymentOrder,
	addEmployee,
	getListOfEmployee,
	deleteEmployee,
	searchUser,
	setRoleForEmployee,
	getRoleForEmployee,

	changeAutoRenew,
	changeCardforAutoRenew,
	controlNotification,
	getControlNotification,
	getnotificationList,
	deleteNotification,
	orgNotification,

	updateDeviceToken,
	sendLink,
	resetPassword,
	authenticateUser,
	userList,
	countUserActive,
	countUserInActive,
	blockUser,
	activeUser,
	addUser,
	createBlockUser,
	viewUser,
	editUser,
	deleteUser,
	userSearch,
	aboutUs
}







