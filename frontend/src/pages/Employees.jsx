import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEmployees, getEmployeeById, getEmployeeHistory, getCurrentManagers } from '../services/employeesService';
import { useResponsive } from '../hooks/useResponsive';

function Employees() {
    const { isTablet, isMobile } = useResponsive();
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formMessage, setFormMessage] = useState('');
    const [dateError, setDateError] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [currentManagers, setCurrentManagers] = useState([]);
    const [employeeHistory, setEmployeeHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [newEmployee, setNewEmployee] = useState({
        first_name: '',
        last_name: '',
        gender: '',
        birth_date: '',
        hire_date: '',
        dept_name: '',
        title: '',
        salary: '',
        manager: ''
    });

    const handleSearch = async () => {
        try {
            setLoading(true);
            setErrorMessage('');

            const result = await getEmployees(search);
            setEmployees(result.data);
            setSearch('');
            setSelectedEmployee(null);
            setHasSearched(true);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setErrorMessage('Unable to fetch employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isAdult = (dateOfBirth) => {
        if (!dateOfBirth) return false;

        const today = new Date();
        const dob = new Date(dateOfBirth);

        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < dob.getDate())
        ) {
            age--;
        }

        return age >= 18;
    };

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const result = await getCurrentManagers();
                setCurrentManagers(result.data);
            } catch (error) {
                console.error('Error fetching current managers:', error);
            }
        };

        fetchManagers();
    }, []);

    useEffect(() => {
        const employeeIdFromQuery = searchParams.get('emp_no');

        if (!employeeIdFromQuery) {
            return;
        }

        const loadEmployeeFromQuery = async () => {
            try {
                setLoading(true);
                setErrorMessage('');
                const result = await getEmployees(employeeIdFromQuery);
                setEmployees(result.data);
                setHasSearched(true);
                await loadEmployeeDetails(employeeIdFromQuery);
            } catch (error) {
                console.error('Error loading employee from query:', error);
                setErrorMessage('Unable to fetch employees. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadEmployeeFromQuery();
    }, [searchParams]);

    const handleSaveNewEmployee = () => {
        if (
            !newEmployee.first_name ||
            !newEmployee.last_name ||
            !newEmployee.gender ||
            !newEmployee.birth_date ||
            !newEmployee.hire_date ||
            !newEmployee.dept_name ||
            !newEmployee.title ||
            !newEmployee.salary ||
            !newEmployee.manager
        ) {
            setFormMessage('Please complete all fields before saving.');
            return;
        }
        if (!isAdult(newEmployee.birth_date)) {
            setFormMessage('');
            setDateError('Employee must be at least 18 years old.');
            return;
        }

        setDateError('');

        console.log('New employee draft:', newEmployee);
        setFormMessage('New employee draft captured successfully.');

        setNewEmployee({
            first_name: '',
            last_name: '',
            gender: '',
            birth_date: '',
            hire_date: '',
            dept_name: '',
            title: '',
            salary: '',
            manager: ''
        });
    };

    const formatDisplayDate = (date) => {
        if (!date) {
            return '—';
        }

        if (date === '9999-01-01' || String(date).startsWith('9999-01-01')) {
            return 'Current';
        }

        return new Date(date).toLocaleDateString();
    };

    const loadEmployeeDetails = async (employeeId) => {
        try {
            setHistoryLoading(true);
            const [employeeResult, historyResult] = await Promise.all([
                getEmployeeById(employeeId),
                getEmployeeHistory(employeeId)
            ]);

            setSelectedEmployee(employeeResult.data);
            setEmployeeHistory(historyResult.data?.history || []);
        } catch (error) {
            console.error('Error fetching employee details:', error);
            setEmployeeHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    const sectionStyle = {
        backgroundColor: 'var(--app-surface)',
        borderRadius: '12px',
        padding: '17px',
        boxShadow: 'var(--app-shadow)'
    };

    const inputStyle = {
        width: '100%',
        padding: '5px 12px',
        border: '1px solid var(--app-input-border)',
        borderRadius: '8px',
        fontSize: '13px',
        outline: 'none',
        boxSizing: 'border-box',
        color: 'var(--app-input-text)',
        backgroundColor: 'var(--app-input-background)'
    };

    const detailButtonStyle = {
        padding: '4px 10px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#11a9cc',
        color: '#ffffff',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer'
    };

    const activeDetailButtonStyle = {
        ...detailButtonStyle,
        backgroundColor: '#e9b713'
    };

    return (
        <div>
            <h1 style={{ fontSize: isMobile ? '34px' : '43px', color: 'var(--app-text-primary)', fontWeight: '700', marginTop: 17, marginBottom: isMobile ? '20px' : '28px' }}>
                Employees
            </h1>

            <div style={{ ...sectionStyle, marginBottom: '8px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '4px', color: 'var(--app-text-secondary)', fontSize: '18px' }}>Search</h3>

                <div style={{ display: 'flex', gap: '10px', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row' }}>
                    <div style={{ position: 'relative', flex: 1, width: isMobile ? '100%' : 'auto' }}>
                        <input
                            type="text"
                            placeholder="Search by employee name or ID"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ ...inputStyle, paddingRight: '28px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                        />
                        <span
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--app-text-secondary)',
                                fontSize: '11px'
                            }}
                        >
                            🔍
                        </span>
                    </div>

                    <button
                        style={{ ...detailButtonStyle, width: isMobile ? '100%' : 'auto' }}
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                    <button
                        style={{ ...detailButtonStyle, width: isMobile ? '100%' : 'auto' }}
                        onClick={() => {
                            setShowForm(true);
                            setFormMessage('');
                            setDateError('');
                        }}
                    >
                        + New
                    </button>
                </div>

            </div>

            {showForm && (
                <div style={{ ...sectionStyle, marginBottom: '8px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--app-text-secondary)', fontSize: '18px' }}>
                        New Employee
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                        <input
                            placeholder="First Name"
                            value={newEmployee.first_name}
                            onChange={(e) =>
                                setNewEmployee({ ...newEmployee, first_name: e.target.value })
                            }
                            style={inputStyle}
                        />
                        <input
                            placeholder="Last Name"
                            value={newEmployee.last_name}
                            onChange={(e) =>
                                setNewEmployee({ ...newEmployee, last_name: e.target.value })
                            }
                            style={inputStyle}
                        />
                        <select
                            value={newEmployee.gender}
                            onChange={(e) =>
                                setNewEmployee({ ...newEmployee, gender: e.target.value })
                            }
                            style={inputStyle}
                        >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                        <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: '7px', flexDirection: isMobile ? 'column' : 'row' }}>
                            <p style={{ textAlign: 'left', margin: 0, fontSize: '11px', color: 'var(--app-text-secondary)', minWidth: '72px' }}>Date of Birth</p>
                            <input
                                type="date"
                                value={newEmployee.birth_date}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setNewEmployee({ ...newEmployee, birth_date: value });

                                    if (!value || isAdult(value)) {
                                        setDateError('');
                                    }
                                }}
                                style={inputStyle}
                            />
                            {dateError && (
                                <p style={{ marginTop: '5px', marginBottom: 0, color: '#b91c1c', fontSize: '11px' }}>
                                    {dateError}
                                </p>
                            )}
                        </div>

                        <select
                            value={newEmployee.dept_name}
                            onChange={(e) => {
                                const dept = e.target.value;
                                const manager = currentManagers.find(m => m.dept_name === dept);

                                setNewEmployee({
                                    ...newEmployee,
                                    dept_name: dept,
                                    manager: manager?.manager_emp_no || ''
                                });
                            }}
                            style={inputStyle}
                        >
                            <option value="">Select Department</option>
                            <option value="Sales">Sales</option>
                            <option value="Development">Development</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Production">Production</option>
                            <option value="Quality Management">Quality Management</option>
                            <option value="Research">Research</option>
                            <option value="Customer Service">Customer Service</option>
                        </select>
                        <input
                            placeholder="Manager"
                            value={
                                newEmployee.manager
                                    ? currentManagers.find(m => m.dept_name === newEmployee.dept_name)?.manager_name || ''
                                    : ''
                            }
                            disabled
                            style={{ ...inputStyle, backgroundColor: 'var(--app-input-disabled-background)' }}
                        />
                        <select
                            value={newEmployee.title}
                            onChange={(e) =>
                                setNewEmployee({ ...newEmployee, title: e.target.value })
                            }
                            style={inputStyle}
                        >
                            <option value="">Select Job Title</option>
                            <option value="Engineer">Engineer</option>
                            <option value="Manager">Manager</option>
                            <option value="Senior Engineer">Senior Engineer</option>
                            <option value="Director">Director</option>
                            <option value="Analyst">Analyst</option>
                        </select>

                        <input
                            placeholder="Salary"
                            value={
                                newEmployee.salary
                                    ? `$${new Intl.NumberFormat('en-US').format(newEmployee.salary)}`
                                    : ''
                            }
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');

                                setNewEmployee({
                                    ...newEmployee,
                                    salary: raw
                                });
                            }}
                            style={inputStyle}
                        />
                        <div style={{ display: 'flex', alignItems: isMobile ? 'stretch' : 'center', gap: '7px', flexDirection: isMobile ? 'column' : 'row' }}>
                            <p style={{ textAlign: 'left', margin: 0, fontSize: '11px', color: 'var(--app-text-secondary)', minWidth: '54px' }}>Hire Date</p>
                            <input
                                type="date"
                                value={newEmployee.hire_date}
                                onChange={(e) =>
                                    setNewEmployee({ ...newEmployee, hire_date: e.target.value })
                                }
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px', flexWrap: 'wrap' }}>
                        <button style={detailButtonStyle} onClick={handleSaveNewEmployee}>
                            Save
                        </button>

                        <button
                            style={detailButtonStyle}
                            onClick={() => {
                                setShowForm(false);
                                setFormMessage('');
                                setDateError('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    {formMessage && (
                        <p style={{ marginTop: '10px', marginBottom: 0, color: formMessage.includes('successfully') ? '#166534' : '#b91c1c', fontSize: '13px' }}>
                            {formMessage}
                        </p>
                    )}
                </div>
            )}

            <div style={{ ...sectionStyle, marginBottom: '8px' }}>
                {/* <h3 style={{ marginTop: 0, marginBottom: '0px', color: '#6b7280' }}>Results</h3> */}
                {loading && (
                    <p style={{ marginTop: '7px', marginBottom: '7px', color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                        Loading employees...
                    </p>
                )}

                {errorMessage && (
                    <p style={{ marginTop: '7px', marginBottom: '7px', color: '#b91c1c', fontSize: '13px' }}>
                        {errorMessage}
                    </p>
                )}
                <div style={{ maxHeight: '250px', overflowY: 'auto', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--app-border)' }}>
                                <th style={{ padding: '4px 7px', textAlign: 'center' }}>ID</th>
                                <th style={{ padding: '4px 7px', textAlign: 'center' }}>Employee Name</th>
                                <th style={{ padding: '4px 7px', textAlign: 'center' }}>Department</th>
                                <th style={{ padding: '4px 7px', textAlign: 'center' }}>Hire Date</th>
                                <th style={{ padding: '4px 7px', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <tr key={employee.emp_no} style={{ borderBottom: '1px solid var(--app-border)' }}>
                                        <td style={{ fontSize: '13px', padding: '4px 7px', textAlign: 'center' }}>
                                            {employee.emp_no}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '4px 7px', textAlign: 'center' }}>
                                            {employee.first_name} {employee.last_name}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '4px 7px', textAlign: 'center' }}>{employee.dept_name}</td>
                                        <td style={{ fontSize: '13px', padding: '4px 7px', textAlign: 'center' }}>
                                            {new Date(employee.hire_date).toLocaleDateString()}
                                        </td>
                                        <td style={{ fontSize: '13px', padding: '4px 7px', textAlign: 'center' }}>
                                            <button
                                                style={
                                                    selectedEmployee?.emp_no === employee.emp_no
                                                        ? activeDetailButtonStyle
                                                        : detailButtonStyle
                                                }
                                                onClick={() => loadEmployeeDetails(employee.emp_no)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '7px', textAlign: 'center', fontSize: '13px' }}>
                                        {hasSearched ? 'No employees found' : 'Search for employees to see results here'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={sectionStyle}>
                <h3 style={{ marginTop: 0, marginBottom: 0, color: 'var(--app-text-secondary)', fontSize: '18px' }}>Employee Details</h3>

                {selectedEmployee ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '17px', flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--app-surface-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '26px',
                                color: 'var(--app-text-secondary)'
                            }}>
                                {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                            </div>

                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>
                                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                                </h3>
                                <p style={{ margin: '3px 0 0', color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                                    {selectedEmployee.title}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '14px',
                            fontSize: '13px',
                            lineHeight: 1.5
                        }}>
                            <div>
                                <p><strong>Employee ID:</strong> {selectedEmployee.emp_no}</p>
                                <p><strong>Gender:</strong> {selectedEmployee.gender}</p>
                                <p><strong>Date of Birth:</strong> {new Date(selectedEmployee.birth_date).toLocaleDateString()}</p>
                                <p><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</p>
                            </div>

                            <div>
                                <p><strong>Department:</strong> {selectedEmployee.dept_name}</p>
                                <p><strong>Manager:</strong> {selectedEmployee.manager_name || '—'}</p>
                                <p><strong>Salary:</strong> ${selectedEmployee.salary?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '10px', flexWrap: 'wrap' }}>
                            <button style={detailButtonStyle}>Edit</button>
                            <button
                                style={detailButtonStyle}
                                onClick={() => {
                                    setSelectedEmployee(null);
                                    setEmployeeHistory([]);
                                }}
                            >
                                Close
                            </button>
                        </div>

                        <div style={{ borderTop: '1px solid var(--app-border)', paddingTop: '14px', marginBottom: '17px' }}>
                            <h4 style={{ marginTop: 0, marginBottom: '10px', color: 'var(--app-text-primary)', fontSize: '15px' }}>
                                Employment History
                            </h4>

                            {historyLoading ? (
                                <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                                    Loading employment history...
                                </p>
                            ) : (
                                <div>
                                    <div style={{ border: '1px solid var(--app-border)', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'var(--app-surface)' }}>
                                        <div style={{ maxHeight: '240px', overflowY: 'auto', overflowX: 'auto' }}>
                                            <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', fontSize: '12px' }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: 'var(--app-surface-muted)', borderBottom: '1px solid var(--app-border)', position: 'sticky', top: 0 }}>
                                                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Title</th>
                                                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Salary</th>
                                                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>From Date</th>
                                                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>To Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {employeeHistory.length > 0 ? (
                                                        employeeHistory.map((record, index) => (
                                                            <tr key={`${record.title}-${record.salary}-${record.salary_from}-${index}`} style={{ borderBottom: index === employeeHistory.length - 1 ? 'none' : '1px solid var(--app-border)' }}>
                                                                <td style={{ padding: '0px 8px' }}>{record.title}</td>
                                                                <td style={{ padding: '0px 8px' }}>${Number(record.salary).toLocaleString()}</td>
                                                                <td style={{ padding: '0px 8px' }}>{formatDisplayDate(record.salary_from)}</td>
                                                                <td style={{ padding: '0px 8px' }}>{formatDisplayDate(record.salary_to)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="4" style={{ padding: '8px', textAlign: 'center', color: 'var(--app-text-secondary)' }}>
                                                                No employment history available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                        Search and select an employee to view details here.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Employees;
