
const { response } = require('express');


const checkToken = (req, res = response, next) => {

    if(req.headers.token != '010219'){
        return res.status(400).json({
            ok: false,
            error: 'token no valido'
        });
    }

    if(!req.body.restaurantName){
        return res.status(400).json({
            ok: false,
            error: 'el nombre del restaurant es obligatorio'
        });
    }

    next();
};


const checkFile = (req, res = response, next) => {

    const fileExtension = 
        req.file.originalname.substring(
            req.file.originalname.length - 4
        );
    
    if(fileExtension != 'xlsx'){
        return res.status(400).json({
            ok: false,
            error: 'archivo invalido, debe ser un archivo xlsx'
        });
    }

    next();
};


const checkEmail = (req, res = response, next) => {
    
    if(!req.body.destinationEmail){
        return res.status(400).json({
            ok: false,
            error: 'el email de destino es requerido'
        });
    }

    next();
}


module.exports = {
    checkToken, checkFile, checkEmail
}