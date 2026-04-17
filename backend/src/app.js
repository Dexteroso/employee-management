const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const employeesRoutes = require('./routes/employees.routes');
const departmentsRoutes = require('./routes/departments.routes');
const incidenciasRoutes = require('./routes/incidencias.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/employees', employeesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/dashboard', dashboardRoutes);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Employees API',
      version: '1.0.0',
      description: 'API for Employee Management Project',
    },
  },
  apis: [`${__dirname}/routes/*.js`],
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is working correctly'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Database query failed'
    });
  }
});

module.exports = app;
