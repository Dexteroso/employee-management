import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentDepartmentManagers,
  getDepartments,
  getDepartmentEmployees
} from '../services/departmentsService';
import { useResponsive } from '../hooks/useResponsive';

const SALARY_RANGE_OPTIONS = [
  { value: 'all', label: 'Salary Range' },
  { value: '0-39999', label: '0 - 39,999' },
  { value: '40000-59999', label: '40,000 - 59,999' },
  { value: '60000-79999', label: '60,000 - 79,999' },
  { value: '80000-99999', label: '80,000 - 99,999' },
  { value: '100000-119999', label: '100,000 - 119,999' },
  { value: '120000-139999', label: '120,000 - 139,999' },
  { value: '140000+', label: '140,000+' }
];

const HIRE_DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'Hire Date Range' },
  { value: 'before-1990', label: 'Before 1990' },
  { value: '1990-1994', label: '1990 - 1994' },
  { value: '1995-1999', label: '1995 - 1999' },
  { value: '2000+', label: '2000+' }
];

function Departments() {
  const { isTablet, isMobile, isSmallMobile } = useResponsive();
  const navigate = useNavigate();
  const PAGE_SIZE = 25;
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [departmentTitleOptions, setDepartmentTitleOptions] = useState(['all']);
  const [departmentManagers, setDepartmentManagers] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [averageSalaryValue, setAverageSalaryValue] = useState(null);
  const [mostCommonTitleValue, setMostCommonTitleValue] = useState(null);
  const [employeeIdFilter, setEmployeeIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('all');
  const [salaryRangeFilter, setSalaryRangeFilter] = useState('all');
  const [hireDateRangeFilter, setHireDateRangeFilter] = useState('all');

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoadingDepartments(true);
        const [departmentsResult, managersResult] = await Promise.all([
          getDepartments(),
          getCurrentDepartmentManagers()
        ]);
        setDepartments(departmentsResult.data);
        setDepartmentManagers(managersResult.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setErrorMessage('Unable to load departments. Please try again.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadPageData();
  }, []);

  const handleDepartmentChange = (deptNo) => {
    setSelectedDepartment(deptNo);
    setDepartmentEmployees([]);
    setDepartmentTitleOptions(['all']);
    setCurrentPage(1);
    setTotalEmployees(0);
    setTotalPages(1);
    setAverageSalaryValue(null);
    setMostCommonTitleValue(null);
    setErrorMessage('');
    setEmployeeIdFilter('');
    setNameFilter('');
    setTitleFilter('all');
    setSalaryRangeFilter('all');
    setHireDateRangeFilter('all');

    if (!deptNo) {
      return;
    }
  };

  const clearFilters = () => {
    setEmployeeIdFilter('');
    setNameFilter('');
    setTitleFilter('all');
    setSalaryRangeFilter('all');
    setHireDateRangeFilter('all');
    setCurrentPage(1);
  };

  const sectionStyle = {
    backgroundColor: 'var(--app-surface)',
    borderRadius: '12px',
    padding: '17px',
    boxShadow: 'var(--app-shadow)'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--app-input-border)',
    borderRadius: '8px',
    boxSizing: 'border-box',
    color: 'var(--app-input-text)',
    backgroundColor: 'var(--app-input-background)',
    fontSize: '13px'
  };

  const selectInputStyle = (hasValue) => ({
    ...inputStyle,
    color: hasValue ? 'var(--app-input-text)' : 'var(--app-text-secondary)'
  });

  const tableCellStyle = {
    padding: '6px 2px',
    textAlign: 'center',
    fontSize: '12px'
  };

  const stickyHeaderCellStyle = {
    ...tableCellStyle,
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--app-surface-muted)',
    zIndex: 1
  };

  const summaryCardStyle = {
    border: '1px solid var(--app-border)',
    borderRadius: '10px',
    padding: '10px 10px',
    backgroundColor: 'var(--app-surface-muted)',
    minWidth: '90px'
  };

  const formatSalary = (salary) => {
    if (salary === null || salary === undefined || salary === '') {
      return '—';
    }

    return `$${Number(salary).toLocaleString('en-US')}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return '—';
    }

    return new Date(value).toLocaleDateString('en-CA');
  };

  const calculateTenure = (hireDate) => {
    if (!hireDate) {
      return '—';
    }

    const start = new Date(hireDate);
    const now = new Date();
    const years = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
    return `${years.toFixed(1)} years`;
  };

  const currentManager = useMemo(
    () => departmentManagers.find((manager) => manager.dept_no === selectedDepartment),
    [departmentManagers, selectedDepartment]
  );

  const averageSalary = useMemo(() => {
    if (averageSalaryValue === null || averageSalaryValue === undefined) {
      return '—';
    }
    return formatSalary(Math.round(averageSalaryValue));
  }, [averageSalaryValue]);

  const mostCommonTitle = useMemo(() => {
    return mostCommonTitleValue || '—';
  }, [mostCommonTitleValue]);

  useEffect(() => {
    if (!selectedDepartment) {
      return;
    }

    const loadDepartmentEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setErrorMessage('');
        const result = await getDepartmentEmployees(selectedDepartment, {
          page: currentPage,
          limit: PAGE_SIZE,
          employeeId: employeeIdFilter,
          name: nameFilter,
          title: titleFilter,
          salaryRange: salaryRangeFilter,
          hireDateRange: hireDateRangeFilter
        });

        setDepartmentEmployees(result.data || []);
        setDepartmentTitleOptions(['all', ...(result.titleOptions || [])]);
        setTotalEmployees(result.total || 0);
        setTotalPages(result.totalPages || 1);
        setCurrentPage(result.currentPage || 1);
        setAverageSalaryValue(result.summary?.averageSalary ?? null);
        setMostCommonTitleValue(result.summary?.mostCommonTitle ?? null);
      } catch (error) {
        console.error('Error fetching department employees:', error);
        setErrorMessage('Unable to load department employees. Please try again.');
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadDepartmentEmployees();
  }, [
    PAGE_SIZE,
    currentPage,
    employeeIdFilter,
    hireDateRangeFilter,
    nameFilter,
    salaryRangeFilter,
    selectedDepartment,
    titleFilter
  ]);

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? '34px' : '43px', color: 'var(--app-text-primary)', fontWeight: '700', marginTop: 17, marginBottom: isMobile ? '20px' : '28px' }}>
        Departments
      </h1>

      <div style={{ ...sectionStyle, marginBottom: '10px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', color: 'var(--app-text-secondary)', fontSize: '18px' }}>
          Department Employees
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : 'minmax(180px, 220px) minmax(0, 1fr)', gap: '14px', alignItems: 'stretch', marginBottom: '14px' }}>
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              disabled={loadingDepartments}
              style={selectInputStyle(Boolean(selectedDepartment))}
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'Select a department'}
              </option>
              {departments.map((department) => (
                <option key={department.dept_no} value={department.dept_no}>
                  {department.dept_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr' : isTablet ? 'repeat(2, minmax(100px, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: '10px', padding: isTablet ? '0' : '0px 10px', minWidth: 0 }}>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>Total Employees</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--app-text-primary)' }}>{totalEmployees}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>Manager Name</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text-primary)' }}>{currentManager?.manager_name || '—'}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>Average Salary</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--app-text-primary)' }}>{averageSalary}</div>
            </div>
            <div style={summaryCardStyle}>
              <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', marginBottom: '4px' }}>Common Title</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--app-text-primary)' }}>{mostCommonTitle}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) max-content', gap: '10px', marginBottom: '14px', alignItems: 'stretch' }}>
          <input
            placeholder="Search by ID"
            value={employeeIdFilter}
            onChange={(e) => {
              setEmployeeIdFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={inputStyle}
          />
          <input
            placeholder="Search by Name"
            value={nameFilter}
            onChange={(e) => {
              setNameFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={inputStyle}
          />
          <select value={titleFilter} onChange={(e) => {
            setTitleFilter(e.target.value);
            setCurrentPage(1);
          }} style={selectInputStyle(titleFilter !== 'all')}>
            {departmentTitleOptions.map((title) => (
              <option key={title} value={title}>
                {title === 'all' ? 'Roles' : title}
              </option>
            ))}
          </select>
          <select value={salaryRangeFilter} onChange={(e) => {
            setSalaryRangeFilter(e.target.value);
            setCurrentPage(1);
          }} style={selectInputStyle(salaryRangeFilter !== 'all')}>
            {SALARY_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === 'all' ? 'Salary' : option.label}
              </option>
            ))}
          </select>
          <select value={hireDateRangeFilter} onChange={(e) => {
            setHireDateRangeFilter(e.target.value);
            setCurrentPage(1);
          }} style={selectInputStyle(hireDateRangeFilter !== 'all')}>
            {HIRE_DATE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.value === 'all' ? 'Hire Date' : option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#11a9cc',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            Clear Filters
          </button>
        </div>

        {errorMessage && (
          <p style={{ marginTop: 0, marginBottom: '10px', color: '#b91c1c', fontSize: '13px' }}>
            {errorMessage}
          </p>
        )}

        {!selectedDepartment ? (
          <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '13px' }}>
            Select a department to view employees
          </p>
        ) : loadingEmployees ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 0',
              color: 'var(--app-text-secondary)',
              fontSize: '13px'
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid var(--app-input-border)',
                borderTopColor: '#11a9cc',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}
            />
            Loading department employees...
          </div>
        ) : (
          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '420px', border: '1px solid var(--app-border)', borderRadius: '8px' }}>
            <table style={{ width: '100%', minWidth: isTablet ? '900px' : '100%', borderCollapse: 'collapse', fontSize: '13px', tableLayout: isTablet ? 'auto' : 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--app-border)', backgroundColor: 'var(--app-surface-muted)' }}>
                  <th style={stickyHeaderCellStyle}>Emp ID</th>
                  <th style={{ ...stickyHeaderCellStyle, width: '140px', maxWidth: '140px' }}>Full Name</th>
                  <th style={{ ...stickyHeaderCellStyle, width: '100px', maxWidth: '100px' }}>Title</th>
                  <th style={stickyHeaderCellStyle}>Salary</th>
                  <th style={stickyHeaderCellStyle}>Hire Date</th>
                  <th style={stickyHeaderCellStyle}>Tenure</th>
                  <th style={stickyHeaderCellStyle}>Last Update</th>
                  <th style={stickyHeaderCellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {departmentEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '10px', textAlign: 'center', color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                      No employees match the current filters
                    </td>
                  </tr>
                ) : (
                  departmentEmployees.map((employee) => (
                    <tr key={employee.emp_no} style={{ borderBottom: '1px solid var(--app-border)' }}>
                      <td style={tableCellStyle}>{employee.emp_no}</td>
                      <td
                        style={{
                          ...tableCellStyle,
                          width: '140px',
                          maxWidth: '140px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={`${employee.first_name} ${employee.last_name}`}
                      >
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td style={tableCellStyle}>{employee.title ?? '—'}</td>
                      <td style={tableCellStyle}>{formatSalary(employee.salary)}</td>
                      <td style={tableCellStyle}>{formatDate(employee.hire_date)}</td>
                      <td style={tableCellStyle}>{calculateTenure(employee.hire_date)}</td>
                      <td style={tableCellStyle}>{formatDate(employee.salary_from || employee.title_from)}</td>
                      <td style={tableCellStyle}>
                        <button
                          type="button"
                          onClick={() => navigate(`/employees?emp_no=${employee.emp_no}`)}
                          style={{
                            padding: '4px 10px',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: '#11a9cc',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
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
        )}

        {selectedDepartment && !loadingEmployees && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage <= 1}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: currentPage <= 1 ? 'var(--app-surface-muted)' : '#11a9cc',
                color: currentPage <= 1 ? 'var(--app-text-secondary)' : '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Prev
            </button>
            <span style={{ fontSize: '13px', color: 'var(--app-text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage >= totalPages}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: currentPage >= totalPages ? 'var(--app-surface-muted)' : '#11a9cc',
                color: currentPage >= totalPages ? 'var(--app-text-secondary)' : '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Departments;
