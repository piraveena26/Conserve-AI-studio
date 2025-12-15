import express from 'express';
import shiftController from '../controllers/shiftController.js';

const router = express.Router();

router.get('/', shiftController.getAll);
router.post('/', shiftController.create);
router.put('/:id', shiftController.update);
router.delete('/:id', shiftController.remove);

export default router;
