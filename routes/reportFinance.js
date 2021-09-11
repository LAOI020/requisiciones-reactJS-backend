//HOST + /api/finance

const { Router } = require('express');
const router = Router();
const { getReportRequisiciones } = require('../controllers/reportFinance');
const { checkEmail } = require('../middlewares/fieldsValidator');


router.post(
    '/send-report',
    [
        checkEmail
    ],
    getReportRequisiciones
);


module.exports = router;