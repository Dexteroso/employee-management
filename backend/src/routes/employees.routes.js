const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @openapi
 * /api/employees:
 *   get:
 *     summary: Get employees
 *     description: Returns a filtered list of current employees.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by employee ID, first name, or last name.
 *     responses:
 *       200:
 *         description: Employees retrieved successfully.
 *       500:
 *         description: Failed to fetch employees.
 */
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        e.emp_no,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        d.dept_no,
        d.dept_name
      FROM employees e
      JOIN dept_emp de ON e.emp_no = de.emp_no
      JOIN departments d ON de.dept_no = d.dept_no
      WHERE de.to_date = '9999-01-01'
    `;

    const params = [];

    if (search) {
      const trimmedSearch = search.trim();
      const isNumericSearch = /^\d+$/.test(trimmedSearch);

      query += ` AND (`;

      if (isNumericSearch) {
        query += `e.emp_no = ? OR `;
        params.push(Number(trimmedSearch));
      }

      query += `e.first_name LIKE ? OR e.last_name LIKE ?)`;
      params.push(`%${trimmedSearch}%`, `%${trimmedSearch}%`);
    }

    query += ` ORDER BY e.emp_no ASC LIMIT 20`;

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees'
    });
  }
});

/**
 * @openapi
 * /api/employees/{id}/historial:
 *   get:
 *     summary: Get employee history
 *     description: Returns employee profile data and combined employment history for the specified employee.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee number.
 *     responses:
 *       200:
 *         description: Employee history retrieved successfully.
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Failed to fetch employee history.
 */
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;

    const employeeQuery = `
      SELECT 
        e.emp_no,
        e.first_name,
        e.last_name,
        e.birth_date,
        e.gender,
        e.hire_date
      FROM employees e
      WHERE e.emp_no = ?
    `;

    const combinedHistoryQuery = `
      SELECT 
        t.emp_no,
        t.title,
        salary,
        t.from_date AS title_from,
        t.to_date AS title_to,
        s.from_date AS salary_from,
        s.to_date AS salary_to
      FROM titles t
      JOIN salaries s
        ON t.emp_no = s.emp_no
       AND s.from_date <= t.to_date
       AND s.to_date >= t.from_date
      WHERE t.emp_no = ?
      ORDER BY s.from_date DESC, t.from_date DESC
    `;

    const [employeeRows] = await pool.query(employeeQuery, [id]);

    if (employeeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const [combinedHistoryRows] = await pool.query(combinedHistoryQuery, [id]);

    res.json({
      success: true,
      data: {
        employee: employeeRows[0],
        history: combinedHistoryRows
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee history'
    });
  }
});

/**
 * @openapi
 * /api/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     description: Returns the current department, title, salary, and manager for a specific employee.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee number.
 *     responses:
 *       200:
 *         description: Employee retrieved successfully.
 *       404:
 *         description: Employee not found.
 *       500:
 *         description: Failed to fetch employee.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        e.emp_no,
        e.first_name,
        e.last_name,
        e.birth_date,
        e.gender,
        e.hire_date,
        d.dept_no,
        d.dept_name,
        t.title,
        s.salary,
        dm.emp_no AS manager_emp_no,
        CONCAT(m.first_name, ' ', m.last_name) AS manager_name
      FROM employees e
      JOIN dept_emp de ON e.emp_no = de.emp_no
      JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      LEFT JOIN dept_manager dm ON de.dept_no = dm.dept_no AND dm.to_date = '9999-01-01'
      LEFT JOIN employees m ON dm.emp_no = m.emp_no
      WHERE e.emp_no = ?
        AND de.to_date = '9999-01-01'
    `;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
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
      message: 'Failed to fetch employee'
    });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      emp_no,
      first_name,
      last_name,
      birth_date,
      gender,
      hire_date,
      dept_no,
      title,
      salary
    } = req.body;

    if (
      !emp_no ||
      !first_name ||
      !last_name ||
      !birth_date ||
      !gender ||
      !hire_date ||
      !dept_no ||
      !title ||
      !salary
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    await connection.beginTransaction();

    const insertEmployeeQuery = `
      INSERT INTO employees (
        emp_no,
        birth_date,
        first_name,
        last_name,
        gender,
        hire_date
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const insertDeptEmpQuery = `
      INSERT INTO dept_emp (
        emp_no,
        dept_no,
        from_date,
        to_date
      )
      VALUES (?, ?, ?, '9999-01-01')
    `;

    const insertTitleQuery = `
      INSERT INTO titles (
        emp_no,
        title,
        from_date,
        to_date
      )
      VALUES (?, ?, ?, '9999-01-01')
    `;

    const insertSalaryQuery = `
      INSERT INTO salaries (
        emp_no,
        salary,
        from_date,
        to_date
      )
      VALUES (?, ?, ?, '9999-01-01')
    `;

    await connection.query(insertEmployeeQuery, [
      emp_no,
      birth_date,
      first_name,
      last_name,
      gender,
      hire_date
    ]);

    await connection.query(insertDeptEmpQuery, [
      emp_no,
      dept_no,
      hire_date
    ]);

    await connection.query(insertTitleQuery, [
      emp_no,
      title,
      hire_date
    ]);

    await connection.query(insertSalaryQuery, [
      emp_no,
      salary,
      hire_date
    ]);

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        emp_no,
        first_name,
        last_name,
        birth_date,
        gender,
        hire_date,
        dept_no,
        title,
        salary
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Employee number already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create employee'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
