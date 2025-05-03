import {useState, useEffect} from 'react';
import {Link, useParams} from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://restcountries.com/v3.1';

function CountryDetail() {
    const {id} = useParams();
    const [country, setCountry] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCountry = async () => {
            try {
                const res = await axios.get(`${API_URL}/alpha/${id}`);
                setCountry(res.data[0]);
            } catch (error) {
                console.error('Error fetching country:', error);
                setCountry(null);
            } finally {
                setLoading(false);
            }
        };
        fetchCountry();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
                 role="status"
                 aria-label="Loading country details"></div>
        </div>
    );

    if (!country) return <p className="text-center text-gray-600">Country not found</p>;

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <Link
                to="/"
                className="text-purple-600 hover:text-purple-800 font-medium underline mb-6 inline-block"
            >
                Back to List
            </Link>
            <div
                className="bg-gradient-to-br from-purple-100 to-blue-100 p-6 rounded-lg shadow-lg border border-gray-200">
                <img
                    src={country.flags.png}
                    alt={`${country.name.common} flag`}
                    className="max-w-full h-64 object-contain mb-6 bg-gray-200 mx-auto rounded-lg"
                />
                <h1 className="text-4xl font-bold text-gray-800 mb-6">{country.name.common}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Column 1: Name Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">General</h2>
                        <p className="text-gray-600 mb-2">
                            <strong>Official Name:</strong> {country.name.official}
                        </p>
                        <p className="text-gray-600">
                            <strong>Common Name:</strong> {country.name.common}
                        </p>
                    </div>
                    {/* Column 2: Geographic Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Geography</h2>
                        <p className="text-gray-600 mb-2">
                            <strong>Capital:</strong> {country.capital?.[0] || 'N/A'}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Region:</strong> {country.region}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Subregion:</strong> {country.subregion || 'N/A'}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Area:</strong> {country.area?.toLocaleString() || 'N/A'} km²
                        </p>
                        <p className="text-gray-600">
                            <strong>Borders:</strong> {country.borders?.length ? country.borders.join(', ') : 'None'}
                        </p>
                    </div>
                    {/* Column 3: Cultural/Economic Details */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Culture & Economy</h2>
                        <p className="text-gray-600 mb-2">
                            <strong>Population:</strong> {country.population.toLocaleString()}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Languages:</strong> {Object.values(country.languages || {}).join(', ') || 'N/A'}
                        </p>
                        <p className="text-gray-600 mb-2">
                            <strong>Currencies:</strong>{' '}
                            {Object.values(country.currencies || {})
                                .map((c) => `${c.name} (${c.symbol || 'N/A'})`)
                                .join(', ') || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                            <strong>Timezones:</strong> {country.timezones?.join(', ') || 'N/A'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CountryDetail;