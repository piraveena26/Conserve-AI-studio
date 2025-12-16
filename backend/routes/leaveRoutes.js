import express from 'express';
import leaveController from '../controllers/leaveController.js';

const router = express.Router();

router.get('/', leaveController.getAll);
router.post('/', leaveController.create);
router.put('/:id', leaveController.update);
router.patch('/:id/status', leaveController.updateStatus);
router.delete('/:id', leaveController.remove);

export default router;
