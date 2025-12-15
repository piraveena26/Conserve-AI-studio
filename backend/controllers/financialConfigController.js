import db from '../db.js';

const createTaxSettingsTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS tax_settings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50),
        tax_type VARCHAR(10),
        tax_percentage NUMERIC,
        status VARCHAR(20) DEFAULT 'Active'
      );
    `);
        console.log('Tax Settings table checked/created successfully');
    } catch (err) {
        console.error('Error creating tax_settings table:', err);
    }
};

const getTaxSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tax_settings ORDER BY id DESC');
        const settings = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            code: row.code,
            taxType: row.tax_type,
            taxPercentage: Number(row.tax_percentage),
            status: row.status
        }));
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createTaxSetting = async (req, res) => {
    try {
        const { name, taxType, taxPercentage } = req.body;
        // Auto-generate code from name (first 3 chars uppercase)
        const code = name.substring(0, 3).toUpperCase();

        const result = await db.query(
            'INSERT INTO tax_settings (name, code, tax_type, tax_percentage) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, code, taxType, taxPercentage]
        );
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            name: row.name,
            code: row.code,
            taxType: row.tax_type,
            taxPercentage: Number(row.tax_percentage),
            status: row.status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateTaxSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, taxType, taxPercentage, status } = req.body;

        const result = await db.query(
            `UPDATE tax_settings 
       SET name = $1, code = $2, tax_type = $3, tax_percentage = $4, status = $5
       WHERE id = $6 RETURNING *`,
            [name, code, taxType, taxPercentage, status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tax setting not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            name: row.name,
            code: row.code,
            taxType: row.tax_type,
            taxPercentage: Number(row.tax_percentage),
            status: row.status
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteTaxSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM tax_settings WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tax setting not found' });
        }
        res.json({ message: 'Tax setting deleted', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export default {
    createTaxSettingsTable,
    getTaxSettings,
    createTaxSetting,
    updateTaxSetting,
    deleteTaxSetting
};
