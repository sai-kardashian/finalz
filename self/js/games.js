const searchBar = document.getElementById('search-bar');
const gameCards = document.querySelectorAll('.games-card');

function filterGames(searchTerm) {
    const searchTermLower = searchTerm.toLowerCase();
    gameCards.forEach(card => {
        const gameName = card.getAttribute('data-game');
        if (gameName.includes(searchTermLower)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

if (searchBar) {
    searchBar.addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        filterGames(searchTerm);
    });
}
