import express from 'express';
import goalController from '../controllers/goalController.js';

const router = express.Router();

router.get('/', goalController.getAll);
router.post('/', goalController.create);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.remove);

export default router;
