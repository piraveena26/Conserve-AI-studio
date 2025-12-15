import express from 'express';
import metricController from '../controllers/metricController.js';

const router = express.Router();

router.get('/', metricController.getAll);
router.post('/', metricController.create);
router.put('/:id', metricController.update);
router.delete('/:id', metricController.remove);

export default router;
