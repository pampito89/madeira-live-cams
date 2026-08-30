export type Stay = {
  slug: string;
  name: string;
  shortDescription: {
    en: string;
    uk: string;
  };
  latitude: number;
  longitude: number;
  mapUrl: string;
};

export const stays: Stay[] = [
  {
    slug: 'villa-kent',
    name: 'Villa Kent',
    shortDescription: {
      en: 'A stay in Monte, above Funchal, providing a practical starting and finishing point for a day on Madeira.',
      uk: 'Вілла в районі Monte над Фуншалом — зручна стартова та фінальна точка для дня на Мадейрі.',
    },
    latitude: 32.6677516,
    longitude: -16.9143168,
    mapUrl: 'https://www.google.com/maps/place/R.+Prof.+Betencourt+Rodrigues+9,+Monte,+9050-510+Funchal/@32.6678377,-16.9140102,237m/data=!3m1!1e3!4m6!3m5!1s0xc605fd8250270f5:0x8c7ab85a9d1b36a6!8m2!3d32.6677516!4d-16.9143168!16s%2Fg%2F11sv82bp9b?entry=ttu&g_ep=EgoyMDI2MDgyNi4wIKXMDSoASAFQAw%3D%3D',
  },
  {
    slug: 'casa-da-faja-alta-1',
    name: 'Casa da Fajã Alta 1',
    shortDescription: {
      en: 'A stay in the Fajã Alta area, suitable as a base for exploring the north and east of Madeira.',
      uk: 'Вілла в районі Fajã Alta, яка підходить як база для подорожей північчю та сходом Мадейри.',
    },
    latitude: 32.817914,
    longitude: -16.901772,
    mapUrl: 'https://www.google.com/maps/place/Casa+da+Faj%C3%A3+Alta+1,+Double+Room+With+Breakfast/@32.8177173,-16.8988298,944m/data=!3m1!1e3!4m9!3m8!1s0xc6068060af3008f:0x139a1200d9cdf90!5m2!4m1!1i2!8m2!3d32.817914!4d-16.901772!16s%2Fg%2F11vxh3mzcx?entry=ttu&g_ep=EgoyMDI2MDgyNi4wIKXMDSoASAFQAw%3D%3D',
  },
  {
    slug: 'villas-mediterraneo',
    name: 'Villas Mediterrâneo',
    shortDescription: {
      en: 'A villa stay in Caniço, on Madeira’s east side, with convenient access to coastal routes and Funchal.',
      uk: 'Комплекс вілл у Caniço на сході Мадейри, зі зручним доступом до узбережжя та Фуншала.',
    },
    latitude: 32.6602699,
    longitude: -16.8240705,
    mapUrl: 'https://www.google.com/maps/place/Villas+Mediterr%C3%A2neo/@32.6602122,-16.8242757,118m/data=!3m1!1e3!4m6!3m5!1s0xc6061f0cfc74dc3:0xb40008c8d3e58c1a!8m2!3d32.6602699!4d-16.8240705!16s%2Fg%2F11c2kf09vg?entry=ttu&g_ep=EgoyMDI2MDgyNi4wIKXMDSoASAFQAw%3D%3D',
  },
  {
    slug: 'quinta-santo-antonio-da-serra',
    name: 'Quinta Santo Antonio da Serra',
    shortDescription: {
      en: 'A stay in Santo António da Serra, a useful base for routes in eastern and central Madeira.',
      uk: 'Вілла в Santo António da Serra — зручна база для маршрутів східною та центральною Мадейрою.',
    },
    latitude: 32.7236258,
    longitude: -16.8178741,
    mapUrl: 'https://www.google.com/maps/place/Quinta+Santo+Antonio+da+Serra/@32.7253127,-16.7915338,10696m/data=!3m1!1e3!4m9!3m8!1s0xc6061587ff73f91:0x15820c875181db4e!5m2!4m1!1i2!8m2!3d32.7236258!4d-16.8178741!16s%2Fg%2F1v2y_37f?entry=ttu&g_ep=EgoyMDI2MDgyNi4wIKXMDSoASAFQAw%3D%3D',
  },
];

export function getStayBySlug(slug: string) {
  return stays.find((stay) => stay.slug === slug);
}