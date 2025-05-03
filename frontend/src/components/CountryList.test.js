import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import CountryList from './CountryList';
import { AuthContext } from '../context/AuthContext';
import React from 'react';

// Setup axios mock
const mock = new MockAdapter(axios);

// Mock country data
const mockCountries = [
  {
    cca3: 'CAN',
    name: { common: 'Canada' },
    flags: { png: 'https://flagcdn.com/ca.png' },
    capital: ['Ottawa'],
    region: 'Americas',
    population: 37742154,
    languages: { eng: 'English', fra: 'French' },
  },
  {
    cca3: 'BRA',
    name: { common: 'Brazil' },
    flags: { png: 'https://flagcdn.com/br.png' },
    capital: ['Brasília'],
    region: 'Americas',
    population: 212559417,
    languages: { por: 'Portuguese' },
  },
];

describe('CountryList Component (No User)', () => {
  beforeEach(() => {
    mock.reset();
  });

  // Unit Test: Renders loading state initially
  test('renders loading state initially', async () => {
    // Introduce a delay to ensure the loading state is captured
    mock.onGet('https://restcountries.com/v3.1/all').reply(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([200, mockCountries]), 100);
      });
    });

    render(
        <AuthContext.Provider value={{ user: null }}>
          <MemoryRouter>
            <CountryList />
          </MemoryRouter>
        </AuthContext.Provider>
    );

    // Check for the spinner immediately after rendering
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Wait for the data to load to ensure the test completes
    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  // Unit Test: Renders countries after data is loaded
  test('renders countries after data is loaded', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter>
              <CountryList />
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      // Verify country names are present
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();

      // Scope assertions to Canada's card
      const canadaCard = screen.getByText('Canada').closest('div.bg-white');
      const withinCanada = within(canadaCard);
      expect(withinCanada.getByText((content, element) => {
        return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Capital: Ottawa';
      })).toBeInTheDocument();
      expect(withinCanada.getByText((content, element) => {
        return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Region: Americas';
      })).toBeInTheDocument();
      expect(withinCanada.getByText((content, element) => {
        return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Population: 37,742,154';
      })).toBeInTheDocument();
      expect(withinCanada.getByText((content, element) => {
        return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Languages: English, French';
      })).toBeInTheDocument();
    });

    // Verify no favorite button is rendered
    expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
  });

  // Unit Test: Handles search functionality
  test('filters countries based on search input', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);
    mock.onGet('https://restcountries.com/v3.1/name/Canada').reply(200, [mockCountries[0]]);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter>
              <CountryList />
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by country name');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Canada' } });
      fireEvent.click(screen.getByText('Search'));
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  // Unit Test: Filters by region
  test('filters countries by region', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);
    mock.onGet('https://restcountries.com/v3.1/region/Americas').reply(200, mockCountries);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter>
              <CountryList />
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });

    const regionSelect = screen.getByRole('combobox', { name: /Select region/i });
    await act(async () => {
      fireEvent.change(regionSelect, { target: { value: 'Americas' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });
  });

  // Unit Test: Filters by language
  test('filters countries by language', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter>
              <CountryList />
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });

    const languageSelect = screen.getByRole('combobox', { name: /Select language/i });
    await act(async () => {
      fireEvent.change(languageSelect, { target: { value: 'English' } });
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  // Unit Test: Handles API error
  test('displays empty list on API error', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(500);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter>
              <CountryList />
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      expect(screen.queryByText('Canada')).not.toBeInTheDocument();
      expect(screen.queryByText('Brazil')).not.toBeInTheDocument();
    });
  });

  // Integration Test: Navigates to country details page
  test('navigates to country details page on clicking view details', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter initialEntries={['/countries']}>
              <Routes>
                <Route path="/countries" element={<CountryList />} />
                <Route path="/country/:cca3" element={<div>Country Details Page</div>} />
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });

    const viewDetailsLink = screen.getAllByRole('link', { name: /View Details/i })[0]; // Canada's link
    await act(async () => {
      fireEvent.click(viewDetailsLink);
    });

    expect(screen.getByText('Country Details Page')).toBeInTheDocument();
  });

  // Integration Test: Combines search, filter, and navigation
  test('combines search, filter, and navigation', async () => {
    mock.onGet('https://restcountries.com/v3.1/all').reply(200, mockCountries);
    mock.onGet('https://restcountries.com/v3.1/region/Americas').reply(200, mockCountries);
    mock.onGet('https://restcountries.com/v3.1/name/Brazil').reply(200, [mockCountries[1]]);

    await act(async () => {
      render(
          <AuthContext.Provider value={{ user: null }}>
            <MemoryRouter initialEntries={['/countries']}>
              <Routes>
                <Route path="/countries" element={<CountryList />} />
                <Route path="/country/:cca3" element={<div>Country Details Page</div>} />
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>
      );
    });

    // Filter by region
    const regionSelect = screen.getByRole('combobox', { name: /Select region/i });
    await act(async () => {
      fireEvent.change(regionSelect, { target: { value: 'Americas' } });
    });

    // Search for Brazil
    const searchInput = screen.getByPlaceholderText('Search by country name');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Brazil' } });
      fireEvent.click(screen.getByText('Search'));
    });

    await waitFor(() => {
      expect(screen.queryByText('Canada')).not.toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });

    // Navigate to Brazil's details
    const viewDetailsLink = screen.getByRole('link', { name: /View Details/i });
    await act(async () => {
      fireEvent.click(viewDetailsLink);
    });

    expect(screen.getByText('Country Details Page')).toBeInTheDocument();
  });
});