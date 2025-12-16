import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        date DATE NOT NULL
      );
    `);
        console.log('Holidays table checked/created successfully');
    } catch (err) {
        console.error('Error creating holidays table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM holidays ORDER BY date ASC');
        const holidays = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            type: row.type,
            date: row.date
        }));
        res.json(holidays);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { title, type, date } = req.body;
        const result = await db.query(
            'INSERT INTO holidays (title, type, date) VALUES ($1, $2, $3) RETURNING *',
            [title, type, date]
        );
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            title: row.title,
            type: row.type,
            date: row.date
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, date } = req.body;
        const result = await db.query(
            'UPDATE holidays SET title = $1, type = $2, date = $3 WHERE id = $4 RETURNING *',
            [title, type, date, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        const row = result.rows[0];
        res.json({
            id: row.id,
            title: row.title,
            type: row.type,
            date: row.date
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM holidays WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        res.json({ message: 'Holiday deleted', id });
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
