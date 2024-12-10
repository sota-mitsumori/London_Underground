async function fetchDisruptions() {
    const apiUrl = 'https://api.tfl.gov.uk/Disruptions/Lifts/v2/';
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Get the container to display disruptions
        const container = document.getElementById('disruptions-container');
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<p>No current lift disruptions.</p>';
            return;
        }

        // Loop through each disruption and display it
        data.forEach(disruption => {
            const disruptionDiv = document.createElement('div');
            disruptionDiv.classList.add('disruption');

            const stationName = disruption.stationUniqueId.replace(/[^a-zA-Z ]/g, '');
            const disruptedLifts = disruption.disruptedLiftUniqueIds.join(', ');
            const message = disruption.message;

            disruptionDiv.innerHTML = `
                <div class="station-name">${stationName}</div>
                <div class="disrupted-lifts">Disrupted Lifts: ${disruptedLifts}</div>
                <div class="message">${message}</div>
            `;

            container.appendChild(disruptionDiv);
        });
    } catch (error) {
        console.error('Error fetching disruptions:', error);
        document.getElementById('disruptions-container').innerHTML = '<p>Failed to load lift disruptions. Please try again later.</p>';
    }
}

// Fetch disruptions when the page loads
window.onload = fetchDisruptions;