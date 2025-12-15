import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS metrics (
        id SERIAL PRIMARY KEY,
        metric_type VARCHAR(255) NOT NULL,
        metric VARCHAR(255) NOT NULL,
        definition_5_star INTEGER,
        definition_4_star INTEGER,
        definition_3_star INTEGER,
        definition_2_star INTEGER,
        definition_1_star INTEGER
      );
    `);
        console.log('Metrics table checked/created successfully');
    } catch (err) {
        console.error('Error creating metrics table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM metrics ORDER BY id DESC');
        const metrics = result.rows.map(row => ({
            id: row.id,
            metricType: row.metric_type,
            metric: row.metric,
            definition5star: row.definition_5_star,
            definition4star: row.definition_4_star,
            definition3star: row.definition_3_star,
            definition2star: row.definition_2_star,
            definition1star: row.definition_1_star
        }));
        res.json(metrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { metricType, metric, definition5star, definition4star, definition3star, definition2star, definition1star } = req.body;
        const result = await db.query(
            `INSERT INTO metrics (metric_type, metric, definition_5_star, definition_4_star, definition_3_star, definition_2_star, definition_1_star) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [metricType, metric, definition5star, definition4star, definition3star, definition2star, definition1star]
        );
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            metricType: row.metric_type,
            metric: row.metric,
            definition5star: row.definition_5_star,
            definition4star: row.definition_4_star,
            definition3star: row.definition_3_star,
            definition2star: row.definition_2_star,
            definition1star: row.definition_1_star
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { metricType, metric, definition5star, definition4star, definition3star, definition2star, definition1star } = req.body;
        const result = await db.query(
            `UPDATE metrics 
       SET metric_type = $1, metric = $2, definition_5_star = $3, definition_4_star = $4, definition_3_star = $5, definition_2_star = $6, definition_1_star = $7 
       WHERE id = $8 RETURNING *`,
            [metricType, metric, definition5star, definition4star, definition3star, definition2star, definition1star, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Metric not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            metricType: row.metric_type,
            metric: row.metric,
            definition5star: row.definition_5_star,
            definition4star: row.definition_4_star,
            definition3star: row.definition_3_star,
            definition2star: row.definition_2_star,
            definition1star: row.definition_1_star
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM metrics WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Metric not found' });
        }
        res.json({ message: 'Metric deleted', id });
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
