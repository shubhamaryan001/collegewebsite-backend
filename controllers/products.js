const Product = require("../models/product");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");



exports.getProducts = async (req, res) => {
    // get current page from req.query or use default value of 1
    const currentPage = req.query.page || 1;
    // return 3 products per page
    const perPage = 6;
    let totalItems;

    const products = await Product.find()
        // countDocuments() gives you total count of products
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Product.find()
                .skip((currentPage - 1) * perPage)
                .populate("productedBy", "_id name email about ")
                .select("_id name description category price created")
                .limit(perPage)
                .sort({ created: -1 });
        })
        .then(products => {
            res.status(200).json(products);
        })
        .catch(err => console.log(err));
};


exports.createProduct = (req, res, next) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
      if (err) {
          return res.status(400).json({
              error: "Image could not be uploaded"
          });
      }
      let product = new Product(fields);

      req.profile.hashed_password = undefined;
      req.profile.salt = undefined;
      product.productedBy = req.profile;

      if (files.photo) {
          product.photo.data = fs.readFileSync(files.photo.path);
          product.photo.contentType = files.photo.type;
      }
      product.save((err, result) => {
          if (err) {
              return res.status(400).json({
                  error: err
              });
          }
          res.json(result);
      });
  });
};

exports.photo = (req, res, next) => {   
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
};

exports.singleProduct = (req, res) => {
    return res.json(req.product);
};

exports.productsByUser = (req, res) => {
    Product.find({ productedBy: req.profile._id })
        .populate("productedBy", "_id name")
        .select("_id name description category quantity price created")
        .sort("_created")
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(products);
        });
};


exports.isProducter = (req, res, next) => {
    let sameUser =
        req.product && req.auth && req.product.productedBy._id == req.auth._id;
    let adminUser = req.product && req.auth && req.auth.role === "admin";

    console.log("req.product ", req.product, " req.auth ", req.auth);
    console.log("SAMEUSER: ", sameUser, " ADMINUSER: ", adminUser);

    let isProducter = sameUser || adminUser;

    if (!isProducter) {
        return res.status(403).json({
            error: "User is not authorized"
        });
    }
    next();
};


exports.updateProduct = (req, res, next) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded"
            });
        }
        // save product
        let product = req.product;
        product = _.extend(product, fields);
        product.updated = Date.now();

        if (files.photo) {
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json(product);
        });
    });
};

exports.deleteProduct = (req, res) => {
    let product = req.product;
    product.remove((err, product) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({
            message: "product deleted successfully"
        });
    });
};

exports.productById = (req, res, next, id) => {
  Product.findById(id)
  .populate("productedBy", "_id name email about ")
  .select("_id name description category quantity price photo created")
      .exec((err, product) => {
          if (err || !product) {
              return res.status(400).json({
                  error: err
              });
          }
          req.product = product;
          next();
      });
};