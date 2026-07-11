let currentYear = new Date().getFullYear();

function decreaseYear () {
    if(currentYear > 2023) {
        currentYear--;
        document.getElementById("increaseYearButton").disabled = false;
    }
    if(currentYear <= 2023) {
        document.getElementById("decreaseYearButton").disabled = true;
    }
    console.log("decreaseYear triggered; " + currentYear);
    document.getElementById("yearText").textContent = currentYear;
}

function increaseYear () {
    if(currentYear < new Date().getFullYear()) {
        currentYear++;
        document.getElementById("decreaseYearButton").disabled = false;
    }
    if(currentYear >= new Date().getFullYear()) {
        document.getElementById("increaseYearButton").disabled = true;
    }
    console.log("increaseYear triggered; " + currentYear);
    document.getElementById("yearText").textContent = currentYear;
}

document.getElementById("decreaseYearButton").onclick = decreaseYear;
document.getElementById("increaseYearButton").onclick = increaseYear;

window.addEventListener('load', (event) => {
  console.log('The page and all resources are fully loaded.' + currentYear);
  document.getElementById("yearText").textContent = currentYear;
});