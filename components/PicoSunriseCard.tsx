import { useText } from '../lib/i18n/TranslationProvider';
import React, { useEffect, useState } from 'react';
const DESKTOP_BG = '/images/pico-radar-desktop.png';
const MOBILE_BG = '/images/pico-radar-mobile.png';
export const PicoSunriseCard: React.FC = () => {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
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
    return (<section style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '1.5rem',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 18px 40px rgba(0, 0, 0, 0.35)',
            maxWidth: '640px',
            margin: '0 auto',
        }}>
      <div style={{
            background: 'linear-gradient(135deg, rgba(0, 80, 60, 0.9), rgba(0, 60, 40, 0.95))',
            borderRadius: '1.25rem',
            padding: '20px 20px 18px',
            backdropFilter: 'blur(8px)',
        }}>
        <p style={{
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            marginBottom: '8px',
            opacity: 0.9,
        }}>{localize("\u041F\u043E\u0433\u043E\u0434\u0430 \u0432 \u0433\u043E\u0440\u0430\u0445 \u041C\u0430\u0434\u0435\u0439\u0440\u0438")}</p>

        <h2 style={{
            fontSize: '1.4rem',
            lineHeight: 1.25,
            fontWeight: 700,
            marginBottom: '12px',
        }}>{localize("\u041F\u0440\u043E\u0433\u043D\u043E\u0437 \u0441\u0445\u043E\u0434\u0443 \u0441\u043E\u043D\u0446\u044F \u043D\u0430 \u041F\u0456\u043A\u0443-\u0434\u0443-\u0410\u0440\u0456\u0435\u0439\u0440\u0443")}</h2>

        <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.5,
            opacity: 0.95,
        }}>{localize("\u041F\u0440\u043E\u0433\u043D\u043E\u0437 \u043D\u0430 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0456 \u0441\u0456\u043C \u0441\u0432\u0456\u0442\u0430\u043D\u043A\u0456\u0432 \u043D\u0430 \u0432\u0438\u0441\u043E\u0442\u0456 1&nbsp;818&nbsp;\u043C, \u043F\u043E\u0447\u0438\u043D\u0430\u044E\u0447\u0438 \u0456\u0437 \u0437\u0430\u0432\u0442\u0440\u0430\u0448\u043D\u044C\u043E\u0433\u043E \u0434\u043D\u044F. \u041F\u0435\u0440\u0435\u0432\u0456\u0440\u044F\u0439\u0442\u0435 \u0445\u043C\u0430\u0440\u043D\u0456\u0441\u0442\u044C, \u0434\u043E\u0449 \u0456 \u0432\u0456\u0442\u0435\u0440 \u043F\u0435\u0440\u0435\u0434 \u0440\u0430\u043D\u043D\u044C\u043E\u044E \u043F\u043E\u0457\u0437\u0434\u043A\u043E\u044E \u0432 \u0433\u043E\u0440\u0438.")}</p>
      </div>
    </section>);
};
