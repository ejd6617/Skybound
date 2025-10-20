import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import placesRoutes from './routes/places.js';

const app = express();

app.use(cors());               // allow mobile dev requests
app.use(express.json());

app.use('/api/places', rateLimit({ windowMs: 60_000, max: 60 }), placesRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on :${port}`));