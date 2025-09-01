import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';

const ListShows = () => {
    const currency = import.meta.env.VITE_CURRENCY
    const { axios, getToken, user } = useAppContext()
    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // New state for handling errors

    const getAllShows = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get("/api/admin/all-shows", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setShows(data.shows);
            } else {
                setError("Failed to retrieve shows. The API response was not successful.");
                console.error("API response was not successful:", data.message);
            }
        } catch (err) {
            setError("There was a problem fetching the shows. Please try again later.");
            console.error("Failed to fetch shows:", err);
        } finally {
            setLoading(false); // This ensures loading is always set to false
        }
    };

    useEffect(() => {
        if (user) {
            getAllShows();
        }
    }, [user]);

    // Conditional rendering based on loading and error states
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="text-center text-red-500 mt-10">
                <p className="text-lg font-semibold">{error}</p>
                <p className="text-sm mt-2">Check the console for more details.</p>
            </div>
        );
    }

    return (
        <>
            <Title text1="List" text2="Shows" />
            <div className="max-w-4xl mt-6 overflow-x-auto">
                <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
                    <thead>
                        <tr className="bg-primary/20 text-left text-white">
                            <th className="p-2 font-medium pl-5">Movie Name</th>
                            <th className="p-2 font-medium">Show Time</th>
                            <th className="p-2 font-medium">Total Bookings</th>
                            <th className="p-2 font-medium">Earnings</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-light">
                        {shows.map((show, index) => (
                            <tr key={index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
                                <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>
                                <td className="p-2">{dateFormat(show.showDateTime)}</td>
                                <td className="p-2">{Object.keys(show.occupiedSeats).length}</td>
                                <td className="p-2">{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default ListShows;