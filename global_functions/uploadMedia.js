const config = require("../config/config");
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: "dx0bubdw5",
    api_key: "761784382131527",
    api_secret: "gefMzeMXN-fLZXianHRr1Qglc4s"
});


module.exports = {

//function to upload image
uploadImg:(base64,callback)=>{

cloudinary.v2.uploader.upload(base64 ,(err,result1)=>{
    if(result1.secure_url){
 callback(null,result1.secure_url)       
}
else{
    callback(true,null);
}
})
}
}