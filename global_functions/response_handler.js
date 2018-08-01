module.exports={
    sendResponse:(responseObj,responseCode,responseMessage,data,token,paginationData)=> {    
        if(paginationData){
            if(paginationData && responseMessage == 'Success.'){
                return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,routeList:data,pagination:paginationData});
            }
            else{
            return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,result:data,pagination:paginationData});
        }
    }
     if(token){
        if(responseMessage=="Successfully Logged In")
        return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,result:data,token:token});
        else if(responseMessage=="Otp successfully Verified.")
        return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,result:data,token:token});
        else
        return responseObj.send({responseCode:responseCode,responseMessage:responseMessage,result:data})
    }
    else{
    if(responseMessage == 'Success.'){
        return responseObj.send({responseCode:responseCode,responseMessage:responseMessage,result:data,token:token})  
    }
    else{
        return responseObj.send({responseCode:responseCode,responseMessage:responseMessage,result:data}) 
    }     
  } 
    },
   
} 