import express from 'express';
import designationController from '../controllers/designationController.js';

const router = express.Router();

router.get('/', designationController.getAll);
router.post('/', designationController.create);
router.put('/:id', designationController.update);
router.delete('/:id', designationController.remove);

export default router;
