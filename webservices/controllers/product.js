const Response = require("../../global_functions/response_handler")
const message = require("../../global_functions/message");
const Twocheckout = require('2checkout-node');
const TransactionSchema = require("../../models/transactions");
const Validator = require('../../middlewares/validation').validate_all_request;
const responseCode = require('../../helper/httpResponseCode')
const responseMsg = require('../../helper/httpResponseMessage')
const productServices = require('../services/product');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const userServices = require('../services/userApis');
const subscriptionValidator = require('../../middlewares/validation').validate_subscription_plan;
//Organizer Product Apis
//-------Add Product-----------
const addProduct = (req, res) => {
    let obj = {};
    obj.userId = req.query.organizerId
    subscriptionValidator(obj, ["Product"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            console.log(req.body)
            if (!req.query.organizerId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
            else if (!req.body.productImage)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product image is required")
            else {
                userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizerId = success.employeerId
                        else
                            req.body.organizerId = req.query.organizerId
                        if (req.body.competitionDetail)
                            req.body.typeOfProduct = "COMPETITION"
                        if (req.body.membershipDetail)
                            req.body.typeOfProduct = "MEMBERSHIP"
                        message.uploadImg(req.body.productImage, (err, result) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error while uploading Product", err)
                            else if (!result)
                                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Error while uploading Image")
                            else {
                                console.log(result)
                                req.body.productImage = {
                                    public_id: result.public_id,
                                    url: result.secure_url
                                }
                                console.log("req.body---->>", req.body)
                                productServices.addProduct(req.body, (err, success) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                    else if (!success)
                                        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Error while Adding Product", err)
                                    else
                                        return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Product added successfully", success)
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}
//------Get List of Product with filter and Pagination(Organizer)
const getListOfProduct = (req, res) => {
    console.log("aaaaaaaaaaaaaa", req.body)
    let obj = {};
    obj.userId = req.query.organizerId
    subscriptionValidator(obj, ["Product"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            console.log("aaaaa")
            if (!req.query.organizerId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
            else {
                userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizerId = success.employeerId
                        else
                            req.body.organizerId = req.query.organizerId
                        let query = {
                            organizerId: req.body.organizerId,
                            visibleStatus: "ACTIVE"
                        }
                        if (req.body.productType) {
                            query["productType.productType"] = req.body.productType
                        }
                        console.log("query", query)
                        let options = {
                            page: req.body.page || 1,
                            limit: req.body.limit || 4,
                            sort: { createdAt: -1 }
                        }
                        productServices.getListOfProduct(query, options, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of products", success)
                        })
                    }
                })
            }
        }
    })
}
//-------Get Product Detail-------
const getProductDetail = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else if (!req.query.productId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product Id is required")
    else {
        let query = {
            _id: req.query.productId
        }
        productServices.findProduct(query, "", (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product Not Found")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Product detail", success)
        })
    }
}
// --------------Edit product detail-------------
const editProductDetail = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.productId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product id is required")
    else if (!req.body.productImage)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product Image is required")
    else {
        productServices.findProduct({ _id: req.query.productId }, {}, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Product not found")
            else {
                message.editUploadedFile(req.body.productImage, success.productImage.public_id, (err, result) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, "Error while updating product Image", err)
                    else {
                        req.body.productImage = {
                            public_id: result.public_id,
                            url: result.secure_url
                        }
                        console.log("req.body---->>>", req.body)
                        productServices.editProductDetail({ _id: req.query.productId }, req.body, { new: true }, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (!success)
                                return Response.sendResponse(res, responseCode.NOT_MODIFIED, responseMsg.NOT_MODIFIED)
                            else
                                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Product detail updated successfully.", success)
                        })
                    }
                })
            }
        })
    }
}
//-------Select Product Type-----------
const selectProductType = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else {
        let query = {
            $or: [{ organizerId: null }, { organizerId: req.query.organizerId }]
        }
        productServices.selectProductType(query, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Product not found")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of product Type", success)
        })
    }
}
//-------Configure Product Type------
const configureProductType = (req, res) => {
    let obj = {}
    obj.userId = req.query.organizerId
    subscriptionValidator(obj, ["Product"], (err, flag) => {
        if (flag[0] !== 200)
            return Response.sendResponse(res, flag[0], flag[1], flag[2]);
        else {
            if (!req.query.organizerId)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
            else {
                userServices.findUser({ _id: req.query.organizerId }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
                    else {
                        if (success.employeeRole == 'COORDINATOR' || success.employeeRole == "ADMINSTRATOR")
                            req.body.organizerId = success.employeerId
                        else
                            req.body.organizerId = req.query.organizerId
                        productServices.findConfigureProduct({ productType: req.body.productType, $or: [{ organizerId: req.body.organizerId }, { organizerId: null }] }, (err, success) => {
                            if (err)
                                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                            else if (success)
                                return Response.sendResponse(res, responseCode.ALREADY_EXIST, "Product with this name already exists")
                            else {
                                productServices.configureProductType(req.body, (err, success) => {
                                    if (err)
                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                                    else
                                        return Response.sendResponse(res, responseCode.NEW_RESOURCE_CREATED, "Product Type added successfully.")
                                })
                            }
                        })
                    }
                })
            }
        }
    })
}
//----------Delete Product--------
const deleteProduct = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.productId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product is required")
    else {
        productServices.findProduct({ _id: req.query.productId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Product not found")
            else {
                let set = {
                    visibleStatus: "INACTIVE"
                }
                productServices.deleteProduct({ _id: req.query.productId }, set, { new: true }, (err, success) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else
                        return Response.sendResponse(res, responseCode.RESOURCE_DELETED, "Product deleted successfully")
                })
            }
        })
    }
}
//Player Product Apis
const showProductList = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else {
        let query = {
            organizerId: req.query.organizerId,
            visibleStatus: "ACTIVE"
        }
        if (req.query.competitionId)
            query["competitionDetail._id"] = req.query.competitionId
        if (req.query.membershipId)
            query["membershipDetail._id"] = req.query.membershipId
        if (req.body.productType)
            query["productType.productType"] = req.body.productType
        console.log(query)
        let option = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { createdAt: -1 }
        }
        productServices.getListOfProduct(query, option, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "List of products", success)
        })
    }
}
//Get Quantitity
const getQuantity = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else if (!req.query.productId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product Id is required")
    else {
        let query = {
            _id: req.query.productId,
            "price_size_qunatity.size": req.body.size
        }
        console.log(query)
        productServices.findProduct(query, { 'price_size_qunatity.$._id': 1 }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, "Product is out of stock")
            else {
                if (success.price_size_qunatity[0].quantity == 0)
                    return Response.sendResponse(res, responseCode.UNAUTHORIZED, "Product is out of stock")
                else
                    return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, responseMsg.SUCCESSFULLY_DONE, success)
            }
        })
    }
}
//Buy a Product
const buyProduct = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else if (!req.query.productId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "Product id is required")
    else {
        userServices.findUser({ _id: req.query.userId }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_FOUND, responseMsg.USER_NOT_EXISTS)
            else {
                productServices.findProduct({ _id: req.query.productId, "price_size_qunatity.size": req.body.size }, { organizerId: 1, productType: 1, 'price_size_qunatity.$._id': 1 }, (err, success1) => {
                    if (err)
                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
                    else if (!success1)
                        return Response.sendResponse(res, responseCode.NOT_FOUND, "Product not found")
                    else {
                        console.log("succcesss--->>", success1)
                        if (success1.price_size_qunatity[0].quantity <= 0)
                            return Response.sendResponse(res, responseCode.NOT_SUCCESS, "Product is out of stock")
                        else {
                            if (!req.body.data || !req.body.data.response || !req.body.data.response.token)
                                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Payment failed");
                            var tco = new Twocheckout({
                                sellerId: "901386003",         // Seller ID, required for all non Admin API bindings 
                                privateKey: "CA54E803-AC54-41C3-8677-A36DE6C276A4",     // Payment API private key, required for checkout.authorize binding
                                sandbox: true                          // Uses 2Checkout sandbox URL for all bindings
                            });
                            var params = {
                                "merchantOrderId": "123",
                                "token": req.body.data.response.token.token,
                                "currency": "USD",
                                "total": req.body.price,
                                "billingAddr": {
                                    "name": "Testing Tester",
                                    "addrLine1": "123 Test St",
                                    "city": "Columbus",
                                    "state": "Ohio",
                                    "zipCode": "43123",
                                    "country": "USA",
                                    "email": "example@2co.com",
                                    "mobileNumber": "5555555555"
                                }
                            };
                            tco.checkout.authorize(params, function (error, data) {
                                console.log("i am data and error", data, error);
                                if (error || !data) {
                                    return Response.sendResponse(res, responseCode.BAD_REQUEST, "UNAUTHORIZED", err);
                                } else {
                                    if (data.response.responseCode == "APPROVED" && data.response.orderNumber && !data.response.errors) {
                                        console.log("data---->>", data)
                                        let set = {
                                            type: "PRODUCT",
                                            paymentMethod: "Card",
                                            productId: req.query.productId,
                                            productType: {
                                                size: success1.price_size_qunatity[0].size,
                                                quantity: 1,
                                                price: success1.price_size_qunatity[0].price
                                            },
                                            organizerId: success1.organizerId,
                                            playerId: req.query.userId,
                                            paymentDetails: data
                                        }
                                        TransactionSchema.organizerTransaction.create(set, (err3, success3) => {
                                            if (err3 || !success3)
                                                return Response.sendResponse(res, responseCode.BAD_REQUEST, "Transaction history not saved");
                                            else {
                                                let set = {
                                                    "price_size_qunatity.$.quantity": success1.price_size_qunatity[0].quantity - 1
                                                }
                                                let query = {
                                                    "price_size_qunatity._id": success1.price_size_qunatity[0]._id
                                                }
                                                productServices.editProductDetail(query, set, { new: true }, (err, success) => {
                                                    if (err)
                                                        return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err);
                                                    else if (!success)
                                                        return Response.sendResponse(res, responseCode.NOT_MODIFIED);
                                                    else {
                                                        return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Payment done successfully ", success)
                                                    }
                                                })
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        })
    }
}
//Product History
const productHistory = (req, res) => {
    if (!req.query.userId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.USER_IS_REQ)
    else {
        let query = {
            organizerId: req.query.userId,
            type: "PRODUCT"
        }
        let option = {
            page: req.body.page || 1,
            limit: req.body.limit || 4,
            sort: { createdAt: -1 },
            populate: [{ path: "productId", model: "product", select: { "price_size_qunatity": 0, visibleStatus: 0, } }, { path: "playerId", model: "user", select: { firstName: 1, lastName: 1, email: 1, mobileNumber: 1, countryCode: 1 } },
            { path: "organizerId", model: "user", select: { firstName: 1, lastName: 1, email: 1, mobileNumber: 1, countryCode: 1 } }
            ]
        }
        TransactionSchema.organizerTransaction.paginate(query, option, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.BAD_REQUEST, "No product history available")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Product History-->>>", success)
        })
    }
}
//Edit Product History
const editProductHistory = (req, res) => {
    if (!req.query.organizerId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, responseMsg.ORG_IS_REQ)
    else if (!req.query.productHistoryId)
        return Response.sendResponse(res, responseCode.BAD_REQUEST, "HistoryId is required")
    else {
        TransactionSchema.organizerTransaction.findOneAndUpdate({ _id: req.query.productHistoryId, organizerId: req.query.organizerId }, { $set: { productStatus: req.body.productStatus } }, { new: true }, (err, success) => {
            if (err)
                return Response.sendResponse(res, responseCode.INTERNAL_SERVER_ERROR, responseMsg.INTERNAL_SERVER_ERROR, err)
            else if (!success)
                return Response.sendResponse(res, responseCode.NOT_MODIFIED, "Error while updating")
            else
                return Response.sendResponse(res, responseCode.EVERYTHING_IS_OK, "Product status updated successfully")
        })
    }
}
module.exports = {
    addProduct,
    getListOfProduct,
    getProductDetail,
    editProductDetail,
    selectProductType,
    configureProductType,
    deleteProduct,
    showProductList,
    getQuantity,
    buyProduct,
    productHistory,
    editProductHistory
}