import express from 'express';
import employeeController from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', employeeController.getAll);
router.post('/', employeeController.create);
router.put('/:id', employeeController.update);
router.delete('/:id', employeeController.remove);

export default router;
