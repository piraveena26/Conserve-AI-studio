import express from 'express';
import departmentController from '../controllers/departmentController.js';

const router = express.Router();

router.get('/', departmentController.getAll);
router.post('/', departmentController.create);
router.put('/:id', departmentController.update);
router.delete('/:id', departmentController.remove);

export default router;
