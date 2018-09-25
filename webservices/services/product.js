const Product = require("../../models/product")

const addProduct = (bodyData, callback) => {
    Product.product.create(bodyData, (err, result) => {
        callback(err, result)
    })
}
const getListOfProduct = (bodyData, option, callback) => {
    Product.product.paginate(bodyData, option, (err, result) => {
        callback(err, result)
    })
}
const findProduct = (bodyData,set,callback) => {
    Product.product.findOne(bodyData,set,(err, result) => {
        callback(err, result)
    })
}
const editProductDetail=(select,bodyData,option,callback)=>{
     Product.product.findOneAndUpdate(select,bodyData,option,(err,result)=>{
         callback(err,result)
     })
}
const selectProductType=(bodyData,callback)=>{
    Product.configureProduct.find(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const configureProductType=(bodyData,callback)=>{
    Product.configureProduct.create(bodyData,(err,result)=>{
        callback(err,result)
    })
}
const deleteProduct=(bodyData,set,option,callback)=>{
    Product.product.findOneAndUpdate(bodyData,set,option,(err,result)=>{
        callback(err,result)
    })
}

const findConfigureProduct=(bodyData,callback)=>{
    Product.configureProduct.findOne(bodyData,(err,result)=>{
        callback(err,result)
    })
}
module.exports = {
    "addProduct": addProduct,
    "getListOfProduct": getListOfProduct,
    "findProduct": findProduct,
    "editProductDetail":editProductDetail,
    "selectProductType":selectProductType,
    "configureProductType":configureProductType,
    "deleteProduct":deleteProduct,
    "findConfigureProduct":findConfigureProduct
}