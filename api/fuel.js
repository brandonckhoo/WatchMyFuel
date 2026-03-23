export default async function handler(req, res) {
  try {
    const response = await fetch(
      'https://fppdirectapi-prod.fuelpricesqld.com.au/Price/GetFullDownload?countryId=21',
      { headers: { 'Authorization': 'FPDAPI SubscriberToken=07e05b7e-684d-4b40-a334-e99a6b618b1e' } }
    );
    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream API error: ${response.status}` });
    }
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
