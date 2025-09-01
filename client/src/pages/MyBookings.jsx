import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '../context/AppContext.jsx';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, getToken, user } = useAppContext();

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const { data } = await axios.post(
        `/api/booking/mark-paid/${bookingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      if (data.success) {
        toast.success('Booking marked as paid!');
        fetchBookings(); // Refresh the list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update booking.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (loading) return <Loading />;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      {bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{booking.show.movie.title}</h2>
              <p className="text-sm text-gray-400">
                Showtime: {new Date(booking.show.showDateTime).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">
                Seats: {booking.bookedSeats.join(', ')}
              </p>
              <p className="text-lg font-bold mt-4">Total: ${booking.amount}</p>
              {booking.isPaid ? (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mt-4 inline-block">Paid</span>
              ) : (
                <button
                  onClick={() => handlePayment(booking._id)}
                  className="bg-primary hover:bg-primary-dull text-white text-sm px-4 py-2 rounded-md mt-4 transition-colors"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>You have no bookings yet.</p>
      )}
    </div>
  );
};

export default MyBookings;
