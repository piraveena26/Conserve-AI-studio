import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS designations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(255)
      );
    `);
        console.log('Designations table checked/created successfully');
    } catch (err) {
        console.error('Error creating designations table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM designations ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, department } = req.body;
        const result = await db.query(
            'INSERT INTO designations (name, department) VALUES ($1, $2) RETURNING *',
            [name, department]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department } = req.body;
        const result = await db.query(
            'UPDATE designations SET name = $1, department = $2 WHERE id = $3 RETURNING *',
            [name, department, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Designation not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM designations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Designation not found' });
        }
        res.json({ message: 'Designation deleted', id });
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
