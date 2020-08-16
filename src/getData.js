import React from 'react';

//get data from a URL
function getData() {
    var csvFile = new XMLHttpRequest();
    csvFile.open("GET", "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv", true);
    csvFile.onreadystatechange = function() {
        if (csvFile.readyState === 4) {  // Makes sure the document is ready to parse.
            if (csvFile.status === 200) {  // Makes sure it's found the file.
                allText = csvFile.responseText; 
                lines = csvFile.responseText.split("\n"); // Will separate each line into an array
            }
        }
    }
    csvFile.send(null);
    return csvFile; //return to whichever js file processes it
}
