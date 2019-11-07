const express = require("express");
const {
 
  createProduct,  
  productById,
  productsByUser,
  getProducts,
  photo,
  singleProduct,
  isProducter,
  updateProduct,
  deleteProduct
 
} = require("../controllers/products");

const { requireSignin } = require("../controllers/auth");
const { userById } = require("../controllers/user");


const router = express.Router();



router.get("/products", getProducts);


router.post(
  "/product/new/:userId",
  requireSignin,
  createProduct
);


router.get("/products/by/:userId", requireSignin, productsByUser);

router.get("/product/:productId", singleProduct);

router.put("/product/:productId", requireSignin, isProducter, updateProduct);
router.delete("/product/:productId", requireSignin, isProducter, deleteProduct);

router.get("/product/photo/:productId", photo);


router.param("userId", userById);

router.param("productId", productById);




module.exports = router;
