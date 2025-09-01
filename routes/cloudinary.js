const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Route to get signed upload parameters for Cloudinary
router.get('/cloudinary-signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const stringToSign = `timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    res.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    console.error('Cloudinary signature error:', err);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

module.exports = router;
