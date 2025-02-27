const apiBaseUrl = 'https://de1.api.radio-browser.info';
const stationGrid = document.getElementById('station-grid');
const audioPlayer = document.getElementById('audio-player');
const playingInfo = document.getElementById('playing-info');
const searchBtn = document.getElementById('search-btn');
const tagInput = document.getElementById('tag-input');
const spinner = document.getElementById('spinner');

// Load favorites from local storage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function showSpinner() {
    spinner.classList.remove('hidden');
}

function hideSpinner() {
    spinner.classList.add('hidden');
}

async function loadTopStations() {
    stationGrid.innerHTML = '';
    showSpinner();
    try {
        const response = await fetch(`${apiBaseUrl}/json/stations/topclick/30`);
        if (!response.ok) throw new Error('Network error');
        const stations = await response.json();
        displayStations(stations);
    } catch (error) {
        stationGrid.innerHTML = '<p>Failed to load stations. Please try again later.</p>';
    } finally {
        hideSpinner();
    }
}

async function searchStationsByTag(tag) {
    stationGrid.innerHTML = '';
    showSpinner();
    try {
        const response = await fetch(`${apiBaseUrl}/json/stations/bytag/${encodeURIComponent(tag)}?limit=30`);
        if (!response.ok) throw new Error('Network error');
        const stations = await response.json();
        displayStations(stations);
    } catch (error) {
        stationGrid.innerHTML = '<p>No stations found or an error occurred.</p>';
    } finally {
        hideSpinner();
    }
}

function displayStations(stations) {
    stationGrid.innerHTML = '';
    if (stations.length === 0) {
        stationGrid.innerHTML = '<p>No stations available.</p>';
        return;
    }
    stations.forEach(station => {
        const isFavorited = favorites.some(fav => fav.stationuuid === station.stationuuid);
        const card = document.createElement('div');
        card.className = 'station-card';
        card.innerHTML = `
            <h3>${station.name}</h3>
            <p>${station.tags || 'No tags'}</p>
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${station.stationuuid}">${isFavorited ? '❤️' : '♡'}</button>
        `;
        card.querySelector('.favorite-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(station);
        });
        card.addEventListener('click', () => playStation(station));
        stationGrid.appendChild(card);
    });
}

function playStation(station) {
    audioPlayer.src = station.url_resolved || station.url;
    audioPlayer.play().catch(() => {
        playingInfo.textContent = 'Error playing station. Try another.';
    });
    playingInfo.textContent = `${station.name} (${station.tags || 'No tags'})`;
}

function toggleFavorite(station) {
    const index = favorites.findIndex(fav => fav.stationuuid === station.stationuuid);
    const btn = document.querySelector(`.favorite-btn[data-id="${station.stationuuid}"]`);
    if (index === -1) {
        favorites.push(station);
        btn.classList.add('favorited');
        btn.textContent = '❤️';
    } else {
        favorites.splice(index, 1);
        btn.classList.remove('favorited');
        btn.textContent = '♡';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

searchBtn.addEventListener('click', () => {
    const tag = tagInput.value.trim();
    if (tag) {
        searchStationsByTag(tag);
    } else {
        loadTopStations();
    }
});

loadTopStations();