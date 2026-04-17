const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const ALLOWED_STATUSES = ['Active', 'In Progress', 'Closed'];

/**
 * @openapi
 * /api/incidencias:
 *   get:
 *     summary: Get incidents
 *     description: Returns all HR incidents with employee and department information.
 *     responses:
 *       200:
 *         description: Incidents retrieved successfully.
 *       500:
 *         description: Failed to fetch incidents.
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        i.id_incidencia,
        i.emp_no,
        e.first_name,
        e.last_name,
        d.dept_name,
        i.category,
        i.tipo,
        i.fecha,
        i.descripcion,
        i.estatus,
        i.severity,
        i.disciplinary_action,
        i.action_plan,
        i.follow_up_date,
        i.created_at,
        i.updated_at
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      ORDER BY i.id_incidencia ASC
    `;

    const [rows] = await pool.query(query);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidencias'
    });
  }
});

/**
 * @openapi
 * /api/incidencias/{id}:
 *   get:
 *     summary: Get incident by ID
 *     description: Returns a single HR incident by incident ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Incident ID.
 *     responses:
 *       200:
 *         description: Incident retrieved successfully.
 *       404:
 *         description: Incident not found.
 *       500:
 *         description: Failed to fetch incident.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        i.id_incidencia,
        i.emp_no,
        e.first_name,
        e.last_name,
        d.dept_name,
        i.category,
        i.tipo,
        i.fecha,
        i.descripcion,
        i.estatus,
        i.severity,
        i.disciplinary_action,
        i.action_plan,
        i.follow_up_date,
        i.created_at,
        i.updated_at
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      LEFT JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      LEFT JOIN departments d ON de.dept_no = d.dept_no
      WHERE i.id_incidencia = ?
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidencia'
    });
  }
});

/**
 * @openapi
 * /api/incidencias:
 *   post:
 *     summary: Create incident
 *     description: Creates a new HR incident record.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emp_no
 *               - tipo
 *               - fecha
 *             properties:
 *               emp_no:
 *                 type: integer
 *               category:
 *                 type: string
 *               tipo:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               descripcion:
 *                 type: string
 *               estatus:
 *                 type: string
 *                 enum: [Active, In Progress, Closed]
 *               severity:
 *                 type: string
 *               disciplinary_action:
 *                 type: string
 *               action_plan:
 *                 type: string
 *               follow_up_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Incident created successfully.
 *       400:
 *         description: Invalid request payload.
 *       500:
 *         description: Failed to create incident.
 */
router.post('/', async (req, res) => {
  try {
    const {
      emp_no,
      category,
      tipo,
      fecha,
      descripcion,
      estatus,
      severity,
      disciplinary_action,
      action_plan,
      follow_up_date
    } = req.body;

    if (!emp_no || !tipo || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'emp_no, tipo, and fecha are required'
      });
    }

    if (estatus && !ALLOWED_STATUSES.includes(estatus)) {
      return res.status(400).json({
        success: false,
        message: 'estatus must be one of: Active, In Progress, Closed'
      });
    }

    const query = `
      INSERT INTO incidencias_rrhh (
        emp_no,
        category,
        tipo,
        fecha,
        descripcion,
        estatus,
        severity,
        disciplinary_action,
        action_plan,
        follow_up_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      emp_no,
      category || null,
      tipo,
      fecha,
      descripcion || null,
      estatus || 'Active',
      severity || null,
      disciplinary_action || null,
      action_plan || null,
      follow_up_date || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Incidencia created successfully',
      data: {
        id_incidencia: result.insertId,
        emp_no,
        category: category || null,
        tipo,
        fecha,
        descripcion: descripcion || null,
        estatus: estatus || 'Active',
        severity: severity || null,
        disciplinary_action: disciplinary_action || null,
        action_plan: action_plan || null,
        follow_up_date: follow_up_date || null
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to create incidencia'
    });
  }
});

/**
 * @openapi
 * /api/incidencias/{id}:
 *   put:
 *     summary: Update incident
 *     description: Updates an existing HR incident.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Incident ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - fecha
 *               - estatus
 *             properties:
 *               category:
 *                 type: string
 *               tipo:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               descripcion:
 *                 type: string
 *               estatus:
 *                 type: string
 *                 enum: [Active, In Progress, Closed]
 *               severity:
 *                 type: string
 *               disciplinary_action:
 *                 type: string
 *               action_plan:
 *                 type: string
 *               follow_up_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Incident updated successfully.
 *       400:
 *         description: Invalid request payload.
 *       404:
 *         description: Incident not found.
 *       500:
 *         description: Failed to update incident.
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category,
      tipo,
      fecha,
      descripcion,
      estatus,
      severity,
      disciplinary_action,
      action_plan,
      follow_up_date
    } = req.body;

    if (!tipo || !fecha || !estatus) {
      return res.status(400).json({
        success: false,
        message: 'tipo, fecha, and estatus are required'
      });
    }

    if (!ALLOWED_STATUSES.includes(estatus)) {
      return res.status(400).json({
        success: false,
        message: 'estatus must be one of: Active, In Progress, Closed'
      });
    }

    const query = `
      UPDATE incidencias_rrhh
      SET
        category = ?,
        tipo = ?,
        fecha = ?,
        descripcion = ?,
        estatus = ?,
        severity = ?,
        disciplinary_action = ?,
        action_plan = ?,
        follow_up_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_incidencia = ?
    `;

    const [result] = await pool.query(query, [
      category || null,
      tipo,
      fecha,
      descripcion || null,
      estatus,
      severity || null,
      disciplinary_action || null,
      action_plan || null,
      follow_up_date || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia not found'
      });
    }

    res.json({
      success: true,
      message: 'Incidencia updated successfully',
      data: {
        id_incidencia: Number(id),
        category: category || null,
        tipo,
        fecha,
        descripcion: descripcion || null,
        estatus,
        severity: severity || null,
        disciplinary_action: disciplinary_action || null,
        action_plan: action_plan || null,
        follow_up_date: follow_up_date || null
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to update incidencia'
    });
  }
});

/**
 * @openapi
 * /api/incidencias/{id}:
 *   delete:
 *     summary: Delete incident
 *     description: Deletes an HR incident by incident ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Incident ID.
 *     responses:
 *       200:
 *         description: Incident deleted successfully.
 *       404:
 *         description: Incident not found.
 *       500:
 *         description: Failed to delete incident.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      DELETE FROM incidencias_rrhh
      WHERE id_incidencia = ?
    `;

    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incidencia not found'
      });
    }

    res.json({
      success: true,
      message: 'Incidencia deleted successfully'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete incidencia'
    });
  }
});

module.exports = router;
