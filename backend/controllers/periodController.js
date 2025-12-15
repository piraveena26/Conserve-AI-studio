import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS periods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL
      );
    `);
        console.log('Periods table checked/created successfully');
    } catch (err) {
        console.error('Error creating periods table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, 
                   TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, 
                   TO_CHAR(end_date, 'YYYY-MM-DD') as end_date 
            FROM periods 
            ORDER BY start_date DESC
        `);
        const periods = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date
        }));
        res.json(periods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body;
        const result = await db.query(
            "INSERT INTO periods (name, start_date, end_date) VALUES ($1, $2, $3) RETURNING id, name, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date",
            [name, startDate, endDate]
        );
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate } = req.body;
        const result = await db.query(
            "UPDATE periods SET name = $1, start_date = $2, end_date = $3 WHERE id = $4 RETURNING id, name, TO_CHAR(start_date, 'YYYY-MM-DD') as start_date, TO_CHAR(end_date, 'YYYY-MM-DD') as end_date",
            [name, startDate, endDate, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Period not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM periods WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Period not found' });
        }
        res.json({ message: 'Period deleted', id });
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
