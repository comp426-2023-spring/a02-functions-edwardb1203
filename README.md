# Assignment 02: Create a command line Node.js package that ingests API data from Open-Meteo

This assignment will help you learn to create an installable Node.js command line utility. 

## DO NOT CLONE THIS REPOSITORY DIRECTLY

Use the GitHub classroom link instead: https://classroom.github.com/a/wjfhBtVG

**_If you clone this repo directly, it will not be added to the organization as an individual repo associated with your account and you will not be able to push to it._**

## Description

The purpose of this assignment is to create an installable Node.js command line application package.
This is relatively straightforward. 

Read this article for an overview of how to create a Node.js CLI package: https://x-team.com/blog/a-guide-to-creating-a-nodejs-command/

## Setup

### Clone and run bash example

The model for your Node command line package will be a Bash command-line script example that you can find here: https://github.com/jdmar3/galo.sh/

In order for you to sucessfully complete this assignment you might want to clone and run `galo.sh`.
This will provide you with an example of how your new app, `galosh.js` should run. 

So, in a directory other than the working directory for this assignment, clone the `galo.sh` repo.

You must have `curl` and `jq` installed. Links to downloads are listed in the `galo.sh` repo README. They are available as package in most LInux distributions. MacOS users will have to download and install `jq`, but `curl` should already be installed.

Run it with different options to see how it responds and then use that information to model how your command line package responds. There are slight differences specified below. You do not need verbose output, for example.

## Assessment

The runner for assessing this assignment is configured to run through all of the available command line switches/options specified in the help file.

Your command line app should be able to do the following: 

