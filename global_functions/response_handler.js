module.exports={
    sendResponse:(responseObj,responseCode,responseMessage,data,paginationData)=> {    
        if(paginationData){
            if(paginationData && responseMessage == 'List of available routes.'){
                return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,routeList:data,pagination:paginationData});
            }
            else{
            return responseObj.send({'responseCode':responseCode,'responseMessage':responseMessage,result:data,pagination:paginationData});
        }
    }
    else{
    if(responseMessage == 'List of available routes.'){
        return responseObj.send({responseCode:responseCode,responseMessage:responseMessage,routeList:data})  
    }
    else{
        return responseObj.send({responseCode:responseCode,responseMessage:responseMessage,result:data}) 
    }     
} 
    },
   
}