import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition duration-300">
              Countries Explorer
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
                <>
                  <Link to="/favorites" className="hover:text-gray-200 transition duration-300">
                    Favorites
                  </Link>
                  <button
                      onClick={logout}
                      className="hover:text-gray-200 transition duration-300"
                  >
                    Logout
                  </button>
                </>
            ) : (
                <>
                  <Link to="/login" className="hover:text-gray-200 transition duration-300">
                    Login
                  </Link>
                  <Link to="/register" className="hover:text-gray-200 transition duration-300">
                    Register
                  </Link>
                </>
            )}
          </div>
        </div>
      </nav>
  );
}

export default Navbar;