var express = require('express');
var router = express.Router();
var { getCustomers, getCustomer, editCustomers, createCustomer, deleteCustomer, getCustomerQuotes} = require('../../controllers/clientsController');
const {serializeBigInt} = require("../../middleware/serializeBigInt");

router.use(serializeBigInt);

/* GET users listing. */
router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', editCustomers);
router.delete('/:id', deleteCustomer);
router.get('/:id/quotes', getCustomerQuotes);


module.exports = router;
