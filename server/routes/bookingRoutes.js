import express from 'express';
import { createBooking, getOccupiedSeats, markBookingPaid } from '../controllers/bookingController.js';

const bookingRouter = express.Router();


bookingRouter.post('/create', createBooking);
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.post('/mark-paid/:bookingId', markBookingPaid);

export default bookingRouter;