import express from 'express';
import financialConfigController from '../controllers/financialConfigController.js';

const router = express.Router();

router.get('/tax-settings', financialConfigController.getTaxSettings);
router.post('/tax-settings', financialConfigController.createTaxSetting);
router.put('/tax-settings/:id', financialConfigController.updateTaxSetting);
router.delete('/tax-settings/:id', financialConfigController.deleteTaxSetting);

export default router;
