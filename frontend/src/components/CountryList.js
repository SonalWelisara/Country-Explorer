import {useState, useEffect, useContext} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

const API_URL = 'https://restcountries.com/v3.1';
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function CountryList() {
    const [countries, setCountries] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('');
    const [language, setLanguage] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingCountryCode, setLoadingCountryCode] = useState(null);
    const {user} = useContext(AuthContext);

    useEffect(() => {
        fetchCountries().then(() => fetchFavourites());
    }, [region, language]);

    const fetchFavourites = () => {
        if (user) {
            axios
                .get(`${backendUrl}/api/favorites`, {withCredentials: true})
                .then((res) => {
                    console.log('Favorites data:', res.data);
                    setFavorites(res.data);
                })
                .catch((err) => console.error('Error fetching favorites:', err))
                .finally(() => setLoadingCountryCode(null));
        } else {
            setLoadingCountryCode(null);
        }
    };

    const fetchCountries = async () => {
        setLoading(true);
        try {
            let url = `${API_URL}/all`;
            if (region) url = `${API_URL}/region/${region}`;
            const res = await axios.get(url);
            let filtered = res.data;
            if (language) {
                filtered = filtered.filter((country) =>
                    Object.values(country.languages || {}).includes(language)
                );
            }
            setCountries(filtered);
        } catch (error) {
            console.error('Error fetching countries:', error);
            setCountries([]);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!search) return fetchCountries();
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/name/${search}`);
            setCountries(res.data);
        } catch (error) {
            console.error('Error searching countries:', error);
            setCountries([]);
        }
        setLoading(false);
    };

    const addFavorite = async (countryCode) => {
        if (!user) return alert('Please log in to add favorites');
        setLoadingCountryCode(countryCode);
        try {
            await axios.post(
                `${backendUrl}/api/favorites`,
                {countryCode},
                {withCredentials: true}
            ).then(() => fetchFavourites());
        } catch (error) {
            console.error('Error adding favorite:', error);
        }
    };

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Countries Explorer</h1>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow">
                <input
                    type="text"
                    placeholder="Search by country name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Select region"
                >
                    <option value="">All Regions</option>
                    <option value="Africa">Africa</option>
                    <option value="Americas">Americas</option>
                    <option value="Asia">Asia</option>
                    <option value="Europe">Europe</option>
                    <option value="Oceania">Oceania</option>
                </select>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Select language"
                >
                    <option value="">All Languages</option>
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                </select>
                <button
                    onClick={handleSearch}
                    className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition duration-300"
                >
                    Search
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
                         role="status"
                         aria-label="Loading countries"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {countries.map((country) => (
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
                            <p className="text-gray-600">
                                <strong>Population:</strong> {country.population.toLocaleString()}</p>
                            <p className="text-gray-600">
                                <strong>Languages:</strong> {Object.values(country.languages || {}).join(', ')}</p>
                            <div className="mt-4 flex justify-between items-center">
                                <Link
                                    to={`/country/${country.cca3}`}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-300"
                                >
                                    View Details
                                </Link>
                                {user && (
                                    loadingCountryCode === country.cca3 ? (
                                        <div className="w-6 h-6" role="status"
                                             aria-label={`Loading favorite for ${country.name.common}`}>
                                            <div
                                                className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => addFavorite(country.cca3)}
                                            className="relative w-6 h-6 transition duration-300"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className="w-6 h-6"
                                                fill={favorites.some(fav => fav.cca3 === country.cca3) ? 'rgb(236 72 153)' : 'rgb(209 213 219)'} // pink-500 or gray-300
                                            >
                                                <path
                                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                            </svg>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CountryList;