var express = require('express');
var router = express.Router();
var { getQuotes, getQuote, deleteQuote, createQuote, updateQuote, updateQuoteStatus, downloadQuotePdf} = require('../../controllers/quotesController');
const {serializeBigInt} = require("../../middleware/serializeBigInt");

router.use(serializeBigInt);

/* GET users listing. */
router.post('/', createQuote);
router.get('/', getQuotes);
router.get('/:id', getQuote);
router.put('/:id', updateQuote);
router.delete('/:id', deleteQuote);
router.put('/:id/status', updateQuoteStatus);
router.get('/:id/pdf', downloadQuotePdf);

module.exports = router;
