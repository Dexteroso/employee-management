# Employee Management System (EMS)

## Overview
Este proyecto es un sistema sencillo de gestión de empleados desarrollado como parte de un bootcamp de desarrollo full stack.

La idea principal del proyecto es administrar empleados, departamentos e incidencias, además de mostrar un dashboard con métricas útiles y visualizaciones.

## Tech Stack
- Frontend: React (Vite)  
- Backend: Node.js + Express  
- Base de datos: MySQL  
- Documentación de API: Swagger  

## Features
- Dashboard con métricas clave (empleados, departamentos, incidencias, salarios)  
- Visualización de datos con gráficos:
  - Costo total por departamento  
  - Salario promedio por departamento  
- Búsqueda y filtrado de empleados  
- Vista de empleados por departamento  
- Gestión de incidencias (crear, ver, actualizar y eliminar)  
- Navegación entre módulos (Departments → Employees → Details)  
- Modo oscuro / claro  
- Diseño responsivo (mobile y desktop)  
- Documentación de API con Swagger  

## Cómo ejecutar el proyecto

1. Backend  
`cd backend`  
`npm install`  
`node src/server.js`  

2. Frontend  
`cd frontend`  
`npm install`  
`npm run dev`  

Backend: http://localhost:3000  
Frontend: http://localhost:5173  

## Variables de entorno
Crear un archivo `.env` en la carpeta backend con:

`DB_HOST=localhost`  
`DB_USER=root`  
`DB_PASSWORD=tu_password`  
`DB_NAME=employees`  

## Documentación de la API (Swagger)
Una vez que el backend esté corriendo, se puede acceder a Swagger en:

http://localhost:3000/api-docs/

Ahí se puede:
- Ver todos los endpoints disponibles  
- Probar las APIs directamente desde el navegador  

## Screenshots

- Dashboard  
- Employees  
- Departments  
- Incidents  
- Swagger  

## Notas
- El proyecto utiliza la base de datos de ejemplo "employees" de MySQL  
- Es necesario tener el servidor de MySQL corriendo  
- Algunos cálculos (como turnover) son aproximaciones basadas en los datos disponibles  

## Comentarios finales
Este proyecto me ayudó a entender cómo conectar un frontend con un backend, trabajar con bases de datos y estructurar una aplicación full stack.

También me permitió practicar la creación de dashboards, manejo de datos y mejorar la experiencia de usuario.