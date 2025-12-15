import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        job_role VARCHAR(255) NOT NULL,
        goal_title VARCHAR(255) NOT NULL,
        weightage INTEGER NOT NULL,
        baseline TEXT,
        assessment_period VARCHAR(50) NOT NULL,
        metric_id INTEGER REFERENCES metrics(id)
      );
    `);
        console.log('Goals table checked/created successfully');
    } catch (err) {
        console.error('Error creating goals table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                g.id, 
                g.job_role, 
                g.goal_title, 
                g.weightage, 
                g.baseline, 
                g.assessment_period,
                m.id as metric_id,
                m.metric_type,
                m.metric,
                m.definition_5_star,
                m.definition_4_star,
                m.definition_3_star,
                m.definition_2_star,
                m.definition_1_star
            FROM goals g
            LEFT JOIN metrics m ON g.metric_id = m.id
            ORDER BY g.id DESC
        `);

        const goals = result.rows.map(row => ({
            id: row.id,
            jobRole: row.job_role,
            goalTitle: row.goal_title,
            weightage: row.weightage,
            baseline: row.baseline,
            assessmentPeriod: row.assessment_period,
            metric: row.metric_id ? {
                id: row.metric_id,
                metricType: row.metric_type,
                metric: row.metric,
                definition5star: row.definition_5_star,
                definition4star: row.definition_4_star,
                definition3star: row.definition_3_star,
                definition2star: row.definition_2_star,
                definition1star: row.definition_1_star
            } : null
        }));
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { jobRole, goalTitle, weightage, baseline, assessmentPeriod, metric } = req.body;
        const metricId = metric ? metric.id : null;

        const result = await db.query(
            `INSERT INTO goals (job_role, goal_title, weightage, baseline, assessment_period, metric_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [jobRole, goalTitle, weightage, baseline, assessmentPeriod, metricId]
        );

        // We could fetch the created goal with join, but for simplicity we'll construct the response
        // assuming the input metric object is correct. In a real app we might want to re-fetch.
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            jobRole: row.job_role,
            goalTitle: row.goal_title,
            weightage: row.weightage,
            baseline: row.baseline,
            assessmentPeriod: row.assessment_period,
            metric: metric
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobRole, goalTitle, weightage, baseline, assessmentPeriod, metric } = req.body;
        const metricId = metric ? metric.id : null;

        const result = await db.query(
            `UPDATE goals 
       SET job_role = $1, goal_title = $2, weightage = $3, baseline = $4, assessment_period = $5, metric_id = $6
       WHERE id = $7 RETURNING *`,
            [jobRole, goalTitle, weightage, baseline, assessmentPeriod, metricId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            jobRole: row.job_role,
            goalTitle: row.goal_title,
            weightage: row.weightage,
            baseline: row.baseline,
            assessmentPeriod: row.assessment_period,
            metric: metric
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM goals WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json({ message: 'Goal deleted', id });
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
