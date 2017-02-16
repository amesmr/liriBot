const twitter = require('twitter');
const spotify = require('spotify-web-api-node');
const spotifyApi = new spotify({
    clientId: "981b1e150e55415ba4bf6bd4c5a1a4c7",
    clientSecret: "a8e3fdf23e8342e0a78bec720df53ef3",
    // redirectUri: REDIRECT_URI
});
const movieDB = require('moviedb')("1043bac57cfe0809e993f04e7cf669c0");
const imdb = require('imdb-api');
const inquirer = require("inquirer");
// const movieDB = new mdb();
const FileReader = require("FileReader");
const fs = require("fs");
const moment = require('moment');

var cmd = process.argv[2];
// var cmd = "my-tweets";
// var cmd = "spotify-this-song";
// var cmd = "movie-this";
// var cmd = "do-what-it-says";
var input;

// cmdAry = ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says", "quit"];

// function getInput() {
//     inquirer.prompt([{
//         type: "list",
//         name: "start",
//         message: "What would you like to do?",
//         choices: cmdAry
//     }]).then(function (answers) {
//         if (answers.start == "quit"){
//             return;
//         } //else if (answers.)
//         console.log(answers);
//     });

// }

function liri() {
    log("********************************************");
    log("Entering Liri.js");
    log(moment().format("MMM Do YYYY, hh:mm:ss a"));
    log("Command = " + cmd);
    log("********************************************\n");

    switch (cmd) {
        case "my-tweets":
            // do stuff
            tweet();
            break;

        case "spotify-this-song":
            // do stuff
            if (process.argv.length != 4) {
                // go get the default song and displays its info
                input = "The Sign";
            } else {
                input = process.argv[3];
            }
            log("Fetching data for " + input);
            spot(input);
            break;

        case "movie-this":
            // do stuff
            log("In movie-this");
            if (process.argv.length != 4) {
                // go get the default song and displays its info
                input = "Mr. Nobody";
            } else {
                input = process.argv[3];
            }
            log("Fetching data for " + input);
            movie(input);
            break;

        case "do-what-it-says":
            // do stuff
            log("In do-what-it-says");
            var txt = "";
            fs.readFile("random.txt", 'utf8', function (err, data) {
                if (err) throw err;
                log(data);
                txt = data;
                log(txt);
                var commands = txt.split(",");
                // set the globals
                cmd = commands[0];
                input = commands[1];
                // recurse once into this function with the appropriate info from the file
                liri();
            });
            break;

        default:
            // whoops  user entered something incorrectly
            log("There was an error.  Unrecognized input.");
            // no need to put the instructions into the log file
            console.log("The valid inputs are: \n my-tweets \n spotify-this-song [\"<song title>\"] \n movie-this [\"<movie title>\"] \n do-what-it-says")
    }
}

function log(msg) {
    console.log(msg);
    fs.appendFile("log.txt", msg + "\n", function (err) {
        if (err) {
            console.log(err);
        }
    });
}


function tweet() {
    // code here to get tweets
    var myKeys = require("./keys.js");
    var limit = 20;
    const client = new twitter(myKeys.twitterKeys);
    const params = {
        screen_name: 'mattames354',
        count: limit
    };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            // log("---------------RESPONSE-------------------");
            // log(response);
            // log("----------------TWEETS--------------------");
            // log(tweets);
            log(tweets.length);
            for (i = tweets.length - 1, j = 1; i >= 0; i--, j++) {
                // show tweets in reverse order (oldest to recent)
                if (i < 8) {
                    log("---------------- TWEET " + j + " --------------------");
                } else {
                    log("---------------- TWEET " + j + " -------------------");
                }
                log("When: " + moment(tweets[i].created_at).format("MMM Do YYYY, hh:mm:ss a"));
                log("What: " + tweets[i].text);
                log("----------------- TWEET " + j + "DONE ------------------\n");
            }
        } else {
            log(error);
        }
    });

}

