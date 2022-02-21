const {Product} = require("./../models/product");

async function searchProducts(req, res) {
  const { category, direction = "desc", sortBy = "_id", name="" } = req.query;

  const searchObj = {};

  if (category) searchObj.category = category;
  searchObj.name = { $regex: name, $options: "i" }

  const products = await Product.find(searchObj).sort({ [sortBy]: direction });

  res.send(products);
}

async function getProductCategories(req, res) {
  try {
    const categories = await Product.find().select("category").distinct("category");
    res.send(categories);
  } catch (error) {
    console.log(error.message);
  }
}

async function getProductById(req, res) {
    let product = await Product.findById(req.params.id);

    if(!product) {
        res.status(404).send(`Product with id ${req.params.id} not found`);
        return;
    }

    res.send(product);
}

async function saveProduct(req, res) {
    const requestBody = req.body;

    const product = new Product(requestBody)
    try {
        const savedProduct = await product.save();
        return res.status(200).send(savedProduct); 
    }  catch(error) {
        return res.status(400).send({message: error.message});
    }
}

async function updateProductDetails(req, res) {
    let product = await Product.findById(req.params.id);

    if(!product) {
        res.status(404).send({message:`Product with id ${req.params.id} not found`});
        return;
    }

    const requestBody = req.body;
    
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, requestBody);
        res.status(200).send(updatedProduct); 
    }  catch(error) {
        return res.status(400).send({message:error.message});
    }
}

async function deleteProduct(req, res) {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product) {
            res.status(404).send({message:`Product with id ${req.params.mentorId} not found`});
            return;
        }

        res.send(product);   
    } catch(error) {
        return res.send({message:error.message});
    }
}

module.exports = {
  searchProducts,
  getProductCategories,
  getProductById,
  saveProduct,
  updateProductDetails,
  deleteProduct
};

// pd, dd
// 24th March, 3rd April
// 21st March, 27th March
// 22nd March, 29th March
