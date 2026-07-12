export const enMessages = {
  nav: {
    home: 'Home',
    explore: 'Explore',
    sunrise: 'Sunrise',
    about: 'About',
  },

  language: {
    english: 'EN',
    ukrainian: 'UK',
  },

  home: {
    airportCameraTitle: 'Madeira Airport live camera',
    airportCameraDescription: 'FNC / LPMA · runway and weather conditions.',
    live: 'LIVE',
    flightTitle: 'Track a flight to Madeira',
    flightDescription:
      'Enter a flight number to check its live status and position on Flightradar24.',
    flightPlaceholder: 'Example: TP1685 or FR3824',
    flightAriaLabel: 'Flight number',
    trackFlight: 'Track flight',
    allCameras: 'All cameras',
  },

  exploreList: {
    eyebrow: 'Explore Madeira',
    title: 'Places to explore around Madeira',
    intro:
      'Browse viewpoints, mountain hikes, levada walks, beaches, gardens and coastal places across Madeira.',
    browseByInterest: 'Browse by interest',
    showing: 'Showing',
    of: 'of',
    places: 'places',
    readGuide: 'Read the guide →',
    pageTitle: 'Explore Madeira | Viewpoints, Hikes, Beaches & Places',
    pageDescription:
      'Explore Madeira’s best viewpoints, hiking trails, beaches, gardens and places to visit, from Pico do Arieiro to Porto Moniz.',
    filterAriaLabel: 'Filter locations',
    locationsAriaLabel: 'Madeira locations',
    filters: {
      all: 'All',
      viewpoints: 'Viewpoints',
      hiking: 'Hiking',
      beaches: 'Beaches',
      cityCulture: 'City & culture',
      levadaWalks: 'Levada walks',
    },
  },

  location: {
    back: '← Back to Explore Madeira',
    history: 'History and character',
    whyVisit: 'Why visit',
    practicalTip: 'Practical tip',
    openMaps: 'Open in Google Maps',
    pageTitleSuffix: 'Madeira Travel Guide',
    ogTitleSuffix: 'Madeira',
  },

  weatherGuide: {
    pageTitle: 'Pico do Arieiro Sunrise Forecast | Madeira Live Cams',
    pageDescription:
      'Check the next 7 sunrise forecasts for Pico do Arieiro, Madeira. See low, mid and high cloud cover, rain chance, wind and sunrise conditions.',
    ogDescription:
      'Plan your Pico do Arieiro sunrise with a 7-day cloud, rain and wind forecast.',
    eyebrow: 'Madeira mountain weather',
    title: 'Pico do Arieiro Sunrise Forecast',
    intro:
      'Next seven sunrise forecasts at 1,818 m, starting tomorrow. Check clouds, rain and wind before planning an early mountain visit.',
    loading: 'Loading the 7-day sunrise forecast…',
    errorFallback: 'Could not load the sunrise forecast.',
    errorRetry: 'Please try again shortly.',
    sunrise: 'Sunrise',
    conditionsAtSunrise: 'Conditions at sunrise',
    lowClouds: 'Low clouds',
    midClouds: 'Mid clouds',
    highClouds: 'High clouds',
    rainChance: 'Rain chance',
    windAtSunrise: 'Wind at sunrise',
    openWindy: 'Open in Windy',
    guidance:
      'Forecast guidance only. Mountain weather and cloud cover can change quickly; check the live Pico do Arieiro camera before leaving.',
    ratings: {
      excellent: {
        title: 'Excellent',
        description: 'Strong chance of a clear and calm sunrise.',
      },
      good: {
        title: 'Good',
        description: 'Good sunrise potential; wind may affect comfort.',
      },
      cloudyRisk: {
        title: 'Cloudy risk',
        description: 'Rain risk often means cloudier conditions at sunrise.',
      },
      mixed: {
        title: 'Mixed',
        description: 'Cloud layers may reduce visibility or colour.',
      },
    },
  },
} as const;