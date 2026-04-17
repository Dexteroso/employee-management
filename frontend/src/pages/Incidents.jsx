import { useEffect, useState } from 'react';
import { getIncidents, createIncident, updateIncident, deleteIncident } from '../services/incidentsService';
import { getEmployees } from '../services/employeesService';
import { useResponsive } from '../hooks/useResponsive';

const STATUS_OPTIONS = ['Active', 'In Progress', 'Closed'];

const CATEGORY_TYPE_OPTIONS = {
  Attendance: ['Unexcused Tardy', 'Unexcused Absence', 'No-Call/No-Show'],
  Conduct: ['Insubordination', 'Policy Violation', 'Harassment/Bullying', 'Dress Code'],
  Performance: ['Failure to Meet Standards', 'Quality of Work'],
  Safety: ['Workplace Accident', 'Near-Miss', 'Violation of Safety Protocols']
};

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const DISCIPLINARY_ACTION_OPTIONS = [
  'Verbal Warning',
  'Written Warning',
  'Final Written Warning',
  'Suspension',
  'Termination'
];

const createEmptyIncident = () => ({
  emp_no: '',
  category: '',
  type: '',
  severity: '',
  disciplinary_action: '',
  action_plan: '',
  follow_up_date: '',
  fecha: '',
  estatus: '',
  descripcion: ''
});

const getCategoryFromType = (type) => {
  if (!type) {
    return '';
  }

  return Object.entries(CATEGORY_TYPE_OPTIONS).find(([, types]) => types.includes(type))?.[0] || '';
};

const getEmployeeLabel = (employee) => {
  if (!employee) {
    return '';
  }

  return `${employee.first_name} ${employee.last_name}`;
};

const formatDisplayDate = (value) => {
  if (!value) {
    return 'Not available';
  }

  return new Date(value).toLocaleDateString();
};

