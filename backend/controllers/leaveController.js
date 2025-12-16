import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) NOT NULL,
        employee_name VARCHAR(255) NOT NULL,
        employee_avatar TEXT,
        leave_type VARCHAR(100) NOT NULL,
        leave_range VARCHAR(50) NOT NULL,
        date DATE,
        from_date DATE,
        to_date DATE,
        reason TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'Pending',
        applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Leave requests table checked/created successfully');
    } catch (err) {
        console.error('Error creating leave_requests table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leave_requests ORDER BY applied_on DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const {
            employee_id,
            employee_name,
            employee_avatar,
            leave_type,
            leave_range,
            date,
            from_date,
            to_date,
            reason,
            status
        } = req.body;

        const result = await db.query(
            `INSERT INTO leave_requests 
            (employee_id, employee_name, employee_avatar, leave_type, leave_range, date, from_date, to_date, reason, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [employee_id, employee_name, employee_avatar, leave_type, leave_range, date || null, from_date || null, to_date || null, reason, status || 'Pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            leave_type,
            leave_range,
            date,
            from_date,
            to_date,
            reason
        } = req.body;

        const result = await db.query(
            `UPDATE leave_requests 
            SET leave_type = $1, leave_range = $2, date = $3, from_date = $4, to_date = $5, reason = $6 
            WHERE id = $7 
            RETURNING *`,
            [leave_type, leave_range, date || null, from_date || null, to_date || null, reason, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(
            'UPDATE leave_requests SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM leave_requests WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        res.json({ message: 'Leave request deleted', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    createTable,
    getAll,
    create,
    update,
    updateStatus,
    remove
};
