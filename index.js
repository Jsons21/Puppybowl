const COHORT_CODE = "2505-ftb-ct-web-pt-jacob";
const API_URL = "https://fsa-puppy-bowl.herokuapp.com/api/";
const full_url = API_URL + COHORT_CODE;
const $form = document.querySelector("form");
const $main = document.querySelector("main");
const $app = document.querySelector("#app");
const $loading = document.querySelector("#loading-screen");

let teams = [];

function showLoading() {
  if ($loading) $loading.setAttribute("style", "display:flex;");
}

function hideLoading() {
  if ($loading) $loading.setAttribute("style", "display:none;");
}

async function fetchAllPlayers() {
  try {
    const response = await fetch(`${full_url}/players`);

    const allPlayers = await response.json();
    console.log(allPlayers);

    return allPlayers;
  } catch (err) {
    console.error("error");
  }
}

async function createPlayer(name, breed, imageUrl) {
  try {
    const player = {
      name: name,
      breed: breed,
      imageUrl: imageUrl,
    };

    const response = await fetch(`${full_url}/players`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(player),
    });

    const result = await response.json();
    console.log(player, result);

    return result.data.player; //change from json
  } catch (err) {
    console.error("error");
  }
}

async function fetchPlayerById(id) {
  try {
    const response = await fetch(`${full_url}/players/players/${id}`);
    const playerId = await response.json();
    console.log(playerId);
    return playerId.data;
  } catch (err) {
    console.error("error");
  }
}

async function removePlayerById(id) {
  try {
    const response = await fetch(`${full_url}/players/players/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    console.log(result);
    return result;
  } catch (err) {
    console.error("error");
  }
}

async function fetchAllTeams() {
  try {
    const response = await fetch(`${full_url}/teams`);
    const fetchTeamId = await response.json();
    console.log(fetchTeamId);
    return fetchTeamId;
  } catch (err) {
    console.error("error");
  }
}

async function renderAllPlayers() {
  const allPlayers = await fetchAllPlayers();
  // console.log(playerList);
  const playerList = allPlayers.data.players;
  const $players = document.createElement("ul");
  $players.id = "player";
  playerList.forEach((player) => {
    const $player = document.createElement("li");
    $player.className = "player-card";
    $player.innerHTML += `
        <h2>${player.name}</h2>
        <p>${player.breed}</p>
        <img src="${player.imageUrl}" alt="Picture of ${player.name}" />
        <section class="player-actions">
            <button class="details-btn">See Details</button>
            <button class="remove-btn">Remove Player</button>
        </section>
        `;
    $detailsBtn = $player.querySelector(".details-btn");
    $removeBtn = $player.querySelector(".remove-btn");

    $detailsBtn.addEventListener("click", async () => {
      showLoading();
      try {
        await renderSinglePlayer(player.id);
      } catch (err) {
        console.error("error");
      } finally {
        hideLoading();
      }
    });

    $removeBtn.addEventListener("click", async () => {
      try {
        const confirmRemove = confirm(
          `Are you sure you want to remove ${player.name} from the roster?`
        );
        if (!confirmRemove) return;
        showLoading();
        await removePlayerById(player.id);
        await renderAllPlayers();
      } catch (err) {
        console.error("error");
      } finally {
        hideLoading();
      }
    });

    $players.appendChild($player);
  });

  $main.innerHTML = "";
  $main.appendChild($players);
}
async function renderSinglePlayer(id) {
  const player = await fetchPlayerById(id);

  $main.innerHTML = `
    <section id="single-player">
        <h2>${player.name}/${player.team?.name || "Unassigned"} - ${
    player.status
  }</h2>
        <p>${player.breed}</p>
        <img src="${player.imageUrl}" alt="Picture of ${player.name}" />
        <button id="back-btn">Back to List</button>
    </section>
    `;

  $main.querySelector("#back-btn").addEventListener("click", async () => {
    showLoading();
    $app.appendChild($main);
    try {
      await renderAllPlayers();
    } catch (err) {
      console.error("error");
    } finally {
      hideLoading();
    }
  });
}

async function init() {
  showLoading();
  try {
    await renderAllPlayers();
    teams = await fetchAllTeams();
  } catch (err) {
    console.error("error");
  } finally {
    hideLoading();
  }
}

$form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("#new-name").value;
  const breed = document.querySelector("#new-breed").value;
  const image = document.querySelector("#new-image").value;

  showLoading();
  try {
    await createPlayer(name, breed, image);
    renderAllPlayers();
  } catch (err) {
    console.error("error");
  } finally {
    document.querySelector("#new-name").value = "";
    document.querySelector("#new-breed").value = "";
    document.querySelector("#new-image").value = "";
    hideLoading();
  }
});

init();
// createPlayer(
//   "tobey",
//   "dachshund",
//   "https://www.vidavetcare.com/wp-content/uploads/sites/234/2022/04/dachshund-dog-breed-info.jpeg"
// );
// fetchAllPlayers();
// fetchPlayerById(38967);
// removePlayerById(38967);
// fetchAllTeams();
