ALTER TABLE incidencias_rrhh
  MODIFY COLUMN estatus VARCHAR(20) NOT NULL DEFAULT 'Active';

UPDATE incidencias_rrhh
SET estatus = CASE
  WHEN estatus IN ('abierta', 'open') THEN 'Active'
  WHEN estatus IN ('en proceso', 'in progress') THEN 'In Progress'
  WHEN estatus IN ('cerrada', 'closed') THEN 'Closed'
  ELSE estatus
END
WHERE estatus IN ('abierta', 'open', 'en proceso', 'in progress', 'cerrada', 'closed');
