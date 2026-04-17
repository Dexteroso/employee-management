ALTER TABLE incidencias_rrhh
  ADD COLUMN category VARCHAR(100) NULL AFTER emp_no,
  ADD COLUMN severity VARCHAR(50) NULL AFTER estatus,
  ADD COLUMN disciplinary_action VARCHAR(100) NULL AFTER severity,
  ADD COLUMN action_plan TEXT NULL AFTER disciplinary_action,
  ADD COLUMN follow_up_date DATE NULL AFTER action_plan;
