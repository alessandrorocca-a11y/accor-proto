export interface City {
  name: string;
  country: string;
}

export const EUROPEAN_CITIES: City[] = [
  // France
  { name: 'Paris', country: 'France' },
  { name: 'Lyon', country: 'France' },
  { name: 'Marseille', country: 'France' },
  { name: 'Nice', country: 'France' },
  { name: 'Bordeaux', country: 'France' },
  { name: 'Toulouse', country: 'France' },
  { name: 'Strasbourg', country: 'France' },
  { name: 'Lille', country: 'France' },
  { name: 'Cannes', country: 'France' },
  { name: 'Montpellier', country: 'France' },

  // Spain
  { name: 'Barcelona', country: 'Spain' },
  { name: 'Madrid', country: 'Spain' },
  { name: 'Sevilla', country: 'Spain' },
  { name: 'Valencia', country: 'Spain' },
  { name: 'Malaga', country: 'Spain' },
  { name: 'Bilbao', country: 'Spain' },
  { name: 'Granada', country: 'Spain' },
  { name: 'San Sebastián', country: 'Spain' },

  // Italy
  { name: 'Rome', country: 'Italy' },
  { name: 'Milan', country: 'Italy' },
  { name: 'Florence', country: 'Italy' },
  { name: 'Venice', country: 'Italy' },
  { name: 'Naples', country: 'Italy' },
  { name: 'Turin', country: 'Italy' },
  { name: 'Bologna', country: 'Italy' },

  // Germany
  { name: 'Berlin', country: 'Germany' },
  { name: 'Munich', country: 'Germany' },
  { name: 'Hamburg', country: 'Germany' },
  { name: 'Frankfurt', country: 'Germany' },
  { name: 'Düsseldorf', country: 'Germany' },
  { name: 'Cologne', country: 'Germany' },

  // United Kingdom
  { name: 'London', country: 'United Kingdom' },
  { name: 'Manchester', country: 'United Kingdom' },
  { name: 'Edinburgh', country: 'United Kingdom' },
  { name: 'Birmingham', country: 'United Kingdom' },
  { name: 'Liverpool', country: 'United Kingdom' },
  { name: 'Glasgow', country: 'United Kingdom' },
  { name: 'Bristol', country: 'United Kingdom' },

  // Portugal
  { name: 'Lisbon', country: 'Portugal' },
  { name: 'Porto', country: 'Portugal' },
  { name: 'Faro', country: 'Portugal' },

  // Netherlands
  { name: 'Amsterdam', country: 'Netherlands' },
  { name: 'Rotterdam', country: 'Netherlands' },
  { name: 'The Hague', country: 'Netherlands' },

  // Belgium
  { name: 'Brussels', country: 'Belgium' },
  { name: 'Antwerp', country: 'Belgium' },
  { name: 'Bruges', country: 'Belgium' },

  // Switzerland
  { name: 'Zurich', country: 'Switzerland' },
  { name: 'Geneva', country: 'Switzerland' },
  { name: 'Basel', country: 'Switzerland' },

  // Austria
  { name: 'Vienna', country: 'Austria' },
  { name: 'Salzburg', country: 'Austria' },
  { name: 'Innsbruck', country: 'Austria' },

  // Greece
  { name: 'Athens', country: 'Greece' },
  { name: 'Thessaloniki', country: 'Greece' },
  { name: 'Mykonos', country: 'Greece' },
  { name: 'Santorini', country: 'Greece' },

  // Poland
  { name: 'Warsaw', country: 'Poland' },
  { name: 'Kraków', country: 'Poland' },
  { name: 'Gdańsk', country: 'Poland' },

  // Czech Republic
  { name: 'Prague', country: 'Czech Republic' },
  { name: 'Brno', country: 'Czech Republic' },

  // Sweden
  { name: 'Stockholm', country: 'Sweden' },
  { name: 'Gothenburg', country: 'Sweden' },

  // Denmark
  { name: 'Copenhagen', country: 'Denmark' },

  // Norway
  { name: 'Oslo', country: 'Norway' },
  { name: 'Bergen', country: 'Norway' },

  // Finland
  { name: 'Helsinki', country: 'Finland' },

  // Ireland
  { name: 'Dublin', country: 'Ireland' },
  { name: 'Cork', country: 'Ireland' },

  // Hungary
  { name: 'Budapest', country: 'Hungary' },

  // Croatia
  { name: 'Zagreb', country: 'Croatia' },
  { name: 'Dubrovnik', country: 'Croatia' },
  { name: 'Split', country: 'Croatia' },

  // Romania
  { name: 'Bucharest', country: 'Romania' },

  // Turkey
  { name: 'Istanbul', country: 'Turkey' },

  // Monaco
  { name: 'Monaco', country: 'Monaco' },
];

/** The city selected/active in the current session */
export const CURRENT_CITY = 'Paris';
export const CURRENT_COUNTRY = 'France';

/** Get cities in the same country as the current city */
export function getNearbyCities(country: string): City[] {
  return EUROPEAN_CITIES.filter((c) => c.country === country);
}

/** Search all European cities by name or country */
export function searchCities(query: string): City[] {
  const q = query.toLowerCase();
  return EUROPEAN_CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  );
}
