const express = require('express')
const router = express.Router()

const userSignUpController = require('../controller/userSignUp')
const userSignInController = require('../controller/userSignIn')
const authToken = require('../middleware/authToken')
const userDetailsController = require('../controller/userDetails')
const userLogout = require('../controller/userLogout')
const allUsers = require('../controller/allUsers')
const pendingSellers = require('../controller/pendingSellers')
const AddProductController = require('../controller/addProduct')
const getProductController = require('../controller/getProduct')
const updateProductController = require('../controller/updateProduct')
const getCategoryProduct = require('../controller/getCategoryProduct')
const getCategoryWiseProduct = require('../controller/getCategoryWiseProduct')
const getProductDetails = require('../controller/getProductDetails')
const addToCart = require('../controller/addToCart')
const countAddToCartProduct = require('../controller/countAddToCart')
const addToCartProductView = require('../controller/addToCartProductView')
const removeFromCart = require('../controller/removeFromCart')
const updateCartProduct = require('../controller/updateCartProduct')
const clearCart = require('../controller/clearCart')
const searchProduct = require('../controller/searchProduct')
const sellerSignUpController = require('../controller/sellerSignup')
const sellerStatus = require('../controller/sellerStatus')
const cloudinaryRoute = require('./cloudinary');
const {
  getNotifications,
  getNotificationCount,
  markAllAsRead,
  markNotificationAsRead
} = require('../controller/notificationController');


// Import new controllers for orders and payments
const createOrder = require('../controller/createOrder')
const getUserOrders = require('../controller/getUserOrders')
const initiateEsewaPayment = require('../controller/initiateEsewaPayment')
const verifyEsewaPayment = require('../controller/verifyEsewaPayment')
const { createReview, getProductReviews } = require('../controller/reviewController')
const checkSellerStatus = require('../middleware/checkSellerStatus')
const notifySeller = require('../controller/notifySeller')
const stockUpdate = require('../controller/stockUpdate')
const { myOrders, completeOrder } = require('../controller/seeOrders');

// User authentication routes
router.post('/signup', userSignUpController)
router.post('/sellersignup/:id', sellerSignUpController)
router.post('/signin', userSignInController)
router.get('/user-details', authToken, userDetailsController)
router.get('/userLogout', userLogout)

// Admin panel routes
router.get("/all-users", authToken, allUsers)
router.get("/pending-sellers", authToken, pendingSellers)
router.put("/update-status", authToken, sellerStatus)

// Product routes
router.post("/add-product", authToken,checkSellerStatus, AddProductController)
router.get("/get-product", getProductController)
router.post("/update-product", authToken, updateProductController)
router.get("/get-CategoryProduct", getCategoryProduct)
router.post("/product-by-category", getCategoryWiseProduct)
router.get("/productdetails/:id", getProductDetails)

// Cart routes
router.post("/addtocart", authToken, addToCart)
router.get("/view-add-to-cart-product", authToken, addToCartProductView)
router.post("/countaddtocartproduct", authToken, countAddToCartProduct)
router.post("/remove-from-cart", authToken, removeFromCart)
router.post("/update-cart-product", authToken, updateCartProduct)
router.delete("/cart/clear",  authToken, clearCart)

// Order routes
router.post("/order/create", authToken, createOrder)
router.get("/order/user-orders", authToken, getUserOrders)
router.get('/order/myorders', authToken, myOrders);
router.put('/order/completeorder/:orderId', authToken, completeOrder);

// Payment routes (eSewa)
router.post("/payment/esewa/initiate", authToken, initiateEsewaPayment)
router.get("/payment/esewa/verify", authToken, verifyEsewaPayment);

// Search route
router.get("/search", searchProduct)

// notification routes 
router.get('/notifications/list', authToken, getNotifications);
router.get('/notifications/count', authToken, getNotificationCount);
router.put('/notifications/mark-all-read', authToken, markAllAsRead);
router.put('/notifications/mark-read/:id', authToken, markNotificationAsRead);
router.post('/notifyseller', authToken, notifySeller)
router.post('/updateproductstock', authToken, stockUpdate)


//review routes
router.post('/writereview', authToken, createReview);
router.get('/viewreview/:productId', getProductReviews);

//cloudinary
router.use(cloudinaryRoute);

module.exports = router;