import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import WeatherWidget from '../components/WeatherWidget';
import { useTheme } from '../context/ThemeContext';
import darkModeIcon from '../assets/dark-mode-alt.png';
import lightModeIcon from '../assets/light-mode-alt.png';
import logoIcon from '../assets/logo.png';
import { useResponsive } from '../hooks/useResponsive';

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { isTablet, isMobile } = useResponsive();

  useEffect(() => {
    if (!isTablet) {
      setIsMobileSidebarOpen(false);
    }
  }, [isTablet]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--app-background)' }}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobile={isTablet}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onToggle={() => {
          if (isTablet) {
            setIsMobileSidebarOpen((current) => !current);
            return;
          }

          setIsSidebarCollapsed((current) => !current);
        }}
      />
      {isTablet && isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 25
          }}
        />
      )}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
          backgroundColor: 'var(--app-background)',
          color: 'var(--app-text-body)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '24px' }}>
            {isTablet && (
              <>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen((current) => !current)}
                  aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  title={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: '1px solid var(--app-border)',
                    backgroundColor: 'var(--app-surface)',
                    backgroundColor: 'transparent',
                    color: 'var(--app-text-primary)',
                    cursor: 'pointer',
                    boxShadow: 'var(--app-shadow)',
                    fontSize: '18px',
                    fontWeight: '700',
                    padding: 0
                  }}
                >
                  ☰
                </button>
                <img
                  src={logoIcon}
                  alt="EMS logo"
                  style={{ width: '24px', height: '24px', objectFit: 'contain', display: 'block' }}
                />
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <WeatherWidget />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                border: 'none',
                backgroundColor: 'transparent',
                boxShadow: 'none',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <img
                src={darkMode ? lightModeIcon : darkModeIcon}
                alt=""
                style={{ width: '18px', height: '18px', objectFit: 'contain', display: 'block' }}
              />
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
