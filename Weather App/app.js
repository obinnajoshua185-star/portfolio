const apiKey = "3bd69d03a96545413a39a4e8a5b09442"; // API key
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");

// Fetch weather data
async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    weatherResult.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

// Display weather results
function displayWeather(data) {
  const { name } = data;
  const { temp } = data.main;
  const { description } = data.weather[0];

  weatherResult.innerHTML = `
    <h2>${name}</h2>
    <p>Temperature: ${temp}°C</p>
    <p>Condition: ${description}</p>
  `;
}

// Event listener for button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeather(city);
  } else {
    weatherResult.innerHTML = `<p class="error">Please enter a city name.</p>`;
  }
});

// Allow Enter key
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
