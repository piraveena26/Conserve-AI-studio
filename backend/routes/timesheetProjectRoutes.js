import express from 'express';
import timesheetProjectController from '../controllers/timesheetProjectController.js';

const router = express.Router();

router.get('/', timesheetProjectController.getAll);
router.post('/', timesheetProjectController.create);
router.put('/:id', timesheetProjectController.update);
router.delete('/:id', timesheetProjectController.remove);

export default router;
