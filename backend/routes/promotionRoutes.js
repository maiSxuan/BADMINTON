const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.use(authenticate, authorizeRole("ADMIN"));

router.route('/')
    .post(promotionController.createPromotion)
    .get(promotionController.getAllPromotions);

router.route('/:id')
    .get(promotionController.getPromotionById)
    .put(promotionController.updatePromotion)
    .delete(promotionController.deletePromotion)
    .patch(promotionController.togglePromotion);

router.patch('/:promotionId/codes/add', promotionController.addCodesToPromotion);
router.patch('/:promotionId/codes/remove', promotionController.removeCodesFromPromotion);
router.patch('/:promotionId/products/add-and-apply-code', promotionController.addProductToPromotion);
router.patch('/:promotionId/products/remove-product', promotionController.removeProductFromPromotion);



module.exports = router;
