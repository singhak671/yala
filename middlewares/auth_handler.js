const jwt = require('jsonwebtoken');
const config = require("../config/config");
const Response = require("../global_functions/response_handler")
const Validator = require('../middlewares/validation').validate_all_request;
const responseCode = require('../helper/httpResponseCode')
const responseMsg = require('../helper/httpResponseMessage')
const User=require("../models/user")
const auth = { 
   verifyToken: (req, res, next)=>{
        console.log("header>>>>>>>"+req.body+"  token is >>>>>>"+req.headers.token)           
        if(req.headers.token){
            console.log("secret key is "+config.secret_key)
            jwt.verify(req.headers.token, config.secret_key, (err,result)=>{
                
                if(err || !result)
                {
                    console.log("token not verified--->>",err)
                    return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.AUTH_FAIL)
                }    
                else{
                    console.log("token verified")
                    
                    if(req.headers.userid){
                        User.findById(req.headers.userid,(error, result)=>{
                            console.log("result of user "+ JSON.stringify(result))
                            if(error)
                               return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                            else if(!result){
                                console.log("User not found")
                                return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
                            }
                            else{                                
                                    next();                              
                             
                            }                        
                        })
                    }
                    else
                        return Response.sendResponse(res, responseCode.BAD_REQUEST,`Please provide "userid" in headers!`);
                    // else if(req.query._id){
                    //     User.findOne({_id:req.query._id},(error, result)=>{
                    //         console.log("result of user "+ JSON.stringify(result))
                    //         if(error)
                    //            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                    //         else if(!result){
                    //             console.log("User not found")
                    //             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
                    //         }
                    //         else{
                    //             console.log(result.jwt)
                    //             if(result.jwt==req.headers.token){
                    //                 next();
                    //             }
                    //           else{
                    //               return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.INVALID_TOKEN)
                    //           }
                    //         }                        
                    //     })
                    // }
                    // else{
                    //     User.findOne({_id:req.body._id},(error, result)=>{
                    //         console.log("result of user "+ JSON.stringify(result))
                    //         if(error)
                    //            return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR,responseMsg.INTERNAL_SERVER_ERROR)
                    //         else if(!result){
                    //             console.log("User not found")
                    //             return Response.sendResponse(res,responseCode.NOT_FOUND,responseMsg.USER_NOT_EXISTS)
                    //         }
                    //         else{
                    //             console.log("result.jwt",result.jwt)
                    //             if(result.jwt==req.headers.token){
                    //                 next();
                    //             }
                    //           else{
                    //               return Response.sendResponse(res,responseCode.UNAUTHORIZED,responseMsg.INVALID_TOKEN)
                    //           }
                    //         }                        
                    //     })
                    // }
                   
                }
            })
        }else {
           return  Response.sendResponse(res,responseCode.FORBIDDEN,responseMsg.FORBIDDEN)
        }

    }
};

module.exports = auth;