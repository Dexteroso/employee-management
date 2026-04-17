import { getDashboardSummary } from '../services/dashboardService';
import { useEffect, useMemo, useState } from 'react';
import employeesIcon from '../assets/employees (white).png';
import departmentsIcon from '../assets/department-structure (white).png';
import incidentsIcon from '../assets/document (white).png';
import salaryIcon from '../assets/user-salary.png';
import { useResponsive } from '../hooks/useResponsive';
import {
    Bar,
    BarChart,
    Cell,
    LabelList,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';

const KPI_CONFIG = [
    {
        key: 'totalEmployees',
        label: 'Total Employees',
        icon: employeesIcon,
        accent: '#565294',
        format: (value) => value?.toLocaleString() || '...'
    },
    {
        key: 'totalDepartments',
        label: 'Departments',
        icon: departmentsIcon,
        accent: '#005496',
        format: (value) => value || '...'
    },
    {
        key: 'activeIncidents',
        label: 'Active Incidents',
        icon: incidentsIcon,
        accent: '#23d2aa',
        format: (value) => value || '...'
    },
    {
        key: 'averageSalary',
        label: 'Average Salary',
        icon: salaryIcon,
        accent: '#ff7f43',
        format: (value) => (value ? `$${Number(value).toLocaleString('en-US')}` : '...')
    }
];

const DEPARTMENT_LABELS = {
    'Customer Service': 'Customer Svc',
    'Human Resources': 'HR',
    'Quality Management': 'Quality Mgmt'
};

function Dashboard() {
    const [data, setData] = useState(null);
    const { isTablet, isMobile } = useResponsive();
    const dashboardRowGap = '14px';
    const hiresGridColumns = '34px minmax(0, 1.45fr) minmax(0, 1.15fr) minmax(96px, auto)';
    const incidentsGridColumns = 'minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(132px, 140px)';

    useEffect(() => {
        async function loadDashboard() {
            try {
                const result = await getDashboardSummary();
                setData(result.data);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }

        loadDashboard();
    }, []);

    useEffect(() => {
        document.title = 'Employee Management System';
    }, []);

    const sectionStyle = {
        backgroundColor: 'var(--app-surface)',
        borderRadius: '12px',
        padding: '0px 10px',
        boxShadow: 'var(--app-shadow)'
    };

    const panelTitleStyle = {
        margin: 0,
        marginTop: '14px',
        fontSize: '17px',
        fontWeight: '600',
        color: 'var(--app-text-secondary)'
    };

    const badgeStyle = (status) => {
        const base = {
            padding: '0px 8px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '600',
            whiteSpace: 'nowrap'
        };

        if (status === 'Active') {
            return { ...base, backgroundColor: '#fef3c7', color: '#92400e' };
        }
        if (status === 'In Progress') {
            return { ...base, backgroundColor: '#dbeafe', color: '#1e40af' };
        }
        if (status === 'Closed') {
            return { ...base, backgroundColor: '#dcfce7', color: '#166534' };
        }

        return base;
    };

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        return new Date(value).toLocaleDateString('en-CA');
    };

    const initials = (firstName = '', lastName = '') =>
        `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

    const newHires = useMemo(() => {
        const hires = data?.recentHires || [];
        return [...hires]
            .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
            .slice(0, 6);
    }, [data]);

    const departmentMetrics = useMemo(() => data?.departmentMetrics || [], [data]);
    const laborCostData = useMemo(
        () => [...departmentMetrics].sort((a, b) => b.total_cost - a.total_cost),
        [departmentMetrics]
    );
    const averageSalaryData = useMemo(
        () => [...departmentMetrics].sort((a, b) => b.avg_salary - a.avg_salary),
        [departmentMetrics]
    );
    const axisStyle = {
        fontSize: 11,
        fill: 'var(--app-text-secondary)'
    };

    const chartTrackColors = {
        laborCost: '#005496',
        averageSalary: '#23d2aa',
        turnover: '#ea580c'
    };

    const departmentTick = ({ x, y, payload }) => (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill="var(--app-text-body)" fontSize="11" fontWeight="600">
                {DEPARTMENT_LABELS[payload.value] || payload.value}
            </text>
        </g>
    );

    const chartSectionStyle = {
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))',
        gap: dashboardRowGap,
        marginTop: '20px',
        marginBottom: '20px'
    };

    const chartCardStyle = {
        ...sectionStyle,
        padding: '10px',
        minWidth: 0
    };

    const chartTitleStyle = {
        margin: 0,
        color: 'var(--app-text-primary)',
        fontSize: '16px',
        fontWeight: '700'
    };

    const chartSubtitleStyle = {
        margin: '3px 0 0',
        color: 'var(--app-text-secondary)',
        fontSize: '12px'
    };

    const renderMetricChart = ({ title, subtitle, dataSet, barColor, valueKey, formatter, height = 280 }) => (
        <div style={chartCardStyle}>
            <div style={{ marginBottom: '8px', textAlign: 'left' }}>
                <h3 style={chartTitleStyle}>
                    {title}
                    {subtitle ? (
                        <span style={{ marginLeft: '4px', color: chartSubtitleStyle.color, fontSize: chartSubtitleStyle.fontSize, fontWeight: chartTitleStyle.fontWeight }}>
                            {subtitle}
                        </span>
                    ) : null}
                </h3>
            </div>
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataSet}
                        layout="vertical"
                        margin={{ top: 4, right: 48, left: 14, bottom: 4 }}
                        barCategoryGap={2}
                    >
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="dept_name"
                            width={120}
                            interval={0}
                            axisLine={false}
                            tickLine={false}
                            tick={departmentTick}
                        />
                        <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} barSize={24}>
                            {dataSet.map((entry) => (
                                <Cell key={`${title}-${entry.dept_no}`} fill={barColor} />
                            ))}
                            <LabelList
                                dataKey={valueKey}
                                position="right"
                                offset={10}
                                formatter={formatter}
                                style={{ fill: 'var(--app-text-body)', fontSize: 11, fontWeight: 700 }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <div>
            <h1 style={{ fontSize: isMobile ? '34px' : '43px', color: 'var(--app-text-primary)', fontWeight: '700', marginTop: 17, marginBottom: isMobile ? '20px' : '28px' }}>
                Dashboard
            </h1>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: dashboardRowGap,
                    marginBottom: '20px'
                }}
            >
                {KPI_CONFIG.map((item) => (
                    <div
                        key={item.key}
                        style={{
                            ...sectionStyle,
                            minHeight: '70px',
                            minWidth: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isMobile ? 'center' : 'flex-start',
                            gap: '14px',
                            textAlign: 'left',
                            flexDirection: 'row',
                            padding: isMobile ? '14px 10px' : sectionStyle.padding
                        }}
                    >
                        <div
                            style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '12px',
                                backgroundColor: item.accent,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            <img
                                src={item.icon}
                                alt={item.label}
                                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                            />
                        </div>

                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--app-text-secondary)', marginBottom: '5px' }}>
                                {item.label}
                            </p>
                            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--app-text-primary)', lineHeight: 1.1 }}>
                                {data ? item.format(data[item.key]) : '...'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isTablet ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: dashboardRowGap
                }}
            >
                <div style={{ ...sectionStyle, minWidth: 0 }}>
                    <h3 style={panelTitleStyle}>New Hired Employees</h3>
                    <div style={{ maxHeight: '320px', padding: isMobile ? '8px 4px 4px' : '5px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
                        {!isMobile && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: hiresGridColumns,
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '0 0 8px',
                                    borderBottom: '1px solid var(--app-border)',
                                    marginBottom: '2px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'var(--app-text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                    minWidth: isTablet ? '430px' : 0
                                }}
                            >
                                <span />
                                <span>Name</span>
                                <span>Department</span>
                                <span>Hire Date</span>
                            </div>
                        )}
                        {newHires.length ? (
                            newHires.map((employee, index) => (
                                <div
                                    key={`${employee.emp_no}-${index}`}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: isMobile ? 'stretch' : 'center',
                                        gap: '10px',
                                        padding: isMobile ? '10px 0' : '1px 0',
                                        borderBottom: index === newHires.length - 1 ? 'none' : '1px solid var(--app-border)'
                                    }}
                                >
                                    {isMobile ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, width: '100%', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--app-surface-muted)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        color: 'var(--app-text-secondary)',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {initials(employee.first_name, employee.last_name)}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--app-text-body)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {employee.first_name} {employee.last_name}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)' }}>
                                                {employee.dept_name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)' }}>
                                                {formatDate(employee.hire_date)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: hiresGridColumns, alignItems: 'center', gap: '10px', minWidth: isTablet ? '430px' : 0, flex: 1 }}>
                                            <div
                                                style={{
                                                    width: '25px',
                                                    height: '25px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--app-surface-muted)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '700',
                                                    color: 'var(--app-text-secondary)',
                                                    flexShrink: 0
                                                }}
                                            >
                                                {initials(employee.first_name, employee.last_name)}
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--app-text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {employee.first_name} {employee.last_name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {employee.dept_name}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                                {formatDate(employee.hire_date)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                                No hires available.
                            </p>
                        )}
                    </div>
                </div>

                <div style={{ ...sectionStyle, minWidth: 0 }}>
                    <h3 style={panelTitleStyle}>Recent Incidents</h3>
                    <div style={{ maxHeight: '320px', padding: isMobile ? '8px 4px 4px' : '5px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
                        {!isMobile && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: incidentsGridColumns,
                                    alignItems: 'center',
                                    columnGap: '10px',
                                    padding: '0 0 8px',
                                    borderBottom: '1px solid var(--app-border)',
                                    marginBottom: '2px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: 'var(--app-text-secondary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                    minWidth: isTablet ? '430px' : 0
                                }}
                            >
                                <span style={{ textAlign: 'center' }}>Employee</span>
                                <span style={{ textAlign: 'center' }}>Incident Type</span>
                                <span style={{ justifySelf: 'center', textAlign: 'center' }}>Status</span>
                            </div>
                        )}
                        {data?.recentIncidencias?.length ? (
                            data.recentIncidencias.slice(0, 6).map((incident, index) => (
                                isMobile ? (
                                    <div
                                        key={incident.id_incidencia}
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            padding: '10px 0',
                                            borderBottom: index === data.recentIncidencias.slice(0, 6).length - 1 ? 'none' : '1px solid var(--app-border)',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--app-text-body)' }}>
                                            {incident.first_name} {incident.last_name}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', minWidth: 0 }}>
                                                {incident.tipo}
                                            </div>
                                            <span style={{ ...badgeStyle(incident.estatus), flexShrink: 0 }}>
                                                {incident.estatus}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={incident.id_incidencia}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: incidentsGridColumns,
                                            alignItems: 'center',
                                            columnGap: '10px',
                                            padding: '2px 0',
                                            borderBottom: index === data.recentIncidencias.slice(0, 6).length - 1 ? 'none' : '1px solid var(--app-border)',
                                            minWidth: isTablet ? '430px' : 0
                                        }}
                                    >
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--app-text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, textAlign: 'center' }}>
                                            {incident.first_name} {incident.last_name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'var(--app-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, textAlign: 'center' }}>
                                            {incident.tipo}
                                        </div>

                                        <span style={{ ...badgeStyle(incident.estatus), justifySelf: 'center', textAlign: 'center' }}>
                                            {incident.estatus}
                                        </span>
                                    </div>
                                )
                            ))
                        ) : (
                            <p style={{ margin: 0, color: 'var(--app-text-secondary)', fontSize: '13px' }}>
                                No recent incidents available.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div style={chartSectionStyle}>
                {renderMetricChart({
                    title: 'Labor Cost by Department',
                    subtitle: '(in Millions)',
                    dataSet: laborCostData,
                    barColor: chartTrackColors.laborCost,
                    valueKey: 'total_cost',
                    formatter: (value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
                })}
                {renderMetricChart({
                    title: 'Average Salary by Department',
                    dataSet: averageSalaryData,
                    barColor: chartTrackColors.averageSalary,
                    valueKey: 'avg_salary',
                    formatter: (value) => `$${Number(value).toLocaleString('en-US')}`
                })}
            </div>
        </div>
    );
}

export default Dashboard;
