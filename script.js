let currentYear = new Date().getFullYear();
const BASE_URL = "https://api.openf1.org/v1/";
let driverJA = [];
let sessionJA = [];
let filteredDriverJA = [];
let filteredSessionJA = [];
let driverNamesList = [];
// let driverData = [];

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
    console.error('Error fetching JSON array:', error);
  }
}

async function getAPI () {
    driverJA = await getData("drivers");
    sessionJA = await getData("sessions");
}

function getFilteredLists () {
    filteredSessionJA = sessionJA.filter(session => session.session_name === "Race" && session.year === currentYear);
    // console.log(filteredSessionJA);
    const sessionKeyList = filteredSessionJA.map(session => session.session_key);
    filteredDriverJA = driverJA.filter(driver => sessionKeyList.includes(driver.session_key));
    const tempDriverNames = filteredDriverJA.map(driver => driver.name_acronym);
    // console.table(tempDriverNames);
    driverNamesList = [...new Set(tempDriverNames)];
    // driverData = [];
    // for(let i=0; i<driverNamesList.length; i++) {
    //     driverData.push({
    //         driver: driverNamesList[i],
    //         totalPoints: []
    //     })
    // }
    // console.table(driverData);
}

function fillMainContainer () {
    const mainDiv = document.getElementById("mainContainer");
    if(!mainDiv) return;
    mainDiv.replaceChildren();
    
    // console.log(filteredSessionJA.length);
    for(let i = 0; i < filteredSessionJA.length; i++) {
        const item = filteredSessionJA[i];
        const child = document.createElement("div");
        // child.textContent = item.location;
        // console.log(item);
        mainDiv.append(child, item.country_code);
    }

    // console.log(driverNamesList.length);
    for(let i = 0; i < driverNamesList.length; i++) {
        const item = driverNamesList[i];
        const child = document.createElement("div");
        // child.textContent = item.location;
        // console.log(item);
        mainDiv.append(child, item);
    }
}

function decreaseYear () {
    if(currentYear > 2023) {
        currentYear--;
        document.getElementById("increaseYearButton").disabled = false;
        getFilteredLists();
        fillMainContainer();
    }
    if(currentYear <= 2023) {
        document.getElementById("decreaseYearButton").disabled = true;
    }
    // console.log("decreaseYear triggered; " + currentYear);
    document.getElementById("yearText").textContent = currentYear;
}

function increaseYear () {
    if(currentYear < new Date().getFullYear()) {
        currentYear++;
        document.getElementById("decreaseYearButton").disabled = false;
        getFilteredLists();
        fillMainContainer();
    }
    if(currentYear >= new Date().getFullYear()) {
        document.getElementById("increaseYearButton").disabled = true;
    }
    // console.log("increaseYear triggered; " + currentYear);
    document.getElementById("yearText").textContent = currentYear;
}

document.getElementById("decreaseYearButton").onclick = decreaseYear;
document.getElementById("increaseYearButton").onclick = increaseYear;

window.addEventListener('load', async (event) => {
  console.log('The page and all resources are fully loaded.' + currentYear);
  document.getElementById("yearText").textContent = currentYear;
  console.log("getting API data...");
  await getAPI();
  console.log("API data fetched");
  getFilteredLists();
  fillMainContainer();
});