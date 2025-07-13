const express = require ('express')
const slugify = require ('slugify')
const router = express.Router() 
const Product = require ('../models/ProductModel');
const Category = require ('../models/CategoryModel');
const Variation = require ('../models/VariationModel')
const VariationOption = require ('../models/VariationOptionModel')
const ProductItem = require ('../models/ProductItemModel')
const ProductConfiguration = require('../models/ProductConfigurationModel')
const cloudinary = require("../../config/cloudinary");
const productController = require('../controllers/productController');
//getting all
router.get('/',async (req,res)=>{
    try{
        const products = await Product.find()
        res.json (products)
    }catch (err){
        res.status(500).json ({message:err.message})
    }
})
//create one
router.post('/', async (req,res)=>{
    const product = new Product({
        _id: req.body._id,
        name: req.body.name,
        description: req.body.description,
        main_image:req.body.main_image,
        category: req.body.category
    })
    try{
        const newProduct = await product.save()
        //201: successfully create new object
        res.status(201).json(newProduct)
    }catch (err){
        res.status(400).json({message:err.message})
    }
})
//update one
router.patch('/:id',getProduct,async (req,res)=>{
    if (req.body.name != null){
        res.product.name = req.body.name
    }
     if (req.body.name != null){
        res.product.price = req.body.price
    }
     if (req.body.name != null){
        res.product.description = req.body.description
    }
     if (req.body.name != null){
        res.product.type = req.body.type
    }
     if (req.body.name != null){
        res.product.brand = req.body.brand
    }
    try {
        const updatedProduct = await res.product.save()
        res.json(updatedProduct)
    }catch (err){
        res.status(400).json({message: err.message})

    }
})

//delete one 
router.delete('/:id',getProduct,async (req,res)=>{
    try {
        await res.product.deleteOne()
        res.json({message:'deleted product'})
    }catch(err){
        res.status(500).json({message:err.message})
    }
})
async function getProduct (req,res, next){
    try{
        product = await Product.findById(req.params.id)
        if (product == null){
            return res.status(404).json({message:'Cannot find product'})
        }
    } catch (err){
        return res.status(500).json ({message: err.message})
    }

    res.product = product
    next()
}
router.post("/upload", async (req, res) => {
  try {
    const { file } = req.body; // base64 image
    const result = await cloudinary.uploader.upload(file, {
      folder: "products",
    });

    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});
router.post("/categories", async (req, res) => {
    const { name } = req.body;

    if ( !name) {
        return res.status(400).json({ 
            success: false, 
            message: "Name  là bắt buộc." 
        });
    }

    try {
        const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });
        const existingCategoryById = await Category.findOne({category_id:slug});
        if (existingCategoryById) {
            return res.status(409).json({ 
                success: false, 
                message: `Ngành hàng với ID '${slug}' đã tồn tại.`
            });
        }
    
        const newCategory = new Category({
            category_id: slug,
            name: name 
        });

        const savedCategory = await newCategory.save();

        res.status(201).json({
            success: true,
            message: "Tạo ngành hàng thành công!",
            category: savedCategory
        });

    } catch (error) {
        console.error("Lỗi khi tạo ngành hàng:", error);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ nội bộ. Vui lòng thử lại.",
            error: error.message
        });
    }
});

router.post("/variation", async (req, res) => {
    const { name, category_id } = req.body;
    try {
        const categoryExists = await Category.findOne({category_id:category_id});
        if (!categoryExists) {
            return res.status(404).json({ message: `Không tìm thấy ngành hàng với ID: ${category_id}` });
        }

        const variation_id = slugify(name, { lower: true, strict: true, locale: 'vi' });

        const newVariation = new Variation({
            variation_id:variation_id,
            name: name,
            category_id: category_id
        });

        const savedVariation = await newVariation.save();
        res.status(201).json(savedVariation);

    } catch (error) {   
        console.error("Lỗi khi tạo variation:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
    }
});
router.post("/variation-option", async (req, res) => {
    const { value, variation_id } = req.body;
    try {
        const variationExists = await Variation.findOne({variation_id: variation_id});
        if (!variationExists) {
            return res.status(404).json({ message: `Không tìm thấy ngành hàng với ID: ${variation_id}` });
        }

        const variation_option_id = slugify(value, { lower: true, strict: true, locale: 'vi' });

        const newVariationOption = new VariationOption({
            variation_option_id:variation_option_id,
            value: value,
            variation_id: variation_id
        });

        const savedVariationOption = await newVariationOption.save();
        res.status(201).json(savedVariationOption);

    } catch (error) {
        console.error("Lỗi khi tạo variation:", error);
        res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
    }
});
router.post("/product-configuration", async (req, res) => {
  const { product_item_id, variation_option_id } = req.body;

  try {
    const newConfig = new ProductConfiguration({ product_item_id, variation_option_id });
    const savedConfig = await newConfig.save();
    res.status(201).json(savedConfig);
  } catch (error) {
    console.error("Lỗi khi tạo ProductConfiguration:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
});
// POST /api/product-items
router.post('/product-items', async (req, res) => {
  try {
    const {
      name,
      product_id,
      qty_in_stock,
      product_image,
      price
    } = req.body;
    const SKU = slugify(`${name}`, { lower: true, strict: true, locale: 'vi' });
    const existingItem = await ProductItem.findOne({ SKU });
    if (existingItem) {
      return res.status(400).json({ message: 'SKU đã tồn tại.' });
    }

    const newProductItem = new ProductItem({
      name,
      product_id,
      SKU,
      qty_in_stock,
      product_image,
      price
    });

    const savedItem = await newProductItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Lỗi khi tạo ProductItem:', error);
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});
router.get('/:id', productController.getProductDetailsById);

module.exports = router

