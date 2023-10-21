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
          "050000"
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
            "VP05"
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
}

const populateDropdown = (municipalities) => {
    const selectElement = document.getElementById("municipalities");
    municipalities.forEach(municipality => {
        const option = document.createElement("option");
        option.value = municipality;
        option.text = municipality;
        selectElement.appendChild(option);
    })
};


const buildChart = async (chosenMunicipality) => {
    const data = await getData()
    const parties = Object.values(data.dimension.Puolue.category.label);
    const labelName = "Vaalipiiri ja kunta vaalivuonna";
    //const chosenMunicipality = "VP01 Helsingin vaalipiiri";

    const allMunicipalities = Object.values(data.dimension[labelName].category.label);
    const chosenIndex = allMunicipalities.indexOf(chosenMunicipality);

    if (chosenIndex === -1) {
        console.error("Chosen municipality not found in data");
        return;
    }

    const values = Object.values(data.value);

    parties.forEach((party, index) => {
        let partySupport = [];
        partySupport.push(values[chosenIndex * parties.length + index]);
        
        parties[index] = {
            name: party,
            values: partySupport
        }
    })

    const chartData = {
        labels: [chosenMunicipality], // Only the chosen municipality
        datasets: parties
    }

    const chart = new frappe.Chart("#chart", {
        title: "Finnish parliamentary election 2023",
        data: chartData,
        type: "bar",
        height: 500,
        
        barOptions: {
            regionFill: 1,
            gradient: 1,
            stacked: 0,
            spaceRatio: 0.5,

        },
    })
};

getData().then(data => {
    const allMunicipalities = Object.values(data.dimension["Vaalipiiri ja kunta vaalivuonna"].category.label);
    populateDropdown(allMunicipalities);
    buildChart("KU071 Haapavesi"); // Default municipality
});

/*document.getElementById("update-chart").addEventListener("click", () => {
    const selectedMunicipality = document.getElementById("municipalities").value;
    buildChart(selectedMunicipality);
});*/

document.getElementById("municipalities").addEventListener("change", () => {
    const selectedMunicipality = document.getElementById("municipalities").value;
    buildChart(selectedMunicipality);
});

/* Second chart starts here
const getCandidateData = async () => {
    const url = "https://statfin.stat.fi:443/PxWeb/api/v1/fi/StatFin/evaa/statfin_evaa_pxt_13sm.px"

    const res = await fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(jsonQuery2)
    })
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json()
    return data
}

const populateDropdown = (allRegions) => {
    const selectElement = document.getElementById("municipalities");
    allRegions.forEach(region => {
        const option = document.createElement("option");
        option.value = region;
        option.text = region;
        selectElement.appendChild(option);
    })
};

const buildCandidateChart = async () => {
    const data = await getCandidateData()
    //console.log(data)

    const allRegions = Object.values(data.dimension.Vaalipiiri.category.label);
    const chosenRegion = "VP01 Helsingin vaalipiiri";
    const parties = Object.values(data.dimension.Puolue.category.label);
    const values = Object.values(data.value);
    const chosenIndex = allRegions.indexOf(chosenRegion);

    if (chosenIndex === -1) {
        console.error("Chosen region not found in data");
        return;
    }

    //console.log(allRegions)
    //console.log(parties)
    //console.log(values)

    parties.forEach((party, index) => {
        let partyCandidates = [];
        for(let i = 0; i < 1; i++) {
            partyCandidates.push(values[index * 1 + i]);
        }
        parties[index] = {
            name: party,
            values: partyCandidates
        }
    })

    //console.log(parties) OK

    const chartData = {
        labels: [chosenRegion],
        datasets: parties
    }

    const chart = new frappe.Chart("#chart", {
        title: "Finnish parliamentary election 2023",
        data: chartData,
        type: "bar",
        height: 500,
        
        barOptions: {
            regionFill: 1,
            gradient: 1,
            stacked: 0,
            spaceRatio: 0.5,

        },
    })


}

getCandidateData().then(data => {
    const allMunicipalities = Object.values(data.dimension["Vaalipiiri"].category.label);
    populateDropdown(allMunicipalities);
    buildCandidateChart("KU071 Haapavesi"); // Default municipality
});

//document.getElementById("update-chart").addEventListener("click", () => {
//    const chosenRegion = document.getElementById("municipalities").value;
//    buildCandidateChart(chosenRegion);
//});

document.getElementById("municipalities").addEventListener("change", () => {
    const selectedMunicipality = document.getElementById("municipalities").value;
    buildChart(selectedMunicipality);
});

*/
