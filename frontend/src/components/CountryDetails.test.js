import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import CountryDetail from './CountryDetail';
import React from 'react';

// Setup axios mock
const mock = new MockAdapter(axios);

// Mock country data
const mockCountry = {
    cca3: 'CAN',
    name: { common: 'Canada', official: 'Canada' },
    flags: { png: 'https://flagcdn.com/ca.png' },
    capital: ['Ottawa'],
    region: 'Americas',
    subregion: 'North America',
    area: 9984670,
    borders: ['USA'],
    population: 37742154,
    languages: { eng: 'English', fra: 'French' },
    currencies: { CAD: { name: 'Canadian Dollar', symbol: '$' } },
    timezones: ['UTC-05:00', 'UTC-04:00'],
};

describe('CountryDetail Component', () => {
    beforeEach(() => {
        mock.reset();
    });

    // Unit Test: Renders loading state initially
    test('renders loading state initially', async () => {
        // Introduce a delay to ensure loading state is captured
        mock.onGet('https://restcountries.com/v3.1/alpha/CAN').reply(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve([200, [mockCountry]]), 100);
            });
        });

        render(
            <MemoryRouter initialEntries={['/country/CAN']}>
                <Routes>
                    <Route path="/country/:id" element={<CountryDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    // Unit Test: Renders country details after data is loaded
    test('renders country details after data is loaded', async () => {
        mock.onGet('https://restcountries.com/v3.1/alpha/CAN').reply(200, [mockCountry]);

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/country/CAN']}>
                    <Routes>
                        <Route path="/country/:id" element={<CountryDetail />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            // Use getByRole to target the h1 heading specifically
            expect(screen.getByRole('heading', { name: /Canada/i, level: 1 })).toBeInTheDocument();
            expect(screen.getByText('Back to List')).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Official Name: Canada';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Common Name: Canada';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Capital: Ottawa';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Region: Americas';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Subregion: North America';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Area: 9,984,670 km²';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Borders: USA';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Population: 37,742,154';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Languages: English, French';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Currencies: Canadian Dollar ($)';
            })).toBeInTheDocument();
            expect(screen.getByText((content, element) => {
                return element.tagName === 'P' && element.textContent.replace(/\s+/g, ' ').trim() === 'Timezones: UTC-05:00, UTC-04:00';
            })).toBeInTheDocument();
        });
    });

    // Unit Test: Renders country not found message on error
    test('renders country not found message on error', async () => {
        mock.onGet('https://restcountries.com/v3.1/alpha/XXX').reply(404);

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/country/XXX']}>
                    <Routes>
                        <Route path="/country/:id" element={<CountryDetail />} />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText('Country not found')).toBeInTheDocument();
        });
    });

    // Integration Test: Navigates back to list on clicking Back to List
    test('navigates back to list on clicking Back to List', async () => {
        mock.onGet('https://restcountries.com/v3.1/alpha/CAN').reply(200, [mockCountry]);

        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/country/CAN']}>
                    <Routes>
                        <Route path="/country/:id" element={<CountryDetail />} />
                        <Route path="/" element={<div>Home Page</div>} />
                    </Routes>
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /Canada/i, level: 1 })).toBeInTheDocument();
        });

        const backLink = screen.getByText('Back to List');
        await act(async () => {
            fireEvent.click(backLink);
        });

        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
});