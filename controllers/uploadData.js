
const { response } = require('express');

const xlsx = require('node-xlsx').default;

const firebase = require('../database/config');


const updateInventory = (req, res = response) => {
    
    const excelFile = xlsx.parse(req.file.buffer);

    let categoriesNames = getCategoriesNames(excelFile);

    let allProducts = getAllProducts(excelFile);

    try {
        uploadToDatabase(
            categoriesNames, 
            allProducts, 
            req.body.restaurantName
        );
        
    } catch (err) {
        return res.status(400).json({
            ok: false,
            error: err
        });
    }

    res.status(201).json({
        ok: true,
    });
}


const getCategoriesNames = (file) => {

    let categoriesDuplicates = [];

    file[0].data.slice(1).forEach((value) => {
        if(value.length > 0){
            categoriesDuplicates.push(value[1].trim());
        }
    });

    let categoriesNames = [...new Set(categoriesDuplicates)];

    return categoriesNames
}


const getAllProducts = (file) => {

    let allProducts = [];

    file[0].data.slice(1).forEach((value) => {
        if(value.length > 0){
            
            let convertProductName = 
                value[0].replace(new RegExp('/', 'g'), '-');

            allProducts.push({
                productName: convertProductName.trim(),
                measure: value[2].trim(),
                unitPrice: value[3],
                categoryName: value[1]
            });
        }
    });

    return allProducts;
}


const uploadToDatabase = async (
    newCategoriesNames, newAllProducts, restaurantName
) => {

    await cleanInventoryDatabase(restaurantName);

        
    for(const categoryName of newCategoriesNames){

        //SET CATEGORY NAME IN DATABASE
        firebase.firestore()
            .collection(restaurantName)
            .doc(categoryName)
            .set({ check: true });
        
        let productsFromCategory = newAllProducts.filter(
            product => product.categoryName === categoryName
        );

        //SET PRODUCTS INSIDE OF CATEGORY
        for(const product of productsFromCategory){
            
            await firebase.firestore()
                .collection(restaurantName)
                .doc(categoryName)
                .collection('products')
                .doc(product.productName)
                .set({
                    check: true,
                    current: 0,
                    measure: product.measure,
                    stock: 10,
                    unitPrice: product.unitPrice
                });
        }
    }
}


const cleanInventoryDatabase = async (restaurantName) => {
    
    const inventory = await firebase.firestore()
        .collection(restaurantName)
        .get();
    
    for(const category of inventory.docs){
        
        const products = await category.ref.
            collection('products')
            .get();
        
        for(const product of products.docs){
            await product.ref.delete();
        }

        await category.ref.delete();
    }
}

module.exports = {
    updateInventory
}