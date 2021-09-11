
const { response } = require('express');

const firebase = require('../database/config');

const excel = require('excel4node');

const nodemailer = require('nodemailer');


const getReportRequisiciones = async (req, res = response) => {
    
    let workBook = new excel.Workbook();
    
    const cedisRequisiciones = await firebase.firestore()
        .collection('cedis')
        .get();
    
    if(cedisRequisiciones){
        res.status(201).json({
            ok: true
        });
    } else {
        res.status(400).json({
            ok: false
        });
    }

    for(const requisicion of cedisRequisiciones.docs){
        
        if(requisicion.data().completedDate){

            let workSheet = workBook.addWorksheet(requisicion.id);
            
            sheetHeaders(workSheet, requisicion);
    
            let allProducts = await getAllProducts(requisicion);
    
            setProductsInSheet(workSheet, allProducts);
        }
    }

    const workBookBuffer = await workBook.writeToBuffer();

    sendEmail(workBookBuffer, req.body.destinationEmail);
}


const sheetHeaders = (workSheet, requisicion) => {

    workSheet.cell(2, 1).string('Se pidio');
    workSheet.cell(2, 2).string(requisicion.data().requestedDate);
    
    workSheet.cell(3, 1).string('Se completo');
    workSheet.cell(3, 2).string(requisicion.data().completedDate);
    
    workSheet.cell(4, 1).string('Dinero total');
    workSheet.cell(4, 2).number(requisicion.data().totalMoney);
    
    workSheet.cell(5, 1).string('Dinero total cancelado');
    workSheet.cell(5, 2).number(requisicion.data().totalMoneyCanceled);


    workSheet.cell(9, 1).string('NOMBRE');
    workSheet.cell(9, 2).string('GRUPO');
    workSheet.cell(9, 3).string('MEDIDA');
    workSheet.cell(9, 4).string('PRECIO UNITARIO');
    workSheet.cell(9, 5).string('STOCK');
    workSheet.cell(9, 6).string('CANTIDAD SOLICITADA');
    workSheet.cell(9, 7).string('CANTIDAD FALTANTE');
    workSheet.cell(9, 8).string('COMPLETADO');
    workSheet.cell(9, 9).string('CANCELADO');
    workSheet.cell(9, 10).string('INCOMPLETO');
};


const getAllProducts = async (requisicion) => {

    let allProducts = [];

    const categories = await requisicion.ref
        .collection('details')
        .get();
    
    for(const category of categories.docs){
        
        const productsCategory = await category.ref
            .collection('products')
            .get();

        for(const product of productsCategory.docs){
            allProducts.push({
                name: product.id,
                category: category.id,
                ...product.data()
            });
        }
    }

    return allProducts;
}


const setProductsInSheet = (workSheet, allProducts) => {
    
    let rowIndex = 10;

    for(const product of allProducts){

        workSheet.cell(rowIndex, 1).string(product.name);
        workSheet.cell(rowIndex, 2).string(product.category);
        workSheet.cell(rowIndex, 3).string(product.measure);
        workSheet.cell(rowIndex, 4).number(product.unitPrice);
        workSheet.cell(rowIndex, 5).number(product.stock);
        workSheet.cell(rowIndex, 6).number(product.requestedAmount);
        workSheet.cell(rowIndex, 7).number(product.missingAmount);
        workSheet.cell(rowIndex, 8).string(
            product.completed ? 'si' : 'no'
        );
        workSheet.cell(rowIndex, 9).string(
            product.canceled ? 'si' : 'no'
        );
        workSheet.cell(rowIndex, 10).string(
            product.missing ? 'si' : 'no'
        );

        rowIndex = rowIndex + 1;
    }
}


const sendEmail = (workBookBuffer, destinationEmail) => {

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const optionsEmail = {
        from: process.env.EMAIL_USER,
        to: destinationEmail,
        subject: 'detalles de pedidos',
        text: 'reporte de pedidos',
        attachments: [
            { filename: 'reporte.xlsx', content: workBookBuffer }
        ]
    };

    transport.sendMail(optionsEmail, function(err, info){
        if(err){
            console.log(err);
        } else {
            console.log('mensaje enviado');
        }
    });
}


module.exports = {
    getReportRequisiciones
}