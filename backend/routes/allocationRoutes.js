import express from 'express';
import allocationController from '../controllers/allocationController.js';

const router = express.Router();

router.get('/', allocationController.getAll);
router.post('/', allocationController.create);
router.put('/:id', allocationController.update);
router.delete('/:id', allocationController.remove);

export default router;
