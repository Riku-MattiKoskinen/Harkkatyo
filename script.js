const jsonQuery1 = {
  "query": [
    {
      "code": "Vuosi",
      "selection": {
        "filter": "item",
        "values": [
          "2023"
        ]
      }
    },
    {
      "code": "Sukupuoli",
      "selection": {
        "filter": "item",
        "values": [
          "SSS"
        ]
      }
    },
    {
      "code": "Puolue",
      "selection": {
        "filter": "item",
        "values": [
          "03",
          "02",
          "01",
          "04",
          "05",
          "06",
          "07",
          "08",
          "09"
        ]
      }
    },
    {
      "code": "Vaalipiiri ja kunta vaalivuonna",
      "selection": {
        "filter": "item",
        "values": [
          "010000",
          "020000",
          "030000",
          "040000",
          "060000",
          "070000",
          "080000",
          "090000",
          "100000",
          "110000",
          "120000",
          "130000",
        ]
      }
    },
    {
      "code": "Tiedot",
      "selection": {
        "filter": "item",
        "values": [
          "evaa_osuus_aanista"
        ]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
}

const jsonQuery2 = {
    "query": [
      {
        "code": "Vuosi",
        "selection": {
          "filter": "item",
          "values": [
            "2023"
          ]
        }
      },
      {
        "code": "Puolue",
        "selection": {
          "filter": "item",
          "values": [
            "03",
            "02",
            "01",
            "04",
            "05",
            "06",
            "07",
            "08",
            "09"
          ]
        }
      },
      {
        "code": "Sukupuoli",
        "selection": {
          "filter": "item",
          "values": [
            "SSS"
          ]
        }
      },
      {
        "code": "Ikä",
        "selection": {
          "filter": "item",
          "values": [
            "SSS"
          ]
        }
      },
      {
        "code": "Vaalipiiri",
        "selection": {
          "filter": "item",
          "values": [
            "VP01",
            "VP02",
            "VP03",
            "VP04",
            "VP06",
            "VP07",
            "VP08",
            "VP09",
            "VP10",
            "VP11",
            "VP12",
            "VP13",
          ]
        }
      }
    ],
    "response": {
      "format": "json-stat2"
    }
}

const getData  = async () => {
    const url = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sw.px"
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonQuery1)
    })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    return data
};

const getCandidateData = async () => {
    
    const url = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sm.px"
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonQuery2)
    })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    return data
}

const populateMunicipalityDropdown = (municipalities) => {
    const selectElement = document.getElementById("municipalities");
    selectElement.innerHTML = "";
    const orderedMunicipalaities = municipalities.sort();
    orderedMunicipalaities.forEach(municipality => {
        const option = document.createElement("option");
        option.value = municipality;
        option.text = municipality;
        selectElement.appendChild(option);
    })
};

const populateChartDropdown = () => {
    const chart = ["Puoluekannatus", "Ehdokkaiden määrä"];
    const selectElement = document.getElementById("data-type");
    selectElement.innerHTML = "";
    chart.forEach(chart => {
        const option = document.createElement("option");
        option.value = chart;
        option.text = chart;
        selectElement.appendChild(option);
    })
};


const buildSelectedChart = async (selectedChart) => {
    
    //const selectedChart = document.getElementById("data-type").value;
    let data;
    let allMunicipalities;

    if (selectedChart === "Puoluekannatus") {
        data = await getData();  // Use await here
        allMunicipalities = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label);
        populateMunicipalityDropdown(allMunicipalities);

    } else if (selectedChart === "Ehdokkaiden määrä") {
        data = await getCandidateData();  // Use await here
        allMunicipalities = Object.values(data.dimension["Vaalipiiri"].category.label);
        populateMunicipalityDropdown(allMunicipalities);

    }
};

let electionChart = null;  // Declare a variable to hold the election chart object
let candidateChart = null;  // Declare a variable to hold the chart object

const buildElectionChart = async (chosenMunicipality) => {
    const data = await getData();
    const parties = Object.values(data.dimension.Puolue.category.label);

    const labelName = "Vaalipiiri ja kunta vaalivuonna";

    const allMunicipalities = Object.values(data.dimension[labelName].category.label);
    const orderedMunicipalaities = allMunicipalities.sort();
    const chosenIndex = orderedMunicipalaities.indexOf(chosenMunicipality);

    if (chosenIndex === -1) {
        console.error("Chosen municipality not found in data");
        return;
    }

    const values = data.value;

    parties.forEach((party, index) => {
        let partySupport = [values[chosenIndex + 12 * index]];

        parties[index] = {
            name: party,
            values: partySupport
        }
    });

    console.log("parties: ", parties);

    const chartData = {
        labels: [chosenMunicipality],
        datasets: parties
    };


    if (electionChart) {
        // Update existing chart
    
        try {
            electionChart.update(chartData);
            console.log("Election-chart updated");
        } catch (error) {
            console.error("Error in buildElectionChart: ", error);
        }
    } else {
        // Create new chart
        electionChart = new frappe.Chart("#chart", {
            title: "Puoluekannatus 2023",
            data: chartData,
            type: "bar",
            height: 500,
            // set coulors from different shades of blue
            
            barOptions: {
                regionFill: 1,
                gradient: 1,
                stacked: 0,
                spaceRatio: 0.5,
            },
        });
        console.log("New election-chart created");
    }
};


const buildCandidateChart = async (chosenMunicipality) => {
    try {
    const data = await getCandidateData();
    
    const allRegions = Object.values(data.dimension.Vaalipiiri.category.label);
    const parties = Object.values(data.dimension.Puolue.category.label);
    const values = data.value;
    const orderedRegions = allRegions.sort();
    const chosenIndex = orderedRegions.indexOf(chosenMunicipality);

    if (chosenIndex === -1) {
        console.error("Chosen region not found in data");
        return;
    }

    parties.forEach((party, index) => {
        let partyCandidates = [values[chosenIndex + 12 * index]];

        parties[index] = {
            name: party,
            values: partyCandidates
        }
    });
    // log the type of parties

    const chartData = {
        labels: [chosenMunicipality],
        datasets: parties
    };

    if (candidateChart) {
        // Update existing chart
        try{
            candidateChart.update(chartData);
            console.log("Candidatec-hart updated");
        } catch (error) {
            console.error("Error in buildCandidateChart: ", error);
        }
    } else {
        // Create new chart
        candidateChart = new frappe.Chart("#chart", {
            title: "Kandanedustajia ehdolla 2023",
            data: chartData,
            type: "bar",
            height: 500,
            barOptions: {
                regionFill: 1,
                gradient: 1,
                stacked: 0,
                spaceRatio: 0.5,
            },
        });
        console.log("New candidate-chart created");
    }
    } catch (error) {
        console.error("Error in buildCandidateChart: ", error);
    }
};

// Initialize the page
const initializePage = async () => {
    populateChartDropdown();
    await buildSelectedChart("Puoluekannatus");  // Wait for this function to complete
};

document.getElementById("municipalities").addEventListener("change", () => {
    const selectedMunicipality = document.getElementById("municipalities").value;
    const selectedChart = document.getElementById("data-type").value;

    if (selectedChart === "Puoluekannatus") {
        buildElectionChart(selectedMunicipality);
    } else if (selectedChart === "Ehdokkaiden määrä") {
        buildCandidateChart(selectedMunicipality);
    }
});

document.getElementById("data-type").addEventListener("change", async() => {
    const selectedChart = document.getElementById("data-type").value;
    buildSelectedChart(selectedChart);
});


// Run the script after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    initializePage();
});

