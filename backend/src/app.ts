import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { courtRoutes, priceRoutes } from './routes/courtRoutes';
import { amenityRoutes, notificationRoutes, reviewRoutes } from './routes/miscRoutes';
import venueRoutes from './routes/venueRoutes';
import { errorHandler } from './utils/http';

export const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/amenities', amenityRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/price-rules', priceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use((_req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));
app.use(errorHandler);
