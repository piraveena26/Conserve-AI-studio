import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_time VARCHAR(50) NOT NULL,
        end_time VARCHAR(50) NOT NULL
      );
    `);
        console.log('Shifts table checked/created successfully');
    } catch (err) {
        console.error('Error creating shifts table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM shifts ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body;
        // Map frontend camelCase to backend snake_case
        const result = await db.query(
            'INSERT INTO shifts (name, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
            [name, startTime, endTime]
        );
        // Map back to camelCase for frontend consistency
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            name: row.name,
            startTime: row.start_time,
            endTime: row.end_time
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startTime, endTime } = req.body;
        const result = await db.query(
            'UPDATE shifts SET name = $1, start_time = $2, end_time = $3 WHERE id = $4 RETURNING *',
            [name, startTime, endTime, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            startTime: row.start_time,
            endTime: row.end_time
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM shifts WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shift not found' });
        }
        res.json({ message: 'Shift deleted', id });
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
