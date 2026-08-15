import React, { useEffect, useState } from 'react';

const DESKTOP_BG = '/images/pico-radar-desktop.png';
const MOBILE_BG = '/images/pico-radar-mobile.png';

export const PicoSunriseCard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Визначаємо мобільний розмір екрану на клієнті
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const backgroundImage = isMobile ? MOBILE_BG : DESKTOP_BG;

  return (
    <section
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '1.5rem',
        padding: '24px',
        color: '#ffffff',
        boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
        maxWidth: '640px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          background:
            'linear-gradient(135deg, rgba(0, 80, 60, 0.9), rgba(0, 60, 40, 0.95))',
          borderRadius: '1.25rem',
          padding: '20px 20px 18px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p
          style={{
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.9,
          }}
        >
          Погода в горах Мадейри
        </p>

        <h2
          style={{
            fontSize: '1.4rem',
            lineHeight: 1.25,
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          Прогноз сходу сонця на Піку-ду-Аріейру
        </h2>

        <p
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.5,
            opacity: 0.95,
          }}
        >
          Прогноз на наступні сім світанків на висоті 1&nbsp;818&nbsp;м, починаючи із
          завтрашнього дня. Перевіряйте хмарність, дощ і вітер перед ранньою
          поїздкою в гори.
        </p>
      </div>
    </section>
  );
};