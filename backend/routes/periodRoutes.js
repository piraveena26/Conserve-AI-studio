import express from 'express';
import periodController from '../controllers/periodController.js';

const router = express.Router();

router.get('/', periodController.getAll);
router.post('/', periodController.create);
router.put('/:id', periodController.update);
router.delete('/:id', periodController.remove);

export default router;
