import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS job_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        designation_id INTEGER REFERENCES designations(id) ON DELETE SET NULL
      );
    `);
        console.log('Job Roles table checked/created successfully');
    } catch (err) {
        console.error('Error creating job_roles table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        // storage and backend use 'position' to refer to designation name often in frontend code
        // We join to get the designation name as 'position'
        const query = `
            SELECT j.id, j.name, j.designation_id, d.name as position 
            FROM job_roles j 
            LEFT JOIN designations d ON j.designation_id = d.id 
            ORDER BY j.id ASC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, designation_id } = req.body;
        const result = await db.query(
            'INSERT INTO job_roles (name, designation_id) VALUES ($1, $2) RETURNING *',
            [name, designation_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, designation_id } = req.body;
        const result = await db.query(
            'UPDATE job_roles SET name = $1, designation_id = $2 WHERE id = $3 RETURNING *',
            [name, designation_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job Role not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM job_roles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Job Role not found' });
        }
        res.json({ message: 'Job Role deleted', id });
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
