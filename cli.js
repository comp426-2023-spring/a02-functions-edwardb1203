#!/usr/bin/env node

import minimist from "minimist";
import fetch from "node-fetch";
import moment from "moment-timezone";

// Need this to store cli args
const args = minimist(process.argv.slice(2));

// Outputs help statements when -h is used
if (args.h) {
    console.log( "Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE");
    console.log("-h            Show this help message and exit.");
    console.log("-n, -s        Latitude: N positive; S negative.");
    console.log("-e, -w        Longitude: E positive; W negative.");
    console.log("-z            Time zone: uses tz.guess() from moment-timezone by default.");
    console.log("-d 0-6        Day to retrieve weather: 0 is today; defaults to 1.");
    console.log("-j            Echo pretty JSON from open-meteo API and exit.");
    process.exit(0);
}

// Default timezone
var timezone = moment.tz.guess()

// Setting lat and long from cli arg
var lat = args.n || (args.s * -1);
var long = args.e || (args.w * -1);

// Building URL
if(args.z){
    timezone = args.z
}
var url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + long +  "&timezone=" + timezone + "&daily=precipitation_hours";

// Make a request
const response = await fetch(url);

// Get the data from the request
const data = await response.json();

// Outputting out data!
if (args.j) {
    console.log(data);
    process.exit(0);
}

// Extra statement as sanity check
const days = args.d;

if (days == 0) {
  console.log("today.")
} else if (days > 1) {
  console.log("in " + days + " days.")
} else {
  console.log("tomorrow.")
}
