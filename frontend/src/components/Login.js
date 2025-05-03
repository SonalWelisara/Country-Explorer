import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
      <div className="flex justify-center items-center mt-16 bg-gray-100">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-medium">Email</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-gray-700 font-medium">Password</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
              />
            </div>
            <button
                type="submit"
                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition duration-300 mt-8 mb-4"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium underline">
              Register
            </Link>
          </p>
        </div>
      </div>
  );
}

export default Login;