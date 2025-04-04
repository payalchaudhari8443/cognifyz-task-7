document.getElementById('weatherForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent server-side submission for this example
    const city = document.getElementById('city').value;
    const resultDiv = document.getElementById('weatherResult');

    try {
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city })
        });
        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `
                <h2>Weather in ${data.city}</h2>
                <p>Temperature: ${data.temp}°C</p>
                <p>Description: ${data.description}</p>
                <img src="${data.icon}" alt="Weather Icon">
            `;
        } else {
            resultDiv.innerHTML = `<p class="error">${data.error}</p>`;
        }
    } catch (err) {
        resultDiv.innerHTML = '<p class="error">Error fetching weather data</p>';
    }
});