import { useEffect, useMemo, useState } from 'react';

function WeatherWidget() {
  const [weather, setWeather] = useState({
    temperature: null,
    city: '',
    hasError: false
  });

  const formattedDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const city = import.meta.env.VITE_WEATHER_CITY || 'Monterrey';
    const units = import.meta.env.VITE_WEATHER_UNITS || 'metric';

    const loadWeather = async () => {
      if (!apiKey) {
        setWeather({
          temperature: null,
          city,
          hasError: true
        });
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        setWeather({
          temperature: Math.round(data.main?.temp ?? 0),
          city: data.name || city,
          hasError: false
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }

        console.error('Error loading weather widget:', error);
        setWeather({
          temperature: null,
          city,
          hasError: true
        });
      }
    };

    loadWeather();

    return () => controller.abort();
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '5px',
        padding: '0 10px',
        borderRadius: '12px',
        minWidth: '150px'
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--app-text-secondary)' }}>
        {weather.city || 'Weather'},
      </div>
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--app-text-primary)' }}>
        {weather.hasError || weather.temperature === null ? '--°C' : `${weather.temperature}°C`}.
      </div>
      <div style={{ fontSize: '10px', color: 'var(--app-text-secondary)' }}>
        {formattedDate}
      </div>
    </div>
  );
}

export default WeatherWidget;
