import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS work_allocations (
                id SERIAL PRIMARY KEY,
                employee_id VARCHAR(50) NOT NULL,
                employee_name VARCHAR(100) NOT NULL,
                badge_id VARCHAR(50),
                project_id VARCHAR(50) NOT NULL,
                project_name VARCHAR(100) NOT NULL,
                reporting_to_id VARCHAR(50) NOT NULL,
                reporting_to_name VARCHAR(100) NOT NULL,
                billability VARCHAR(50),
                billing_role VARCHAR(100),
                attendance VARCHAR(50),
                date DATE NOT NULL,
                department VARCHAR(100)
            );
        `);
        console.log('Work Allocations table checked/created successfully');
    } catch (err) {
        console.error('Error creating work_allocations table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM work_allocations ORDER BY date DESC, id DESC');
        const allocations = result.rows.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            badgeId: row.badge_id,
            projectId: row.project_id,
            projectName: row.project_name,
            reportingToId: row.reporting_to_id,
            reportingToName: row.reporting_to_name,
            billability: row.billability,
            billingRole: row.billing_role,
            attendance: row.attendance,
            date: row.date,
            department: row.department
        }));
        res.json(allocations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const {
            employeeId, employeeName, badgeId,
            projectId, projectName,
            reportingToId, reportingToName,
            billability, billingRole,
            attendance, date, department
        } = req.body;

        const result = await db.query(
            `INSERT INTO work_allocations (
                employee_id, employee_name, badge_id,
                project_id, project_name,
                reporting_to_id, reporting_to_name,
                billability, billing_role,
                attendance, date, department
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                employeeId, employeeName, badgeId,
                projectId, projectName,
                reportingToId, reportingToName,
                billability, billingRole,
                attendance, date, department
            ]
        );

        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            badgeId: row.badge_id,
            projectId: row.project_id,
            projectName: row.project_name,
            reportingToId: row.reporting_to_id,
            reportingToName: row.reporting_to_name,
            billability: row.billability,
            billingRole: row.billing_role,
            attendance: row.attendance,
            date: row.date,
            department: row.department
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            employeeId, employeeName, badgeId,
            projectId, projectName,
            reportingToId, reportingToName,
            billability, billingRole,
            attendance, date, department
        } = req.body;

        const result = await db.query(
            `UPDATE work_allocations SET 
                employee_id = $1, employee_name = $2, badge_id = $3,
                project_id = $4, project_name = $5,
                reporting_to_id = $6, reporting_to_name = $7,
                billability = $8, billing_role = $9,
                attendance = $10, date = $11, department = $12
             WHERE id = $13 RETURNING *`,
            [
                employeeId, employeeName, badgeId,
                projectId, projectName,
                reportingToId, reportingToName,
                billability, billingRole,
                attendance, date, department,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Allocation not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            badgeId: row.badge_id,
            projectId: row.project_id,
            projectName: row.project_name,
            reportingToId: row.reporting_to_id,
            reportingToName: row.reporting_to_name,
            billability: row.billability,
            billingRole: row.billing_role,
            attendance: row.attendance,
            date: row.date,
            department: row.department
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM work_allocations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Allocation not found' });
        }
        res.json({ message: 'Allocation deleted', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    createTable,
    getAll,
    create,
    update,
    remove
};
