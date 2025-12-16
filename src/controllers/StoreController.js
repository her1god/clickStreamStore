const ProductModel = require('../models/ProductModel');

const LogIngestionService = require('../services/LogIngestionService');

exports.logEvent = async (req, res) => {
    const { event, productId, data } = req.body;
    try {
        await req.logEvent(event, { productId, ...data });
        res.status(200).json({ success: true });
    } catch (e) {
        console.error("Log Error:", e);
        res.status(500).json({ success: false });
    }
};

exports.getHome = async (req, res) => {
    try {
        // Log Visit
        await req.logEvent('VIEW_HOME');
        
        const products = await ProductModel.getAll();
        
        // Log View Home
        // req.logEvent('VIEW_HOME'); // This line is replaced by the above await req.logEvent('VIEW_HOME');

        res.render('pages/home', { 
            title: 'Azure Clickstream Store', 
            products,
            user: req.session.sessionId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

exports.getProductDetail = async (req, res) => {
    try {
        const productId = req.params.id;
        constproduct = await ProductModel.getById(productId); // Typo fixed in next line if needed? No, variable name spacing.
        const product = await ProductModel.getById(productId);

        if (!product) return res.status(404).send("Product not found");

        // Log View Product
        req.logEvent('VIEW_PRODUCT', { productId: product.id });

        res.render('pages/product', { 
            title: product.name, 
            product 
        });
    } catch (err) {
         console.error(err);
         res.status(500).send("Server Error");
    }
};