function spot(song) {
    spotifyApi.searchTracks(song)
        .then(function (data) {
            // log(data);
            for (i = 0; i < data.body.tracks.items.length; i++) {
                log("************ Begin Track " + (i + 1) + " *******************");
                log("Artist(s): ");
                for (j = 0; j < data.body.tracks.items[i].artists.length; j++) {
                    log("    " + data.body.tracks.items[i].artists[j].name);
                }
                log("Song Title: ");
                log("    " + data.body.tracks.items[i].name);
                log("Preview URL: ");
                log("    " + data.body.tracks.items[i].preview_url);
                log("Album Name: ");
                log("    " + data.body.tracks.items[i].album.name);
                log("************* End Track " + (i + 1) + " *******************\n\n");
            }
        }, function (err) {
            console.error(err);
        });
}


function movie(title) {
    // code here to get movie info
    var movie = {};
    var movieInfo = {};
    var movieCast = {};

    movieDB.searchMovie({
        query: title
    }, function (err, res) {
        if (err) throw err;
        // console.log(res);
        movie = res.results
        console.log("Original Title:");
        console.log("  - " + movie[0].original_title);
        console.log("MovieDB Popularity (out of 5):");
        console.log("  - " + movie[0].popularity);
        movieDB.movieCredits({
            id: movie[0].id
        }, function (err, res) {
            if (err) throw err;
            // console.log(res);
            console.log("Starring (top 10):");
            for (i = 0; i < 10; i++) {
                console.log("  - " + res.cast[i].name + " as: " + res.cast[i].character);
            }

            console.log("Crew:");
            for (i = 0; i < res.crew.length; i++) {
                console.log("  - " + res.crew[i].job + " - " + res.crew[i].name);
            }
            movieDB.movieInfo({
                id: movie[0].id
            }, function (err, res) {
                if (err) throw err;
                // console.log(res);
                movieInfo = res;
                if (movieInfo.belongs_to_collection !== null) {

                    console.log("Related:");
                    for (i = 0; i < movieInfo.genres.length; i++) {
                        console.log("  - " + movieInfo.genres[i].name);
                    }
                }
                console.log("Genres:");
                for (i = 0; i < movieInfo.genres.length; i++) {
                    console.log("  - " + movieInfo.genres[i].name);
                }
                console.log("Budget:");
                console.log("  - " + formatCash(movieInfo.budget));
                console.log("Revenue:");
                console.log("  - " + formatCash(movieInfo.revenue));
                console.log("Release Date:");
                console.log("  - " + movieInfo.release_date);
                console.log("Runtime:");
                console.log("  - " + Math.floor(movieInfo.runtime / 60) + "h " + (movieInfo.runtime % 60) + "m");
                console.log("Production Companies:");
                for (i = 0; i < movieInfo.production_companies.length; i++) {
                    console.log("  - " + movieInfo.production_companies[i].name);
                }
                console.log("Production Countries:");
                for (i = 0; i < movieInfo.production_countries.length; i++) {
                    console.log("  - " + movieInfo.production_countries[i].name);
                }
                // using imdb-api
                imdb.getById(res.imdb_id)
                    .then(function (data) {
                        var formattedPlot = "";
                        console.log("Rated:");
                        console.log("  - " + data.rated);
                        console.log("Metacritic Score (out of 10):");
                        console.log("  - " + data.rating);
                        console.log("Plot:");
                        // Grrr.  I wanted to find a regEx that would help me 
                        // chunk this into 20 or 25 word chunks so that I could
                        // output them pretty but I couldn't find the answer.
                        // Same as the old days.  Nothing is easy.

                        var curIdx = 0;
                        var localCopy = data.plot;
                        var prevIdx = 0;
                        var temp = "";
                        for (i = 0; i < localCopy.length; i++) {
                            // find the nearest space to the 60 char mark
                            prevIdx = curIdx;
                            curIdx = localCopy.lastIndexOf(" ", ((i + 1) * 60));
                            temp = localCopy.slice(prevIdx, curIdx);
                            if (temp === "") break;
                            console.log("  - " + temp);
                        }
                        // get the last word and punctuation
                        console.log("  - " + localCopy.slice(curIdx, localCopy.length));
                        // console.log(data);
                    }, function (err) {
                        console.log(err);
                    });
            });
        });
    });
}

function formatCash(num) {
    return "$" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



// call the initiator function
getInput();