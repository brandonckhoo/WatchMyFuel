const BASE = 'https://fppdirectapi-prod.fuelpricesqld.com.au';
const TOKEN = 'FPDAPI SubscriberToken=07e05b7e-684d-4b40-a334-e99a6b618b1e';
const PARAMS = 'countryId=21&geoRegionLevel=3&geoRegionId=1';

// FuelId → display name (from /Subscriber/GetCountryFuelTypes)
const FUEL_ID_MAP = {
  2: 'U91',     // Unleaded
  5: 'U95',     // Premium Unleaded 95
  8: 'U98',     // Premium Unleaded 98
  12: 'E10',    // e10
  3: 'Diesel',  // Diesel
  6: 'Diesel',  // ULSD
};

export default async function handler(req, res) {
  try {
    const headers = { 'Authorization': TOKEN };

    const [brandsRes, sitesRes, pricesRes] = await Promise.all([
      fetch(`${BASE}/Subscriber/GetCountryBrands?countryId=21`, { headers }),
      fetch(`${BASE}/Subscriber/GetFullSiteDetails?${PARAMS}`, { headers }),
      fetch(`${BASE}/Price/GetSitesPrices?${PARAMS}`, { headers }),
    ]);

    if (!brandsRes.ok || !sitesRes.ok || !pricesRes.ok) {
      throw new Error(`API error: brands=${brandsRes.status} sites=${sitesRes.status} prices=${pricesRes.status}`);
    }

    const [brandsData, sitesData, pricesData] = await Promise.all([
      brandsRes.json(), sitesRes.json(), pricesRes.json()
    ]);

    // BrandId → Name
    const brandMap = {};
    (brandsData.Brands || []).forEach(b => { brandMap[b.BrandId] = b.Name; });

    // SiteId → site details
    const siteMap = {};
    (sitesData.S || []).forEach(s => {
      const brand = brandMap[s.B] || 'Unknown';
      const name = s.N || '';
      // Extract suburb by stripping brand prefix from site name (e.g. "BP Narangba" → "Narangba")
      const suburb = name.startsWith(brand) ? name.slice(brand.length).trim() : name;
      siteMap[s.S] = { name, brand, address: s.A || '', postcode: s.P || '', suburb, lat: s.Lat, lng: s.Lng };
    });

    // Merge prices with site details
    const data = (pricesData.SitePrices || []).map(sp => {
      const fuelType = FUEL_ID_MAP[sp.FuelId];
      if (!fuelType) return null;
      const site = siteMap[sp.SiteId];
      if (!site) return null;
      const price = sp.Price / 10; // tenths of a cent → c/L
      if (price < 50 || price > 500) return null;
      return { ...site, fuelType, price, date: sp.TransactionDateUtc || '' };
    }).filter(Boolean);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
