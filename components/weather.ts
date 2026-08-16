export type WeatherSnapshot = {
  temperature?: number;
  apparentTemperature?: number;
  windSpeed?: number;
  cloudCover?: number;
  precipitation?: number;
  weatherCode?: number;
};

export async function fetchWeatherSnapshot(
  lat: number,
  lon: number,
): Promise<WeatherSnapshot | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current:
        'temperature_2m,apparent_temperature,wind_speed_10m,cloud_cover,precipitation,weather_code',
      wind_speed_unit: 'kmh',
      timezone: 'auto',
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const current = data.current;

    if (!current) {
      return null;
    }

    return {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      cloudCover: current.cloud_cover,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
    };
  } catch {
    return null;
  }
}