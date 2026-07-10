
export type WeatherSnapshot = {
  temperature?: number;
  apparentTemperature?: number;
  windSpeed?: number;
  cloudCover?: number;
  precipitation?: number;
  weatherCode?: number;
};

export async function fetchWeatherSnapshot(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current_weather: 'true',
    });
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.current_weather) return null;
    const cw = data.current_weather;
    return {
      temperature: cw.temperature,
      windSpeed: cw.windspeed,
      weatherCode: cw.weathercode,
    };
  } catch (e) {
    return null;
  }
}
