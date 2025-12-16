import express from 'express';
import holidayController from '../controllers/holidayController.js';

const router = express.Router();

router.get('/', holidayController.getAll);
router.post('/', holidayController.create);
router.put('/:id', holidayController.update);
router.delete('/:id', holidayController.remove);

export default router;
