
# Countries Explorer

Welcome to the Countries Explorer, a React-based web application that allows users to browse country information, view detailed country data, and manage favorite countries. This project leverages the REST Countries API for country data and includes a simple authentication context for managing favorites.


## Features

- Browse a list of countries with filters by name, region, and language.
- View detailed information about a specific country (e.g., capital, region, population).
- Add and remove countries from a favorites list (requires login).
- Responsive design with a modern UI using Tailwind CSS.
- Unit and integration tests using Jest and React Testing Library.
- Navigation between country lists, details, and favorites pages.


## Prerequisites

- Node.js: v16.x or later
- npm: v8.x or later (comes with Node.js)
- Git: For cloning the repository
- Backend Server: A local server running at http://localhost:5000 for favorites API (optional for full functionality)
## Installation

Clone the repository:

```bash
git clone https://github.com/SE1020-IT2070-OOP-DSA-25/af-2-SonalWelisara.git
```
Install dependencies: (run both)

```bash
cd backend
npm install
```
```bash
cd frontend
npm install
```
## Build Process
Go to the backend

```bash
  cd backend
  npm start
```

Go to the frontend

```bash
  cd frontend
  npm start
```

Start the server

```bash
  npm run start
```
Open your browser and navigate to http://localhost:3000

## Usage Instructions
### Country List Page:
- Use the search input to filter by country name.
 - Select a region or language from the dropdowns to filter the list.
 - Click "View Details" to navigate to a country's details page.

### Country Details Page:
- View detailed information (e.g., capital, population, languages).
- Click "Back to List" to return to the country list.

### Favorites Page:
- Log in to view or manage your favorite countries.
- Click the heart icon to add/remove a country from favorites.
- Click "View Details" to see a favorite country's details.

### Navigation:
- Use the nav bar links ("Countries Explorer", "Login", "Register") to navigate.
## Running Tests

To run tests, run the following command

```bash
  cd frontend
  npm test
```

