import db from '../db.js';

const createTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        department VARCHAR(255),
        status VARCHAR(50),
        avatar TEXT,
        details JSONB
      );
    `);
        console.log('Employees table checked/created successfully');
    } catch (err) {
        console.error('Error creating employees table:', err);
    }
};

const getAll = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees ORDER BY id ASC');
        const employees = result.rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                designation: row.designation,
                department: row.department,
                status: row.status,
                avatar: row.avatar,
                ...row.details // Spread JSONB fields to root level for frontend compatibility
            };
        });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const employee = req.body;
        const { id, name, email, designation, department, status, avatar, ...details } = employee;

        const result = await db.query(
            'INSERT INTO employees (id, name, email, designation, department, status, avatar, details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [id, name, email, designation, department, status, avatar, details]
        );

        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            name: row.name,
            email: row.email,
            designation: row.designation,
            department: row.department,
            status: row.status,
            avatar: row.avatar,
            ...row.details
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = req.body;
        const { name, email, designation, department, status, avatar, ...details } = employee;

        const result = await db.query(
            'UPDATE employees SET name = $1, email = $2, designation = $3, department = $4, status = $5, avatar = $6, details = $7 WHERE id = $8 RETURNING *',
            [name, email, designation, department, status, avatar, details, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            email: row.email,
            designation: row.designation,
            department: row.department,
            status: row.status,
            avatar: row.avatar,
            ...row.details
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted', id });
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
