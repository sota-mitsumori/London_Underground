const API_URL = 'https://api.tfl.gov.uk/Line/victoria/Arrivals';
const TABLE_BODY = document.querySelector('#arrivals-table tbody');
const LAST_UPDATED = document.getElementById('last-updated');
const ERROR_MESSAGE = document.getElementById('error-message');
const STATION_SELECT = document.getElementById('station-select');

// List of Victoria Line Stations
const victoriaStations = [
    'Brixton',
    'Stockwell',
    'Vauxhall',
    'Pimlico',
    'Victoria',
    'Green Park',
    'Oxford Circus',
    'Warren Street',
    'Euston',
    'King\'s Cross St. Pancras',
    'Highbury & Islington',
    'Finsbury Park',
    'Seven Sisters',
    'Tottenham Hale',
    'Blackhorse Road',
    'Walthamstow Central'
];

// Populate the dropdown with stations
function populateStationDropdown() {
    victoriaStations.forEach(station => {
        const option = document.createElement('option');
        option.value = station;
        option.textContent = station;
        STATION_SELECT.appendChild(option);
    });
}

// Fetch and display arrivals based on selected station
async function fetchArrivals(selectedStation) {
    try {
        ERROR_MESSAGE.textContent = ''; // Clear previous errors
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        // Filter arrivals for the selected Victoria line station
        const stationArrivals = data.filter(arrival =>
            arrival.stationName === selectedStation + " Underground Station"
        );

        updateTable(stationArrivals);
        updateLastUpdated();
    } catch (error) {
        console.error('Error fetching arrivals:', error);
        ERROR_MESSAGE.textContent = 'Failed to fetch arrival data. Please try again later.';
    }
}

// Update the arrivals table with fetched data
function updateTable(arrivals) {
    // Clear existing table rows
    TABLE_BODY.innerHTML = '';

    // Sort arrivals by timeToStation
    arrivals.sort((a, b) => a.timeToStation - b.timeToStation);

    arrivals.forEach(prediction => {
        const row = document.createElement('tr');

        const vehicleId = prediction.vehicleId || 'N/A';
        const lineName = prediction.lineName || 'N/A';
        const platformName = prediction.platformName || 'N/A';
        const direction = prediction.direction || 'N/A';
        const destination = prediction.destinationName || 'N/A';
        const expectedArrival = formatTime(prediction.expectedArrival);
        const timeToStation = prediction.timeToStation !== undefined ? (prediction.timeToStation / 60).toFixed(0) : 'N/A';

        row.innerHTML = `
            <td>${vehicleId}</td>
            <td>${lineName}</td>
            <td>${platformName}</td>
            <td>${direction}</td>
            <td>${destination}</td>
            <td>${expectedArrival}</td>
            <td>${timeToStation}</td>
        `;
        TABLE_BODY.appendChild(row);
    });

    if (arrivals.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="8">No arrivals currently.</td>`;
        TABLE_BODY.appendChild(row);
    }
}

// Format ISO time string to readable time
function formatTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date)) return 'N/A';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Update the "Last Updated" timestamp
function updateLastUpdated() {
    const now = new Date();
    LAST_UPDATED.textContent = `Last Updated: ${now.toLocaleTimeString()}`;
}

// Handle station selection change
STATION_SELECT.addEventListener('change', () => {
    const selectedStation = STATION_SELECT.value;
    fetchArrivals(selectedStation);
});

// Initial setup
function initialize() {
    populateStationDropdown();
    // Set default selected station (first in the list)
    const defaultStation = STATION_SELECT.value || 'Victoria';
    fetchArrivals(defaultStation);
    // Update every minute (60000 ms)
    setInterval(() => fetchArrivals(STATION_SELECT.value), 60000);
}

// Run the initial setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);