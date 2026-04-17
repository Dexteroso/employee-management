const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const totalEmployeesQuery = `
      SELECT COUNT(*) AS total_employees
      FROM dept_emp
      WHERE to_date = '9999-01-01'
    `;

    const totalDepartmentsQuery = `
      SELECT COUNT(*) AS total_departments
      FROM departments
    `;

    const incidentsSummaryQuery = `
  SELECT 
    SUM(CASE WHEN estatus IN ('Active', 'In Progress') THEN 1 ELSE 0 END) AS active_incidents,
    SUM(CASE WHEN estatus = 'Closed' THEN 1 ELSE 0 END) AS closed_incidents
  FROM incidencias_rrhh
`;
    const employeesByDepartmentQuery = `
      SELECT 
        d.dept_no,
        d.dept_name,
        COUNT(de.emp_no) AS total_employees
      FROM departments d
      JOIN dept_emp de ON d.dept_no = de.dept_no
      WHERE de.to_date = '9999-01-01'
      GROUP BY d.dept_no, d.dept_name
      ORDER BY d.dept_name ASC
    `;

    const averageSalaryQuery = `
      SELECT AVG(s.salary) AS average_salary
      FROM salaries s
      WHERE s.to_date = '9999-01-01'
    `;

    const recentHiresQuery = `
      SELECT
        e.emp_no,
        e.first_name,
        e.last_name,
        e.hire_date,
        d.dept_name,
        t.title
      FROM employees e
      JOIN dept_emp de ON e.emp_no = de.emp_no AND de.to_date = '9999-01-01'
      JOIN departments d ON de.dept_no = d.dept_no
      LEFT JOIN titles t ON e.emp_no = t.emp_no AND t.to_date = '9999-01-01'
      ORDER BY e.hire_date DESC
      LIMIT 6
    `;

    const recentIncidenciasQuery = `
      SELECT 
        i.id_incidencia,
        i.emp_no,
        e.first_name,
        e.last_name,
        i.tipo,
        i.fecha,
        i.estatus
      FROM incidencias_rrhh i
      JOIN employees e ON i.emp_no = e.emp_no
      ORDER BY i.created_at DESC
      LIMIT 5
    `;

    const departmentMetricsQuery = `
      SELECT
        d.dept_no,
        d.dept_name,
        COALESCE(active.active_headcount, 0) AS headcount,
        ROUND(COALESCE(active.avg_salary, 0), 0) AS avg_salary,
        ROUND(COALESCE(active.total_cost, 0) / 1000000, 2) AS total_cost,
        COALESCE(inactive.inactive_count, 0) AS inactive_count,
        ROUND(
          CASE
            WHEN COALESCE(active.active_headcount, 0) + COALESCE(inactive.inactive_count, 0) = 0 THEN 0
            ELSE (COALESCE(inactive.inactive_count, 0) / (COALESCE(active.active_headcount, 0) + COALESCE(inactive.inactive_count, 0))) * 100
          END,
          1
        ) AS turnover_percent
      FROM departments d
      LEFT JOIN (
        SELECT
          de.dept_no,
          COUNT(DISTINCT de.emp_no) AS active_headcount,
          AVG(s.salary) AS avg_salary,
          SUM(s.salary) AS total_cost
        FROM dept_emp de
        JOIN salaries s ON de.emp_no = s.emp_no AND s.to_date = '9999-01-01'
        WHERE de.to_date = '9999-01-01'
        GROUP BY de.dept_no
      ) active ON active.dept_no = d.dept_no
      LEFT JOIN (
        SELECT
          de.dept_no,
          COUNT(DISTINCT de.emp_no) AS inactive_count
        FROM dept_emp de
        WHERE de.to_date <> '9999-01-01'
        GROUP BY de.dept_no
      ) inactive ON inactive.dept_no = d.dept_no
      ORDER BY d.dept_name ASC
    `;

    const [totalEmployeesRows] = await pool.query(totalEmployeesQuery);
    const [totalDepartmentsRows] = await pool.query(totalDepartmentsQuery);
    const [incidentsSummaryRows] = await pool.query(incidentsSummaryQuery);
    const [employeesByDepartmentRows] = await pool.query(employeesByDepartmentQuery);
    const [averageSalaryRows] = await pool.query(averageSalaryQuery);
    const [recentHiresRows] = await pool.query(recentHiresQuery);
    const [recentIncidenciasRows] = await pool.query(recentIncidenciasQuery);
    const [departmentMetricsRows] = await pool.query(departmentMetricsQuery);

    res.json({
      success: true,
      data: {
        totalEmployees: totalEmployeesRows[0].total_employees,
        totalDepartments: totalDepartmentsRows[0].total_departments,
        activeIncidents: incidentsSummaryRows[0].active_incidents || 0,
        closedIncidents: incidentsSummaryRows[0].closed_incidents || 0,
        averageSalary: Math.round(averageSalaryRows[0].average_salary || 0),
        recentHires: recentHiresRows,
        employeesByDepartment: employeesByDepartmentRows,
        recentIncidencias: recentIncidenciasRows,
        departmentMetrics: departmentMetricsRows.map((row) => ({
          dept_no: row.dept_no,
          dept_name: row.dept_name,
          headcount: Number(row.headcount || 0),
          avg_salary: Number(row.avg_salary || 0),
          total_cost: Number(row.total_cost || 0),
          inactive_count: Number(row.inactive_count || 0),
          turnover_percent: Number(row.turnover_percent || 0)
        }))
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary'
    });
  }
});

module.exports = router;