1. The package should be installable using NPM (i.e., `npm link` should install it on the runner). 
2. Invoking `galosh.js` on the command line after running `npm link` should run the app.
3. `galosh.js -h` should echo the help message (see below) onto STDOUT and exit 0.
4. `galosh.js -j` should echo the JSON that your app ingested from Open-Meteo onto STDOUT and exit 0. If you do not pass further parameters, this should return an error from the API. There should be no default input for the location variables.
5. All of the options in the help message below should work. 
6. If the daily precipitation hours in the JSON for the day you are targeting is not 0, log "You might need your galoshes " onto STDOUT. If the value is zero, then log "You will not need your galoshes " onto STDOUT.
7. If `-d 0` then log "today." onto STDOUT. If `-d [2-6]` then log "in NUMBER days." onto STDOUT. If `-d 1` or there is no `-d` specified, then log "tomorrow." onto STDOUT.
8. All of the latitude (`-n` and `-s`) and longitude (`-e` and `-w`) should take any number and convert it to a number with no more than 2 places to the right of the decimal AND be either a positive or negative number as appropriate (i.e., `-n` and `-e` should be positive numbers and `-s` and `-w` should be negative, so that they can be sent to the API correctly.
9. Your app should guess the system timezome and use it if there is no `-t` specified in the command line arguments.

## Instructions

### Setup

To get started, initialize your repo as a package by running `npm init`. 

Make sure that the license you select is the same as the one in the LICENSE file (it will be GPL-3.0-or-later for this and most assignments). This is always going to be expected in assignments. 

The list of licenses is available here: https://spdx.org/licenses/

The test script should be: 

`node cli.js -n 35.92 -w 79.05 -t America/New_York`

In the resulting `package.json` it should have this:

```
  "scripts": {
    "test": "node cli.js -n 35.92 -w 79.05 -t America/New_York"
  },
```

Change the information you input from the defaults so the package is yours (name, author, etc.). Customize it to you.

### Install dependencies

You will need to use npm to install the following packages:

- minimist
- node-fetch
- moment-timezone

### Make package installable

Edit `package.json` to include:

```
  "bin": {
    "galosh.js": "./cli.js"
  },
```

This will allow you to then run `npm link` to install your package and use `galosh.js` instead of `node cli.js`. You can uninstall (unlink) it by running `npm unlink`.

While you're editing `package.json`, add the following so that Node doesn't throw an error:

```
"type": "module",
```

### Create the script file

Create a file called `cli.js`. 

The first line of the file should be a shebang for Node:

```
#!/usr/bin/env node
```

### Create the help text

One of the first things you will want to do is look or the `-h` option in the command line and if it is there, log the following help text and exit 0.
0 is the exit code for "everything worked." 1 means "there was an error."

```
Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -t TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -t            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit.
```

### Timezone

You have installed the `moment-timezone` package, which will let you attempt to extract the system timezone.

This should do that for you. Remember to import `moment` from the package to load the dependency.

```
const timezone = moment.tz.guess()
```

### Find the appropriate request URL

Use the URL builder for the Open-Meteo API to find all of the variables needed to construct your URL string: https://open-meteo.com/en/docs#api_form

One approach is to select all of the daily weather variables and then find the one that you want.

This is not the greatest approach because you are moving more data than you need, which slows you down. 

Ideally you want something that looks more like this: 

```JSON
{"latitude":35.875,"longitude":-79.0,"generationtime_ms":0.44608116149902344,"utc_offset_seconds":-14400,"timezone":"America/New_York","timezone_abbreviation":"EDT","elevation":127.0,"current_weather":{"temperature":66.7,"windspeed":2.9,"winddirection":212.0,"weathercode":0.0,"time":"2022-09-22T06:00"},"daily_units":{"time":"iso8601","precipitation_hours":"h"},"daily":{"time":["2022-09-22","2022-09-23","2022-09-24","2022-09-25","2022-09-26","2022-09-27","2022-09-28"],"precipitation_hours":[0.0,0.0,0.0,3.0,3.0,0.0,0.0]}}
```

Or, in parsed form:

```JSON
{
  "latitude": 35.875,
  "longitude": -79,
  "generationtime_ms": 0.44608116149902344,
  "utc_offset_seconds": -14400,
  "timezone": "America/New_York",
  "timezone_abbreviation": "EDT",
  "elevation": 127,
  "current_weather": {
    "temperature": 66.7,
    "windspeed": 2.9,
    "winddirection": 212,
    "weathercode": 0,
    "time": "2022-09-22T06:00"
  },
  "daily_units": {
    "time": "iso8601",
    "precipitation_hours": "h"
  },
  "daily": {
    "time": [
      "2022-09-22",
      "2022-09-23",
      "2022-09-24",
      "2022-09-25",
      "2022-09-26",
      "2022-09-27",
      "2022-09-28"
    ],
    "precipitation_hours": [
      0,
      0,
      0,
      3,
      3,
      0,
      0
    ]
  }
}
```

The variable that you are most interested in, probably, is whether or not it will be raining on a given day.
The "Precipitation hours" varialbe is well-suited to this.
If the value returned is 0, then it means that there will be zero hours of precipitation in a given day. 
If it is greater than zero, then there will be that many days of precipitation in a given day. 

That variable returns an array with 7 values in it corresponding to days starting with today. From the above JSON:

```
"precipitation_hours":[0.0,0.0,0.0,3.0,3.0,0.0,0.0]
```

To refer to a particular value in the array, use the index (assume our JSON is stored as `data`):

`data.daily.precipitation_hours[0]` would refer to TODAY. `data.daily.precipitation_hours[1]` would refer to TOMORROW, and so on.

### Construct a `fetch()` API call that will return the JSON data you need.

Using the URL that you have constructed, you will need to create an API call using `fetch()`. 

Remember that fetch is asynchrounous by default, so we will use await to allow time for the API server to respond.

```
// Make a request
const response = await fetch('URL_GOES_HERE');
```

You will need to insert your command line option variables into your URL string. 
Remember that `+` concatenates strings (it is not just a math operator).

So if you have a variable for, say, latitude, and you need to put it in a string, it can look something like this: 

`'.com?latitude=' + latitude + '&longitude=' + `

That will produce a string that has the value stored in `latitude` concatenated between the two strings on either side of the `+` operator.
 
Once you have the response, get JSON out of it:

```
// Get the data from the request
const data = await response.json();
```

More about using fetch is available in the fetch documentation, which is linked from the schedule pages. 

### Create the response text using conditional statements.

Below, we've defined `days` corresponding to the command line argument `-d`. We'll assume `args` is defined from minimist's output, which is the parsed command line arguments.

```
const days = args.d 

if (days == 0) {
  console.log("today.")
} else if (days > 1) {
  console.log("in " + days + " days.")
} else {
  console.log("tomorrow.")
}
```

In the above conditional, if `-d 

### Test your code

Make sure that your code works by doing the following:

1. `npm link` (should link/install your package locally)
2. `npm test` (should run your test script defined in package.json)
3. `node cli.js -n 35 -w 79 -t America/New_York -d 0` (should return today's weather)
4. `galosh.js -n 35 -w 79 -t America/New_York -d 0` (should return the same as above)
5. `galosh.js -n 35 -w 79 -t America/New_York` (should return tomorrow's weather by default)
6. `galosh.js -n 35 -w 79` (should return tomorrow's weather by default and get the timezone from the system)
7. `galosh.js -h` (should return help message and exit 0)
8. `galosh.js -j` (should return JSON and exit)
9. `npm unlink` (should link/uninstall your package locally)

If any of those things are not happening, then you're missing something somewhere. 
