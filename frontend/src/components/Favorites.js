import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCountryCode, setLoadingCountryCode] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            setLoading(true);
            axios
                .get(`${backendUrl}/api/favorites`, { withCredentials: true })
                .then((res) => {
                    console.log('Favorites data:', res.data);
                    setFavorites(res.data);
                })
                .catch((err) => {
                    console.error('Error fetching favorites:', err);
                    setFavorites([]);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user) return <p className="text-center text-gray-600 mt-6">Please log in to view favorites.</p>;

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
                 role="status"
                 aria-label="Loading favorite"></div>
        </div>
    );

    const addFavorite = async (countryCode) => {
        if (!user) return alert('Please log in to add favorites');
        setLoadingCountryCode(countryCode);
        try {
            await axios.post(
                `${backendUrl}/api/favorites`,
                { countryCode },
                { withCredentials: true }
            ).then((res) => {
                if (res.data.message === 'Removed from favorites') {
                    setFavorites(favorites.filter(fav => fav.cca3 !== countryCode));
                } else {
                    setFavorites([...favorites, favorites.find(fav => fav.cca3 === countryCode) || { cca3: countryCode }]);
                }
            });
        } catch (error) {
            console.error('Error adding favorite:', error);
        } finally {
            setLoadingCountryCode(null);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Favorite Countries</h1>
            {favorites.length === 0 ? (
                <p className="text-center text-gray-600">No favorite countries yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((country) => (
                        <div
                            key={country.cca3}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
                        >
                            <img
                                src={country.flags.png}
                                alt={`${country.name.common} flag`}
                                className="w-full h-48 object-cover mb-4 rounded-lg"
                            />
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{country.name.common}</h2>
                            <p className="text-gray-600"><strong>Capital:</strong> {country.capital?.[0] || 'N/A'}</p>
                            <p className="text-gray-600"><strong>Region:</strong> {country.region}</p>
                            <p className="text-gray-600"><strong>Population:</strong> {country.population.toLocaleString()}</p>
                            <p className="text-gray-600"><strong>Languages:</strong> {Object.values(country.languages || {}).join(', ')}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <Link
                                    to={`/country/${country.cca3}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-300"
                                >
                                    View Details
                                </Link>
                                {loadingCountryCode === country.cca3 ? (
                                    <div className="w-6 h-6">
                                        <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"
                                             role="status"
                                             aria-label="Loading favorite toggle"></div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => addFavorite(country.cca3)}
                                        className="relative w-6 h-6 transition duration-300"
                                        aria-label="Favorite"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className="w-6 h-6"
                                            fill={favorites.some(fav => fav.cca3 === country.cca3) ? 'rgb(236 72 153)' : 'rgb(209 213 219)'}
                                        >
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favorites;