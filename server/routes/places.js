import axios from 'axios';
import express from 'express';

const router = express.Router();

/**
 * GET /api/places/airports-nearby?lat=..&lng=..&radius=..
 * radius in meters (default 30000)
 */
router.get('/airports-nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 30000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const params = new URLSearchParams({
      key: process.env.GOOGLE_PLACES_KEY,
      location: `${lat},${lng}`,
      radius: String(radius),
      type: 'airport',
    });

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 8000 });

    const airports = (data.results || []).map(r => ({
      id: r.place_id,
      name: r.name,
      lat: r.geometry?.location?.lat,
      lng: r.geometry?.location?.lng,
      address: r.vicinity || r.formatted_address,
      rating: r.rating,
      userRatingsTotal: r.user_ratings_total,
    }));

    res.json({ airports, status: data.status });
  } catch (e) {
    console.error(e.message);
    res.status(500).json({ error: 'Failed to fetch nearby airports' });
  }
});

export default router;