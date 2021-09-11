//HOST + /api/upload-data

const { Router } = require('express');
const router = Router();

const multer = require('multer');
const upload = multer();

const { updateInventory } = require('../controllers/uploadData');
const { checkToken, checkFile } = require('../middlewares/fieldsValidator');



router.post(
    '/inventory',
    upload.single('fileExcel'),
    [
        checkToken,
        checkFile
    ],
    updateInventory
);


module.exports = router;