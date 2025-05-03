import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Favorites from './Favorites';
import { AuthContext } from '../context/AuthContext';
import React from 'react';

// Setup axios mock
const mock = new MockAdapter(axios);

// Mock user data
const mockUser = { id: '1', username: 'testuser' };

// Mock favorites data
const mockFavorites = [
    {
        cca3: 'CAN',
        name: { common: 'Canada' },
        flags: { png: 'https://flagcdn.com/ca.png' },
        capital: ['Ottawa'],
        region: 'Americas',
        population: 37742154,
        languages: { eng: 'English', fra: 'French' },
    },
];

describe('Favorites Component', () => {
    beforeEach(() => {
        mock.reset();
    });

    // Unit Test: Renders login message when user is not logged in
    test('renders login message when user is not logged in', () => {
        render(
            <AuthContext.Provider value={{ user: null }}>
                <MemoryRouter>
                    <Favorites />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByText('Please log in to view favorites.')).toBeInTheDocument();
    });

    // Unit Test: Renders loading state initially
    test('renders loading state initially', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve([200, mockFavorites]), 100);
            });
        });

        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <MemoryRouter>
                    <Favorites />
                </MemoryRouter>
            </AuthContext.Provider>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // Unit Test: Renders no favorites message when favorites list is empty
    test('renders no favorites message when favorites list is empty', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(200, []);

        await act(async () => {
            render(
                <AuthContext.Provider value={{ user: mockUser }}>
                    <MemoryRouter>
                        <Favorites />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('No favorite countries yet.')).toBeInTheDocument();
        });
    });

    // Unit Test: Renders favorite countries after data is loaded
    test('renders favorite countries after data is loaded', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(200, mockFavorites);

        await act(async () => {
            render(
                <AuthContext.Provider value={{ user: mockUser }}>
                    <MemoryRouter>
                        <Favorites />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Favorite Countries')).toBeInTheDocument();
            expect(screen.getByText('Canada')).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Capital: Ottawa';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Region: Americas';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Population: 37,742,154';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Languages: English, French';
            })).toBeInTheDocument();
        });
    });

    // Integration Test: Adds and removes a country from favorites
    test('adds and removes a country from favorites', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(200, mockFavorites);
        mock.onPost('http://localhost:5000/api/favorites').reply(200, { message: 'Removed from favorites' });

        await act(async () => {
            render(
                <AuthContext.Provider value={{ user: mockUser }}>
                    <MemoryRouter>
                        <Favorites />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Canada')).toBeInTheDocument();
        });

        const favoriteButton = screen.getByRole('button', { name: /favorite/i });
        expect(favoriteButton.querySelector('svg')).toHaveAttribute('fill', 'rgb(236 72 153)'); // Filled heart

        // Remove from favorites
        await act(async () => {
            fireEvent.click(favoriteButton);
        });

        await waitFor(() => {
            expect(screen.queryByText('Canada')).not.toBeInTheDocument();
            expect(screen.getByText('No favorite countries yet.')).toBeInTheDocument();
        });
    });

    // Integration Test: Shows loading spinner while toggling favorite
    test('shows loading spinner while toggling favorite', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(200, mockFavorites);
        mock.onPost('http://localhost:5000/api/favorites').reply(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve([200, { message: 'Removed from favorites' }]), 100);
            });
        });

        await act(async () => {
            render(
                <AuthContext.Provider value={{ user: mockUser }}>
                    <MemoryRouter>
                        <Favorites />
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Canada')).toBeInTheDocument();
        });

        const favoriteButton = screen.getByRole('button', { name: /favorite/i });
        await act(async () => {
            fireEvent.click(favoriteButton);
        });

        expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByText('Canada')).not.toBeInTheDocument();
        });
    });

    // Integration Test: Navigates to country details page
    test('navigates to country details page on clicking View Details', async () => {
        mock.onGet('http://localhost:5000/api/favorites').reply(200, mockFavorites);

        await act(async () => {
            render(
                <AuthContext.Provider value={{ user: mockUser }}>
                    <MemoryRouter initialEntries={['/favorites']}>
                        <Routes>
                            <Route path="/favorites" element={<Favorites />} />
                            <Route path="/country/:cca3" element={<div>Country Details Page</div>} />
                        </Routes>
                    </MemoryRouter>
                </AuthContext.Provider>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Canada')).toBeInTheDocument();
        });

        const viewDetailsLink = screen.getByRole('link', { name: /View Details/i });
        await act(async () => {
            fireEvent.click(viewDetailsLink);
        });

        expect(screen.getByText('Country Details Page')).toBeInTheDocument();
    });
});