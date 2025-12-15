import express from 'express';
import jobRoleController from '../controllers/jobRoleController.js';

const router = express.Router();

router.get('/', jobRoleController.getAll);
router.post('/', jobRoleController.create);
router.put('/:id', jobRoleController.update);
router.delete('/:id', jobRoleController.remove);

export default router;
