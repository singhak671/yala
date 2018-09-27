const router=require("express").Router();
const productController = require('../webservices/controllers/product');
const AUTH=require('../middlewares/auth_handler')
router.post('/addProduct',AUTH.verifyToken,productController.addProduct)
router.post('/getListOfProduct',AUTH.verifyToken,productController.getListOfProduct)
router.get('/getProductDetail',AUTH.verifyToken,productController.getProductDetail)
router.post('/editProductDetail',AUTH.verifyToken,productController.editProductDetail)
router.get('/selectProductType',AUTH.verifyToken,productController.selectProductType)
router.post('/configureProductType',AUTH.verifyToken,productController.configureProductType)
router.get('/deleteProduct',AUTH.verifyToken,productController.deleteProduct)
router.post('/showProductList',AUTH.verifyToken,productController.showProductList)
router.post('/buyProduct',productController.buyProduct)
router.post('/getQuantity',productController.getQuantity)
router.post('/productHistory',productController.productHistory)
router.post('/editProductHistory',productController.editProductHistory)
module.exports=router;