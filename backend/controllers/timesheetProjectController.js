import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS timesheet_projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                client VARCHAR(255),
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                estimated_time VARCHAR(100),
                status VARCHAR(50) NOT NULL,
                description TEXT,
                assigned_to TEXT
            )
        `);
        console.log('Timesheet Projects table checked/created successfully');
    } catch (err) {
        console.error('Error creating timesheet_projects table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM timesheet_projects ORDER BY id DESC');

        const projects = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            client: row.client,
            startDate: row.start_date,
            endDate: row.end_date,
            estimatedTime: row.estimated_time,
            status: row.status,
            description: row.description,
            assignedTo: row.assigned_to ? JSON.parse(row.assigned_to) : []
        }));

        res.json(projects);
    } catch (err) {
        console.error('Error fetching timesheet projects:', err);
        res.status(500).json({ error: 'Failed to fetch timesheet projects' });
    }
};

const create = async (req, res) => {
    try {
        const { name, client, startDate, endDate, estimatedTime, status, description, assignedTo } = req.body;

        if (!name || !startDate || !endDate || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const assignedToJson = JSON.stringify(assignedTo || []);

        const result = await db.query(
            `INSERT INTO timesheet_projects (name, client, start_date, end_date, estimated_time, status, description, assigned_to)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [name, client || '', startDate, endDate, estimatedTime || '', status, description || '', assignedToJson]
        );

        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            name: row.name,
            client: row.client,
            startDate: row.start_date,
            endDate: row.end_date,
            estimatedTime: row.estimated_time,
            status: row.status,
            description: row.description,
            assignedTo: JSON.parse(row.assigned_to)
        });
    } catch (err) {
        console.error('Error creating timesheet project:', err);
        res.status(500).json({ error: 'Failed to create timesheet project' });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, client, startDate, endDate, estimatedTime, status, description, assignedTo } = req.body;

        if (!name || !startDate || !endDate || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const assignedToJson = JSON.stringify(assignedTo || []);

        const result = await db.query(
            `UPDATE timesheet_projects
             SET name = $1, client = $2, start_date = $3, end_date = $4, estimated_time = $5, status = $6, description = $7, assigned_to = $8
             WHERE id = $9 RETURNING *`,
            [name, client || '', startDate, endDate, estimatedTime || '', status, description || '', assignedToJson, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            client: row.client,
            startDate: row.start_date,
            endDate: row.end_date,
            estimatedTime: row.estimated_time,
            status: row.status,
            description: row.description,
            assignedTo: JSON.parse(row.assigned_to)
        });
    } catch (err) {
        console.error('Error updating timesheet project:', err);
        res.status(500).json({ error: 'Failed to update timesheet project' });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM timesheet_projects WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully', id });
    } catch (err) {
        console.error('Error deleting timesheet project:', err);
        res.status(500).json({ error: 'Failed to delete timesheet project' });
    }
};

export default {
    createTable,
    getAll,
    create,
    update,
    remove
};
