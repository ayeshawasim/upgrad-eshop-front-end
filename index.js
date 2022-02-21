const express = require("express");
const { createOrder } = require("./controllers/order");
const { addAddress, getAddresses } = require("./controllers/address");
const {
  saveProduct,
  searchProducts,
  getProductCategories,
  getProductById,
  updateProductDetails,
  deleteProduct
} = require("./controllers/product");
const router = express.Router();
const { signUp, signIn } = require("./controllers/auth");
const admin = require("./middleware/admin");
const auth = require("./middleware/auth");

//Auth
router.post("/api/users", signUp);
router.post("/api/auth", signIn);

//Address
router.post("/api/addresses", auth, addAddress);
router.get("/api/addresses", auth, getAddresses);

//Product
router.post("/api/products", [auth, admin], saveProduct);
router.get("/api/products", searchProducts);
router.get("/api/products/categories", getProductCategories);
router.get("/api/products/:id", getProductById);
router.put("/api/products/:id",[auth,admin],updateProductDetails);
router.delete("/api/products/:id",[auth,admin],deleteProduct);

//Order
router.post("/api/orders", auth, createOrder);

module.exports = router;
