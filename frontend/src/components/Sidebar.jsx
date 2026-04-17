import { NavLink } from 'react-router-dom';
import staffIcon from '../assets/logo.png';
import incidentsIcon from '../assets/document.png';
import incidentsActiveIcon from '../assets/document (white).png';
import departmentsIcon from '../assets/department-structure.png';
import departmentsActiveIcon from '../assets/department-structure (white).png';
import employeesIcon from '../assets/employees.png';
import employeesActiveIcon from '../assets/employees (white).png';
import dashboardIcon from '../assets/dashboard-monitor.png';
import dashboardActiveIcon from '../assets/dashboard-monitor (white).png';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: dashboardIcon, activeIcon: dashboardActiveIcon },
  { to: '/employees', label: 'Employees', icon: employeesIcon, activeIcon: employeesActiveIcon },
  { to: '/departments', label: 'Departments', icon: departmentsIcon, activeIcon: departmentsActiveIcon },
  { to: '/incidents', label: 'Incidents', icon: incidentsIcon, activeIcon: incidentsActiveIcon }
];

function Sidebar({ isCollapsed, isMobile = false, isOpen = false, onToggle, onClose }) {
  const { darkMode } = useTheme();
  const shouldCollapse = isMobile ? false : isCollapsed;
  const desktopSidebarWidth = shouldCollapse ? 50 : 160;
  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: shouldCollapse ? '0' : '5px',
    padding: shouldCollapse ? '5px' : '1px 5px',
    marginBottom: '8px',
    fontSize: '14px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'var(--app-sidebar-muted-text)',
    backgroundColor: isActive ? '#11a9cc' : 'transparent',
    borderRadius: '8px',
    fontWeight: isActive ? '600' : '400',
    transition: 'background-color 0.2s ease, color 0.2s ease, padding 0.2s ease'
  });

  return (
    <aside
      style={{
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 0 : 'auto',
        left: isMobile ? 0 : 'auto',
        bottom: isMobile ? 0 : 'auto',
        width: isMobile ? '220px' : shouldCollapse ? '50px' : '160px',
        backgroundColor: 'var(--app-sidebar-background)',
        color: 'var(--app-sidebar-text)',
        padding: isMobile ? '20px 16px' : shouldCollapse ? '18px 10px' : '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        transition: isMobile ? 'transform 0.25s ease' : 'width 0.25s ease, padding 0.25s ease',
        boxSizing: 'border-box',
        borderRight: darkMode ? '1px solid var(--app-border)' : 'none',
        transform: isMobile ? `translateX(${isOpen ? '0' : '-100%'})` : 'none',
        zIndex: isMobile ? 30 : 'auto',
        boxShadow: isMobile ? 'var(--app-shadow)' : 'none'
      }}
    >
      <button
        type="button"
        onClick={isMobile ? onClose : onToggle}
        style={{
          position: 'absolute',
          top: isMobile ? '12px' : '90vh',
          bottom: isMobile ? 'auto' : 'auto',
          right: '5px',
          transform: isMobile ? 'none' : 'translateY(-10%)',
          width: isMobile ? '28px' : '10px',
          height: isMobile ? '28px' : '50px',
          border: 'none',
          borderRadius: isMobile ? '8px' : '999px',
          backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.08)' : 'var(--app-sidebar-background)',
          color: 'var(--app-sidebar-muted-text)',
          cursor: 'pointer',
          fontSize: isMobile ? '18px' : '30px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
        aria-label={isMobile ? 'Close sidebar' : shouldCollapse ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isMobile ? 'Close sidebar' : shouldCollapse ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isMobile ? '×' : shouldCollapse ? '›' : '‹'}
      </button>

      <h2
        style={{
          fontSize: shouldCollapse ? '0px' : '20px',
          color: 'var(--app-sidebar-text)',
          fontWeight: '700',
          marginTop: 0,
          marginBottom: shouldCollapse ? '12px' : isMobile ? '20px' : '24px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          transition: 'font-size 0.2s ease, margin-bottom 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px'
        }}
      >
        {shouldCollapse ? '' : (
          <>
            <img
              src={staffIcon}
              alt="icon"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
            EMS
          </>
        )}
      </h2>

      <nav style={{ marginTop: shouldCollapse ? '8px' : isMobile ? '24px' : '12px', width: '100%' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={linkStyle}
            title={shouldCollapse ? item.label : ''}
            onClick={isMobile ? onClose : undefined}
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? item.activeIcon : item.icon}
                  alt={item.label}
                  style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }}
                />
                {!shouldCollapse && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
