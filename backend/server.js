import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import departmentController from './controllers/departmentController.js';
import designationController from './controllers/designationController.js';
import jobRoleController from './controllers/jobRoleController.js';
import shiftController from './controllers/shiftController.js';
import employeeController from './controllers/employeeController.js';
import periodController from './controllers/periodController.js';
import metricController from './controllers/metricController.js';
import goalController from './controllers/goalController.js';
import financialConfigController from './controllers/financialConfigController.js';
import timesheetProjectController from './controllers/timesheetProjectController.js';
import departmentRoutes from './routes/departmentRoutes.js';
import designationRoutes from './routes/designationRoutes.js';
import jobRoleRoutes from './routes/jobRoleRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import periodRoutes from './routes/periodRoutes.js';
import metricRoutes from './routes/metricRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import financialConfigRoutes from './routes/financialConfigRoutes.js';
import timesheetProjectRoutes from './routes/timesheetProjectRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Tables
const initDB = async () => {
    await departmentController.createTable();
    await designationController.createTable();
    await jobRoleController.createTable();
    await shiftController.createTable();
    await employeeController.createTable();
    await periodController.createTable();
    await metricController.createTable();
    await goalController.createTable();
    await financialConfigController.createTaxSettingsTable();
    await timesheetProjectController.createTable();
};
initDB();

// Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/job-roles', jobRoleRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/financial-config', financialConfigRoutes);
app.use('/api/timesheet-projects', timesheetProjectRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
