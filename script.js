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
let driverTeamsList = [];
let sortedDriverNamesList = [];
let sortedDriverNumbersList = [];
let sortedDriverTeamsList = [];
let driverData = [];
let pointsList = [];
let chartInstance = null;

document.getElementById("toggleLegendButton").disabled = true;
document.getElementById("increaseYearButton").disabled = true;
document.getElementById("decreaseYearButton").disabled = true;

const canvas = document.getElementById("myChart");
const ctx = canvas.getContext("2d");

function decreaseYear() {
  if (currentYear > 2023) {
    currentYear--;
    document.getElementById("increaseYearButton").disabled = false;
    getLists();
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
    getLists();
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
  document.getElementById("toggleLegendButton").disabled = false;
  document.getElementById("decreaseYearButton").disabled = false;
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

function getLists() {
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
  const tempRemoveDuplicates = [
    ...new Map(
      filteredDriverJA.map((driver) => [driver.driver_number, driver]),
    ).values(),
  ];
  driverNamesList = tempRemoveDuplicates.map((driver) => driver.name_acronym);
  driverNumbersList = tempRemoveDuplicates.map(
    (driver) => driver.driver_number,
  );
  driverTeamsList = tempRemoveDuplicates.map((driver) => driver.team_name);

  let tempPointsList = [];
  let tempFinalPointsList = [];
  for (let i = 0; i < driverNamesList.length; i++) {
    tempPointsList = getPointsList(driverNumbersList[i]);
    let tempFinalPoints = tempPointsList[tempPointsList.length - 1];
    tempFinalPointsList.push(tempFinalPoints);
  }

  const indices = tempFinalPointsList.map((_, index) => index);
  indices.sort((a, b) => tempFinalPointsList[b] - tempFinalPointsList[a]);
  sortedDriverNamesList = indices.map((index) => driverNamesList[index]);
  sortedDriverNumbersList = indices.map((index) => driverNumbersList[index]);
  sortedDriverTeamsList = indices.map((index) => driverTeamsList[index]);

  //data list
  driverData = [];
  for (let i = 0; i < driverNamesList.length; i++) {
    let pointsList = getPointsList(sortedDriverNumbersList[i]);
    let tempBorderDash = null;
    if (
      driverData.find((driver) => driver.team_name === sortedDriverTeamsList[i])
    ) {
      tempBorderDash = [5, 5];
    }
    driverData.push({
      driver: sortedDriverNamesList[i],
      team_name: sortedDriverTeamsList[i],
      totalPoints: pointsList,
      teamColor: filteredDriverJA.find(
        (driver) => driver.driver_number === sortedDriverNumbersList[i],
      ).team_colour,
      borderDash: tempBorderDash,
    });
  }
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
        borderDash: driver.borderDash || [],
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
          display: false,
          labels: {
            usePointStyle: true,
            pointStyle: "line",
            generateLabels: (chart) => {
              //everything same as default except for lineDash
              return chart.data.datasets.map((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                const style = meta.controller.getStyle(0);
                return {
                  text: dataset.label,
                  strokeStyle: style.borderColor,
                  lineWidth: style.borderWidth,
                  lineDash: dataset.borderDash || [], //changed to be same as dataset
                  lineDashOffset: style.borderDashOffset,
                  fillStyle: style.backgroundColor,
                  hidden: !meta.visible,
                  pointStyle: "line",
                  datasetIndex: i,
                };
              });
            },
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false, //resize with window
    },
  });
}

function toggleLegend() {
  if (chartInstance) {
    chartInstance.options.plugins.legend.display =
      !chartInstance.options.plugins.legend.display;
    chartInstance.update();
  }
}
document.getElementById("toggleLegendButton").onclick = toggleLegend;

window.addEventListener("load", async (event) => {
  console.log("The page and all resources are fully loaded." + currentYear);
  document.getElementById("yearText").textContent = currentYear;
  console.log("getting API data...");
  await getAPI();
  console.log("API data fetched");
  getLists();
  fillMainContainer();
});
