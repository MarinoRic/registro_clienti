var express = require('express');
var router = express.Router();
var { getQuotes, getQuote, deleteQuote, createQuote, updateQuote} = require('../../controllers/quotesController');
const {serializeBigInt} = require("../../middleware/serializeBigInt");

router.use(serializeBigInt);

/* GET users listing. */
router.post('/', createQuote);
router.get('/', getQuotes);
router.get('/:id', getQuote);
router.put('/:id', updateQuote);
router.delete('/:id', deleteQuote);

module.exports = router;
