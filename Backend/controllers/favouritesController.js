const axios = require('axios');
const User = require('../models/user.model');

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const favorites = [];
    for (const code of user.favorites) {
      const response = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`);
      favorites.push(response.data[0]);
    }
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

const addFavorite = async (req, res) => {
  const { countryCode } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(countryCode);

    if (index === -1) {
      // Not in favorites, add it
      user.favorites.push(countryCode);
      await user.save();
      return res.json({ message: 'Added to favorites' });
    } else {
      // Already in favorites, remove it
      user.favorites.splice(index, 1);
      await user.save();
      return res.json({ message: 'Removed from favorites' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding favorite', error: error.message });
  }
};

module.exports = { getFavorites, addFavorite };