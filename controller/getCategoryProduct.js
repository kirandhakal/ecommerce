const productModel = require("../models/productModel");

const getCategoryProduct = async (req, res) => {
  try {
    // Get all products at once (more efficient than multiple queries)
    const allProducts = await productModel.find({
      subcategory: { $exists: true, $ne: "" }
    }).select('_id productName productImage category subcategory price selling_price').lean();

    // Organize by category and subcategory
    const categoryMap = new Map();

    allProducts.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, new Map());
      }
      
      const subcategoryMap = categoryMap.get(product.category);
      if (!subcategoryMap.has(product.subcategory)) {
        subcategoryMap.set(product.subcategory, product);
      }
    });

    // Convert the map to the required array format
    const productByCategory = [];
    categoryMap.forEach((subcategories, category) => {
      subcategories.forEach((product, subcategory) => {
        productByCategory.push(product);
      });
    });

    res.json({
      message: "Subcategory-wise products fetched",
      data: productByCategory,
      success: true,
      error: false
    });

  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false
    });
  }
};

module.exports = getCategoryProduct;