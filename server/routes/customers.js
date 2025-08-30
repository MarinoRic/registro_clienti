var express = require('express');
var router = express.Router();
var { getCustomers, getCustomer, editCustomers, createCustomer, deleteCustomer, getCustomerQuotes} = require('../controllers/clientsController');
const {serializeBigInt} = require("../middleware/serializeBigInt");
const {downloadQuotePdf, sendQuoteEmail} = require("../controllers/quotesController");
const auth = require("../middleware/auth");

router.use(serializeBigInt);

/* GET users listing. */
router.post('/', auth, createCustomer);
router.get('/', auth, getCustomers);
router.get('/:id', auth, getCustomer);
router.put('/:id', auth, editCustomers);
router.delete('/:id', auth, deleteCustomer);
router.get('/:id/quotes', auth, getCustomerQuotes);
router.post('/api/quotes/:id/send-email', auth, sendQuoteEmail);
router.get('/api/quotes/:id/pdf', auth, downloadQuotePdf);



module.exports = router;
