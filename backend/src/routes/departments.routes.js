const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/**
 * @openapi
 * /api/departments:
 *   get:
 *     summary: Get departments
 *     description: Returns all departments ordered by department name.
 *     responses:
 *       200:
 *         description: Departments retrieved successfully.
 *       500:
 *         description: Failed to fetch departments.
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        dept_no,
        dept_name
      FROM departments
      ORDER BY dept_name ASC
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
      message: 'Failed to fetch departments'
    });
  }
});

/**
 * @openapi
 * /api/departments/{dept_no}/employees:
 *   get:
 *     summary: Get employees by department
 *     description: Returns paginated current employees for the specified department including current title and salary.
 *     parameters:
 *       - in: path
 *         name: dept_no
 *         required: true
 *         schema:
 *           type: string
 *         description: Department number.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page number. Defaults to 1.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Page size. Defaults to 25.
 *     responses:
 *       200:
 *         description: Department employees retrieved successfully.
 *       500:
 *         description: Failed to fetch employees by department.
 */
router.get('/:dept_no/employees', async (req, res) => {
  try {
    const { dept_no } = req.params;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const offset = (page - 1) * limit;
    const {
      employeeId = '',
      name = '',
      title = 'all',
      salaryRange = 'all',
      hireDateRange = 'all'
    } = req.query;

    const baseFrom = `
      FROM employees e
      JOIN dept_emp de ON e.emp_no = de.emp_no
      JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      LEFT JOIN salaries s ON e.emp_no = s.emp_no AND s.to_date = '9999-01-01'
      WHERE de.dept_no = ?
        AND de.to_date = '9999-01-01'
    `;

    const filters = [];
    const params = [dept_no];

    if (employeeId.trim()) {
      filters.push('CAST(e.emp_no AS CHAR) LIKE ?');
      params.push(`%${employeeId.trim()}%`);
    }

    if (name.trim()) {
      filters.push("CONCAT(e.first_name, ' ', e.last_name) LIKE ?");
      params.push(`%${name.trim()}%`);
    }

    if (title !== 'all') {
      filters.push('t.title = ?');
      params.push(title);
    }

    if (salaryRange === '0-39999') filters.push('s.salary BETWEEN 0 AND 39999');
    if (salaryRange === '40000-59999') filters.push('s.salary BETWEEN 40000 AND 59999');
    if (salaryRange === '60000-79999') filters.push('s.salary BETWEEN 60000 AND 79999');
    if (salaryRange === '80000-99999') filters.push('s.salary BETWEEN 80000 AND 99999');
    if (salaryRange === '100000-119999') filters.push('s.salary BETWEEN 100000 AND 119999');
    if (salaryRange === '120000-139999') filters.push('s.salary BETWEEN 120000 AND 139999');
    if (salaryRange === '140000+') filters.push('s.salary >= 140000');

    if (hireDateRange === 'before-1990') filters.push('YEAR(e.hire_date) < 1990');
    if (hireDateRange === '1990-1994') filters.push('YEAR(e.hire_date) BETWEEN 1990 AND 1994');
    if (hireDateRange === '1995-1999') filters.push('YEAR(e.hire_date) BETWEEN 1995 AND 1999');
    if (hireDateRange === '2000+') filters.push('YEAR(e.hire_date) >= 2000');

    const whereSql = filters.length ? ` AND ${filters.join(' AND ')}` : '';

    const query = `
      SELECT 
        e.emp_no,
        e.first_name,
        e.last_name,
        e.gender,
        e.hire_date,
        d.dept_no,
        d.dept_name,
        t.title,
        t.from_date AS title_from,
        s.salary,
        s.from_date AS salary_from
      ${baseFrom}
      ${whereSql}
      ORDER BY e.emp_no ASC
      LIMIT ?
      OFFSET ?
    `;

    const totalQuery = `
      SELECT COUNT(*) AS total
      ${baseFrom}
      ${whereSql}
    `;

    const averageSalaryQuery = `
      SELECT AVG(s.salary) AS averageSalary
      ${baseFrom}
      ${whereSql}
    `;

    const mostCommonTitleQuery = `
      SELECT t.title, COUNT(*) AS total
      ${baseFrom}
      ${whereSql}
        AND t.title IS NOT NULL
      GROUP BY t.title
      ORDER BY total DESC, t.title ASC
      LIMIT 1
    `;

    const titleOptionsQuery = `
      SELECT DISTINCT t.title
      ${baseFrom}
        AND t.title IS NOT NULL
      ORDER BY t.title ASC
    `;

    const [rows] = await pool.query(query, [...params, limit, offset]);
    const [[{ total }]] = await pool.query(totalQuery, params);
    const [[averageSalaryRow]] = await pool.query(averageSalaryQuery, params);
    const [topTitleRows] = await pool.query(mostCommonTitleQuery, params);
    const [titleOptionRows] = await pool.query(titleOptionsQuery, [dept_no]);
    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    res.json({
      success: true,
      count: rows.length,
      total,
      totalPages,
      currentPage: page,
      limit,
      summary: {
        averageSalary: averageSalaryRow?.averageSalary ? Number(averageSalaryRow.averageSalary) : null,
        mostCommonTitle: topTitleRows[0]?.title || null
      },
      titleOptions: titleOptionRows.map((row) => row.title),
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees by department'
    });
  }
});

// Get current managers by department
router.get('/managers/current', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.dept_no,
        d.dept_name,
        dm.emp_no AS manager_emp_no,
        CONCAT(e.first_name, ' ', e.last_name) AS manager_name
      FROM dept_manager dm
      JOIN departments d ON dm.dept_no = d.dept_no
      JOIN employees e ON dm.emp_no = e.emp_no
      WHERE dm.to_date = '9999-01-01'
      ORDER BY d.dept_name ASC
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
      message: 'Failed to fetch current managers'
    });
  }
});

module.exports = router;
