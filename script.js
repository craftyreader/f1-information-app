let currentYear = new Date().getFullYear();
const BASE_URL = "https://api.openf1.org/v1/";
let driverJA = [];
let sessionJA = [];
let championshipJA = [];
let filteredDriverJA = [];
let filteredSessionJA = [];
let filteredChampionshipJA = [];
let sessionKeyList = [];
let driverNamesList = [];
let driverNumbersList = [];
let driverData = [];
let pointsList = [];
let chartInstance = null;

const canvas = document.getElementById("myChart");
const ctx = canvas.getContext("2d");

function decreaseYear() {
  if (currentYear > 2023) {
    currentYear--;
    document.getElementById("increaseYearButton").disabled = false;
    getFilteredLists();
    fillMainContainer();
  }
  if (currentYear <= 2023) {
    document.getElementById("decreaseYearButton").disabled = true;
  }
  // console.log("decreaseYear triggered; " + currentYear);
  document.getElementById("yearText").textContent = currentYear;
}

function increaseYear() {
  if (currentYear < new Date().getFullYear()) {
    currentYear++;
    document.getElementById("decreaseYearButton").disabled = false;
    getFilteredLists();
    fillMainContainer();
  }
  if (currentYear >= new Date().getFullYear()) {
    document.getElementById("increaseYearButton").disabled = true;
  }
  // console.log("increaseYear triggered; " + currentYear);
  document.getElementById("yearText").textContent = currentYear;
}

document.getElementById("decreaseYearButton").onclick = decreaseYear;
document.getElementById("increaseYearButton").onclick = increaseYear;

function fillMainContainer() {
  const mainDiv = document.getElementById("mainContainer");
  if (!mainDiv) return;
  mainDiv.replaceChildren();
  plotGraph();

  // console.log(filteredSessionJA.length);
  //   for (let i = 0; i < filteredSessionJA.length; i++) {
  //     const item = filteredSessionJA[i];
  //     const child = document.createElement("div");
  //     // child.textContent = item.location;
  //     // console.log(item);
  //     mainDiv.append(child, item.country_code);
  //   }

  //   // console.log(driverNamesList.length);
  //   for (let i = 0; i < driverNamesList.length; i++) {
  //     const item = driverNamesList[i];
  //     const child = document.createElement("div");
  //     // child.textContent = item.location;
  //     // console.log(item);
  //     mainDiv.append(child, item);
  //   }
}

function getPointsList(driverNumber) {
  let pointsList = [];
  // console.log(sessionKeyList);
  for (let i = 0; i < sessionKeyList.length; i++) {
    // console.log("session key:", sessionKeyList[i]);
    const tempDriver = filteredChampionshipJA.find(
      (item) =>
        item.driver_number === driverNumber &&
        item.session_key === sessionKeyList[i],
    );
    if (tempDriver) {
      pointsList.push(tempDriver.points_current);
    }
  }
  return pointsList; //[0, 25, 35, ...]
}

function getFilteredLists() {
  //filtered lists
  if (!sessionJA || !driverJA || !championshipJA) {
    console.error("array is empty");
    return;
  }
  filteredSessionJA = sessionJA.filter(
    (session) =>
      session.session_name === "Race" &&
      session.year === currentYear &&
      session.is_cancelled === false,
  );
  sessionKeyList = filteredSessionJA.map((session) => session.session_key);
  filteredDriverJA = driverJA.filter((driver) =>
    sessionKeyList.includes(driver.session_key),
  );
  filteredChampionshipJA = championshipJA.filter((data) =>
    sessionKeyList.includes(data.session_key),
  );

  //driver lists
  const tempDriverNames = filteredDriverJA.map((driver) => driver.name_acronym);
  driverNamesList = [...new Set(tempDriverNames)];
  const tempDriverNumbers = filteredDriverJA.map(
    (driver) => driver.driver_number,
  );
  driverNumbersList = [...new Set(tempDriverNumbers)];
  // console.log(driverNamesList);
  // console.log(driverNumbersList);

  //data list
  driverData = [];
  for (let i = 0; i < driverNamesList.length; i++) {
    pointsList = getPointsList(driverNumbersList[i]);
    // console.log(driverNumbersList[i]);
    console.log(pointsList);
    driverData.push({
      driver: driverNamesList[i],
      totalPoints: pointsList,
      teamColor: filteredDriverJA.find(
        (driver) => driver.driver_number === driverNumbersList[i],
      ).team_colour,
    });
  }
  console.log(driverData);
}

async function getData(endpoint) {
  const url = BASE_URL + endpoint; // Replace with your website URL

  try {
    // 1. Fetch the data from the website
    const response = await fetch(url);

    // 2. Check if the network request was successful
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // 3. Parse the response body as JSON
    const jsonArray = await response.json();

    // 4. Use your JSON array
    return jsonArray;

    // Example: Loop through the array items
    // jsonArray.forEach(item => {
    //   console.log(item);
    // });
  } catch (error) {
    console.error("Error fetching JSON array:", error);
  }
}

async function getAPI() {
  driverJA = await getData("drivers");
  sessionJA = await getData("sessions");
  championshipJA = await getData("championship_drivers");
}

function plotGraph() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: filteredSessionJA.map((session) => session.circuit_short_name),
      datasets: driverData.map((driver) => ({
        label: driver.driver,
        data: driver.totalPoints,
        borderColor: `#${driver.teamColor}`,
        borderWidth: 1,
      })),
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyle: "line",
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

window.addEventListener("load", async (event) => {
  console.log("The page and all resources are fully loaded." + currentYear);
  document.getElementById("yearText").textContent = currentYear;
  console.log("getting API data...");
  await getAPI();
  console.log("API data fetched");
  getFilteredLists();
  fillMainContainer();
});
