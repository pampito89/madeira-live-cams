import type { Locale } from './config';

type WeatherUi = {
  intlLocale: string;
  windUnit: string;
  legend: {
    title: string;
    sunrise: string;
    lowClouds: string;
    midClouds: string;
    highClouds: string;
    rain: string;
    wind: string;
    arrow: string;
  };
};

export const weatherUi: Record<Locale, WeatherUi> = {
  en: {
    intlLocale: 'en-GB',
    windUnit: 'km/h',
    legend: {
      title: 'Forecast symbols',
      sunrise: 'sunrise time',
      lowClouds: 'low clouds',
      midClouds: 'mid-level clouds',
      highClouds: 'high clouds',
      rain: 'rain probability',
      wind: 'wind speed and direction',
      arrow: 'the blue arrow shows wind direction',
    },
  },
  pt: {
    intlLocale: 'pt-PT',
    windUnit: 'km/h',
    legend: {
      title: 'Símbolos da previsão',
      sunrise: 'hora do nascer do sol',
      lowClouds: 'nuvens baixas',
      midClouds: 'nuvens médias',
      highClouds: 'nuvens altas',
      rain: 'probabilidade de chuva',
      wind: 'velocidade e direção do vento',
      arrow: 'a seta azul mostra a direção do vento',
    },
  },
  de: {
    intlLocale: 'de-DE',
    windUnit: 'km/h',
    legend: {
      title: 'Symbole der Vorhersage',
      sunrise: 'Zeit des Sonnenaufgangs',
      lowClouds: 'tiefe Wolken',
      midClouds: 'mittlere Wolken',
      highClouds: 'hohe Wolken',
      rain: 'Regenwahrscheinlichkeit',
      wind: 'Windgeschwindigkeit und -richtung',
      arrow: 'der blaue Pfeil zeigt die Windrichtung',
    },
  },
  fr: {
    intlLocale: 'fr-FR',
    windUnit: 'km/h',
    legend: {
      title: 'Symboles des prévisions',
      sunrise: 'heure du lever du soleil',
      lowClouds: 'nuages bas',
      midClouds: 'nuages moyens',
      highClouds: 'nuages hauts',
      rain: 'probabilité de pluie',
      wind: 'vitesse et direction du vent',
      arrow: 'la flèche bleue indique la direction du vent',
    },
  },
  es: {
    intlLocale: 'es-ES',
    windUnit: 'km/h',
    legend: {
      title: 'Símbolos de la previsión',
      sunrise: 'hora del amanecer',
      lowClouds: 'nubes bajas',
      midClouds: 'nubes medias',
      highClouds: 'nubes altas',
      rain: 'probabilidad de lluvia',
      wind: 'velocidad y dirección del viento',
      arrow: 'la flecha azul muestra la dirección del viento',
    },
  },
  pl: {
    intlLocale: 'pl-PL',
    windUnit: 'km/h',
    legend: {
      title: 'Oznaczenia prognozy',
      sunrise: 'godzina wschodu słońca',
      lowClouds: 'niskie chmury',
      midClouds: 'średnie chmury',
      highClouds: 'wysokie chmury',
      rain: 'prawdopodobieństwo deszczu',
      wind: 'prędkość i kierunek wiatru',
      arrow: 'niebieska strzałka pokazuje kierunek wiatru',
    },
  },
  uk: {
    intlLocale: 'uk-UA',
    windUnit: 'км/год',
    legend: {
      title: 'Позначення у прогнозі',
      sunrise: 'час сходу сонця',
      lowClouds: 'нижні хмари',
      midClouds: 'середні хмари',
      highClouds: 'високі хмари',
      rain: 'імовірність дощу',
      wind: 'швидкість і напрямок вітру',
      arrow: 'синя стрілка показує напрямок вітру',
    },
  },
};
