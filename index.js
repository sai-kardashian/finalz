document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const clearSearchButton = document.getElementById("clearSearchButton");
  const sortSelect = document.getElementById("sortSelect");
  const gameList = document.getElementById("gameList");
  const getGames = () => Array.from(gameList.getElementsByClassName("game-wrapper"));
  const filterGames = () => {
    const searchTerm = searchInput.value.toLowerCase();
    getGames().forEach(game => {
      const title = game.querySelector("h2").textContent.toLowerCase();
      const description = game.querySelector("p").textContent.toLowerCase();
      game.style.display = title.includes(searchTerm) || description.includes(searchTerm) ? "" : "none";
    });
  };
  const clearSearch = () => {
    searchInput.value = "";
    getGames().forEach(game => game.style.display = "");
    sortSelect.value = "none";
  };
  const sortGames = (order) => {
    const games = getGames();
    const sorted = games.sort((a, b) => {
      const nameA = a.querySelector("h2").textContent.toLowerCase();
      const nameB = b.querySelector("h2").textContent.toLowerCase();
      if (order === "nameAsc") return nameA.localeCompare(nameB);
      if (order === "nameDesc") return nameB.localeCompare(nameA);
      return 0;
    });
    gameList.innerHTML = "";
    sorted.forEach(game => gameList.appendChild(game));
  };
  searchButton.addEventListener("click", filterGames);
  searchInput.addEventListener("keyup", event => {
    if (event.key === "Enter") filterGames();
  });
  clearSearchButton.addEventListener("click", clearSearch);
  sortSelect.addEventListener("change", () => {
    const sortOrder = sortSelect.value;
    sortGames(sortOrder);
  });
});