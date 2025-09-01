const Payment = require('../models/Payment');
const Order = require('../models/Order');
const crypto = require('crypto');

// eSewa Configuration
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  successUrl: process.env.ESEWA_SUCCESS_URL || 'http://localhost:3000/payment/success',
  failureUrl: process.env.ESEWA_FAILURE_URL || 'http://localhost:3000/payment/failure',
  paymentUrl: process.env.ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
};

// Generate HMAC signature
const generateSignature = (message, secretKey) => {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
};

// Create payment hash
const createPaymentHash = (totalAmount, transactionUuid, productCode) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return generateSignature(message, ESEWA_CONFIG.secretKey);
};

// Generate transaction UUID
const generateTransactionUuid = () => {
  return crypto.randomBytes(16).toString('hex');
};

async function initiateEsewaPayment(req, res) {
  try {
    const userId = req.userId;
    const { orderId, totalAmount } = req.body;

    // Validate order
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or unauthorized'
      });
    }

    // Generate transaction UUID
    const transactionUuid = generateTransactionUuid();

    // Create payment record
    const payment = new Payment({
      orderId,
      userId,
      transactionUuid,
      totalAmount,
      status: 'pending'
    });
    await payment.save();

    // Generate signature
    const signature = createPaymentHash(
      totalAmount,
      transactionUuid,
      ESEWA_CONFIG.merchantId
    );

    // Prepare eSewa payment data
    const paymentData = {
      amount: totalAmount,
      failure_url: ESEWA_CONFIG.failureUrl,
      product_delivery_charge: 0,
      product_service_charge: 0,
      product_code: ESEWA_CONFIG.merchantId,
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: ESEWA_CONFIG.successUrl,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid
    };

    res.json({
      success: true,
      paymentData,
      paymentUrl: ESEWA_CONFIG.paymentUrl,
      message: 'Payment initiation successful'
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: error.message
    });
  }
}

module.exports = initiateEsewaPayment;