function Incidents() {
  const { isTablet, isMobile } = useResponsive();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingIncidentId, setEditingIncidentId] = useState(null);
  const [newIncident, setNewIncident] = useState(createEmptyIncident());
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const result = await getIncidents();
        setIncidents(result.data);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      }
    };

    fetchIncidents();
  }, []);

  useEffect(() => {
    if (selectedEmployeeInfo || employeeSearch.trim().length <= 1) {
      setEmployeeResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const result = await getEmployees(employeeSearch.trim());
        setEmployeeResults(result.data);
      } catch (error) {
        console.error('Error searching employees:', error);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [employeeSearch, selectedEmployeeInfo]);

  const resetFormState = () => {
    setShowForm(false);
    setEditingIncidentId(null);
    setSelectedIncident(null);
    setEmployeeSearch('');
    setEmployeeResults([]);
    setSelectedEmployeeInfo(null);
    setNewIncident(createEmptyIncident());
  };

  const handleSelectEmployee = (employee) => {
    setNewIncident((current) => ({ ...current, emp_no: employee.emp_no }));
    setSelectedEmployeeInfo(employee);
    setEmployeeSearch(getEmployeeLabel(employee));
    setEmployeeResults([]);
  };

  const handleSaveIncident = async () => {
    if (
      !newIncident.emp_no ||
      !newIncident.category ||
      !newIncident.type ||
      !newIncident.severity ||
      !newIncident.fecha ||
      !newIncident.estatus ||
      !newIncident.descripcion ||
      !newIncident.disciplinary_action ||
      !newIncident.action_plan ||
      !newIncident.follow_up_date
    ) {
      alert('Please complete all fields before saving the incident.');
      return;
    }

    const payload = {
      emp_no: newIncident.emp_no,
      category: newIncident.category,
      tipo: newIncident.type,
      fecha: newIncident.fecha,
      descripcion: newIncident.descripcion,
      estatus: newIncident.estatus,
      severity: newIncident.severity,
      disciplinary_action: newIncident.disciplinary_action,
      action_plan: newIncident.action_plan,
      follow_up_date: newIncident.follow_up_date
    };
    try {
      if (editingIncidentId) {
        await updateIncident(editingIncidentId, payload);
        alert('Incident updated successfully');
      } else {
        await createIncident(payload);
        alert('Incident created successfully');
      }

      const refreshed = await getIncidents();
      setIncidents(refreshed.data);
      resetFormState();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident');
    }
  };

  const handleDeleteIncident = async () => {
    if (!selectedIncident?.id_incidencia) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this incident?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteIncident(selectedIncident.id_incidencia);
      alert('Incident deleted successfully');

      const refreshed = await getIncidents();
      setIncidents(refreshed.data);
      resetFormState();
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Failed to delete incident');
    }
  };

  const sectionStyle = {
    backgroundColor: 'var(--app-surface)',
    borderRadius: '12px',
    padding: '17px',
    boxShadow: 'var(--app-shadow)'
  };

  const buttonStyle = {
    padding: '4px 12px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#11a9cc',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#e9b713'
  };

  const inputStyle = {
    width: '100%',
    padding: '5px 10px',
    border: '1px solid var(--app-input-border)',
    borderRadius: '8px',
    boxSizing: 'border-box',
    color: 'var(--app-input-text)',
    backgroundColor: 'var(--app-input-background)',
    fontSize: '13px'
  };

  const readOnlyStyle = {
    ...inputStyle,
    backgroundColor: 'var(--app-input-disabled-background)',
    color: 'var(--app-text-secondary)'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: 'var(--app-text-body)',
    fontSize: '12px',
    fontWeight: '600'
  };

  const formSectionTitleStyle = {
    margin: '0 0 12px 0',
    color: 'var(--app-text-primary)',
    fontSize: '16px',
    fontWeight: '700'
  };

  const fieldRowStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '120px minmax(0, 1fr)',
    alignItems: 'center',
    gap: '8px'
  };

  const formGridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '10px 14px'
  };

  const availableTypes = CATEGORY_TYPE_OPTIONS[newIncident.category] || [];

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? '34px' : '43px', color: 'var(--app-text-primary)', fontWeight: '700', marginTop: 17, marginBottom: isMobile ? '20px' : '28px' }}>
        Incidents
      </h1>

      <div style={{ ...sectionStyle, marginBottom: '8px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: isMobile ? 'flex-start' : 'flex-end', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '10px' : 0, marginBottom: '10px', minHeight: isMobile ? 'auto' : '32px' }}>
          <h3
            style={{
              margin: 0,
              color: 'var(--app-text-secondary)',
              fontSize: '18px',
              position: isMobile ? 'static' : 'absolute',
              left: isMobile ? 'auto' : '50%',
              transform: isMobile ? 'none' : 'translateX(-50%)'
            }}
          >
            Incidents List
          </h3>
          <button
            style={{ ...buttonStyle, marginRight: isMobile ? 0 : '10px', width: isMobile ? '100%' : 'auto' }}
            onClick={() => {
              setShowForm(true);
              setEditingIncidentId(null);
              setSelectedIncident(null);
              setEmployeeSearch('');
              setEmployeeResults([]);
              setSelectedEmployeeInfo(null);
              setNewIncident(createEmptyIncident());
            }}
          >
            + New Incident
          </button>
        </div>

        <div style={{ marginTop: '0px', maxHeight: '200px', overflowY: 'auto', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--app-border)' }}>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>ID</th>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>Employee</th>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>Type</th>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>Date</th>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>Status</th>
                <th style={{ padding: '0px 7px', textAlign: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--app-surface)', zIndex: 1 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '10px', textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                    No incidents found
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id_incidencia} style={{ borderBottom: '1px solid var(--app-border)' }}>
                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      {incident.id_incidencia}
                    </td>

                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      {incident.first_name} {incident.last_name}
                    </td>

                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      {incident.tipo}
                    </td>

                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      {new Date(incident.fecha).toLocaleDateString()}
                    </td>

                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      {incident.estatus}
                    </td>

                    <td style={{ padding: '5px 7px', textAlign: 'center' }}>
                      <button
                        style={
                          selectedIncident?.id_incidencia === incident.id_incidencia
                            ? activeButtonStyle
                            : buttonStyle
                        }
                        onClick={() => setSelectedIncident(incident)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ ...sectionStyle, marginBottom: '8px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', color: 'var(--app-text-secondary)', fontSize: '18px' }}>
            {editingIncidentId ? 'Edit Incident' : 'New Incident'}
          </h3>

          <div style={{ border: '1px solid var(--app-border)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
            <h4 style={formSectionTitleStyle}>Incident Information</h4>

            <div style={formGridStyle}>
              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Incident ID</label>
                <input
                  readOnly
                  value={editingIncidentId || 'Auto-generated'}
                  style={readOnlyStyle}
                />
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Date</label>
                <input
                  type="date"
                  value={newIncident.fecha}
                  onChange={(e) => setNewIncident((current) => ({ ...current, fecha: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                <div style={{ ...fieldRowStyle, gridTemplateColumns: isMobile ? '1fr' : '120px minmax(0, 1fr)' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Employee</label>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <input
                    placeholder="Search employee by name or ID"
                    value={employeeSearch}
                    readOnly={Boolean(selectedEmployeeInfo)}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEmployeeResults([]);
                      }
                    }}
                    style={selectedEmployeeInfo ? readOnlyStyle : inputStyle}
                  />

                  {selectedEmployeeInfo && (
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        setSelectedEmployeeInfo(null);
                        setEmployeeSearch('');
                        setEmployeeResults([]);
                        setNewIncident((current) => ({ ...current, emp_no: '' }));
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>
                </div>

                {employeeResults.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: isMobile ? 0 : '128px',
                      right: 0,
                      marginTop: '1px',
                      backgroundColor: 'var(--app-overlay-surface)',
                      border: '1px solid var(--app-input-border)',
                      borderRadius: '8px',
                      boxShadow: 'var(--app-shadow)',
                      zIndex: 10,
                      maxHeight: '180px',
                      overflowY: 'auto',
                      maxWidth: isMobile ? 'none' : '400px',
                    }}
                  >
                    {employeeResults.map((employee) => (
                      <div
                        key={employee.emp_no}
                        onClick={() => handleSelectEmployee(employee)}
                        style={{
                          padding: '0px 10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--app-border)',
                          fontSize: '13px'
                        }}
                      >
                        {employee.first_name} {employee.last_name} - ID {employee.emp_no} - {employee.dept_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Incident Category</label>
                <select
                  value={newIncident.category}
                  onChange={(e) =>
                    setNewIncident((current) => ({
                      ...current,
                      category: e.target.value,
                      type: ''
                    }))
                  }
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  {Object.keys(CATEGORY_TYPE_OPTIONS).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Incident Type</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident((current) => ({ ...current, type: e.target.value }))}
                  disabled={!newIncident.category}
                  style={{
                    ...inputStyle,
                    backgroundColor: newIncident.category ? 'var(--app-input-background)' : 'var(--app-input-disabled-background)',
                    color: 'var(--app-input-text)'
                  }}
                >
                  <option value="">{newIncident.category ? 'Select type' : 'Select a category first'}</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Severity Level</label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident((current) => ({ ...current, severity: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select severity</option>
                  {SEVERITY_OPTIONS.map((severity) => (
                    <option key={severity} value={severity}>
                      {severity}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
                <select
                  value={newIncident.estatus}
                  onChange={(e) => setNewIncident((current) => ({ ...current, estatus: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  placeholder="Describe the incident"
                  rows="4"
                  value={newIncident.descripcion}
                  onChange={(e) => setNewIncident((current) => ({ ...current, descripcion: e.target.value }))}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--app-border)', borderRadius: '12px', padding: '16px' }}>
            <h4 style={formSectionTitleStyle}>Corrective Actions</h4>

            <div style={formGridStyle}>
              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Disciplinary Action</label>
                <select
                  value={newIncident.disciplinary_action}
                  onChange={(e) => setNewIncident((current) => ({ ...current, disciplinary_action: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select disciplinary action</option>
                  {DISCIPLINARY_ACTION_OPTIONS.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldRowStyle}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Follow-up Date</label>
                <input
                  type="date"
                  value={newIncident.follow_up_date}
                  onChange={(e) => setNewIncident((current) => ({ ...current, follow_up_date: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Action Plan / Expectations</label>
                <textarea
                  placeholder="Document corrective actions, expectations, and follow-up notes"
                  rows="4"
                  value={newIncident.action_plan}
                  onChange={(e) => setNewIncident((current) => ({ ...current, action_plan: e.target.value }))}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button style={{ ...buttonStyle, width: isMobile ? '100%' : 'auto' }} onClick={handleSaveIncident}>
              Save
            </button>
            <button
              style={{ ...buttonStyle, width: isMobile ? '100%' : 'auto' }}
              onClick={resetFormState}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div style={sectionStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--app-text-secondary)', fontSize: '18px' }}>Incident Details</h3>

          {selectedIncident ? (
            <div>
              <div
                style={{
                  border: '1px solid var(--app-border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: 'var(--app-surface)'
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px 16px',
                    backgroundColor: 'var(--app-surface-muted)',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--app-text-primary)', marginBottom: '7px' }}>
                    Incident {selectedIncident.id_incidencia}
                  </div>
                  <div style={{ fontSize: '25px', fontWeight: '600', color: 'var(--app-text-secondary)' }}>
                    {selectedIncident.first_name} {selectedIncident.last_name}
                  </div>
                  <div style={{ color: 'var(--app-text-secondary)', fontSize: '13px', marginTop: 0 }}>Employee ID: {selectedIncident.emp_no}</div>
                </div>

                <div style={{ backgroundColor: 'var(--app-surface-muted)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', padding: '16px', fontSize: '13px', lineHeight: 1.5, color: 'var(--app-text-body)' }}>
                  <div>
                  <p><strong>Category:</strong> {selectedIncident.category || getCategoryFromType(selectedIncident.tipo) || 'Not available'}</p>
                  <p><strong>Date:</strong> {formatDisplayDate(selectedIncident.fecha)}</p>
                  <p><strong>Type:</strong> {selectedIncident.tipo || 'Not available'}</p>
                  <p><strong>Status:</strong> {selectedIncident.estatus}</p>
                  <p style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}><strong>Description:</strong> {selectedIncident.descripcion || 'Not available'}</p>
                </div>

                  <div>
                  <p><strong>Severity Level:</strong> {selectedIncident.severity || 'Not available'}</p>
                  <p><strong>Disciplinary Action Level:</strong> {selectedIncident.disciplinary_action || 'Not available'}</p>
                  <p><strong>Follow-up Date:</strong> {formatDisplayDate(selectedIncident.follow_up_date)}</p>
                  <p style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}><strong>Action Plan / Expectations:</strong> {selectedIncident.action_plan || 'Not available'}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  style={{ ...buttonStyle, width: isMobile ? '100%' : 'auto' }}
                  onClick={handleDeleteIncident}
                >
                  Delete
                </button>

                <button
                  style={{ ...buttonStyle, width: isMobile ? '100%' : 'auto' }}
                  onClick={() => {
                    setShowForm(true);
                    setEditingIncidentId(selectedIncident.id_incidencia);
                    setNewIncident({
                      emp_no: selectedIncident.emp_no,
                      category: selectedIncident.category || getCategoryFromType(selectedIncident.tipo),
                      type: selectedIncident.tipo,
                      severity: selectedIncident.severity || '',
                      disciplinary_action: selectedIncident.disciplinary_action || '',
                      action_plan: selectedIncident.action_plan || '',
                      follow_up_date: selectedIncident.follow_up_date?.slice(0, 10) || '',
                      fecha: selectedIncident.fecha?.slice(0, 10),
                      estatus: selectedIncident.estatus,
                      descripcion: selectedIncident.descripcion || ''
                    });
                    setSelectedEmployeeInfo({
                      emp_no: selectedIncident.emp_no,
                      first_name: selectedIncident.first_name,
                      last_name: selectedIncident.last_name,
                      dept_name: selectedIncident.dept_name || 'Department unavailable'
                    });
                    setEmployeeSearch(`${selectedIncident.first_name} ${selectedIncident.last_name}`);
                    setEmployeeResults([]);
                  }}
                >
                  Edit
                </button>

                <button
                  style={{ ...buttonStyle, width: isMobile ? '100%' : 'auto' }}
                  onClick={() => setSelectedIncident(null)}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <p style={{ margin: 0, color: 'var(--app-text-secondary)' }}>
              Select an incident to view details here.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Incidents;
