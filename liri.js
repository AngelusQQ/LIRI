require("dotenv").config();

var Spotify = require('node-spotify-api');
var keys = require('./keys');
var spotify = new Spotify(keys.spotify);
var request = require('request');
var fs = require('fs');

//Search Keyword Formatter
var keyword = "";
if(process.argv[3] !== undefined) {
  for(var i = 3; i < process.argv.length; i++) {
    if(i !== process.argv.length - 1) {
      keyword += process.argv[i] + "+";
    } else {
      keyword += process.argv[i];
    }
  }
}

//MAIN
process.argv[2] === "concert-this" ? concert(keyword)
: process.argv[2] === "do-what-it-says" ? whatItSays()
: process.argv[2] === "spotify-this-song" ? song(keyword)
: process.argv[2] === "movie-this" ? movie(keyword)
: !process.argv[3] ? console.log("\nMissing Search Parameter! \nUSAGE: node liri.js <search type> <keyword>")
: console.log("\nUSAGE: node liri.js <search type> <keyword>");

//-------------------------------------------[functions]--------------------------------------------------------------

//format date for concert dates
var formatDateKey = [5, 6, "/", 8, 9, "/", 0, 1, 2, 3];
function formatDate(input) {
  var date = ""
  for(var i = 0; i < formatDateKey.length; i++) {
    i === 2 || i === 5 ? date += "/" : date += input[formatDateKey[i]];
  }
  return date;
}

//OMDB API
function movie(keyword) {
  if(!process.argv[3]) { keyword = 'Mr. Nobody'; }
  request("http://www.omdbapi.com/?apikey=trilogy&t=" + keyword, function (error, response, body) {
    console.log("\r\n------------------------------------------------------------");
    var temp = JSON.parse(body);
    console.log("\r\nTitle:", temp.Title);
    console.log("\r\nYear Released:", temp.Year);
    console.log("\r\nRating (IMDB):", temp.Ratings[0].Value);
    console.log("\r\nRating (Rotten Tomatoes):", temp.Ratings[1].Value);
    console.log("\r\nCountry of Production:", temp.Country);
    console.log("\r\nLanguage:", temp.Language);
    console.log("\r\nPlot:", temp.Plot);
    console.log("\r\nActors:", temp.Actors);
    if(keyword === 'Mr. Nobody') { console.log("\r\n If you haven't watched 'Mr Nobody', then you should http://www.imdb.com/title/tt0485947 \r\n It's on Netflix!"); }
    console.log("\r\n------------------------------------------------------------");
  });
}

//Spotify API
function song(keyword) {
  if(!process.argv[3] && keyword === "") { keyword = "The Sign" }
  spotify.search({type: 'track', query: keyword}, function (err, data) {
    console.log("\r\n------------------------------------------------------------");
    for(var i = 0; i < data.tracks.items.length; i++) {
      console.log("\r\nArtist Name:", data.tracks.items[i].album.artists[0].name);
      console.log("\r\nSong Name:", data.tracks.items[i].name);
      console.log("\r\nPreview Link:", data.tracks.items[i].album.external_urls.spotify);
      console.log("\r\nAlbum:", data.tracks.items[i].album.name);
      console.log("\r\n------------------------------------------------------------");
    }
  });
}

//Bands in Town API
function concert(keyword) {
  if(!process.argv[3]) {
    console.log("\r\nMissing Artist Name!")
  } else {
    request("https://rest.bandsintown.com/artists/" + keyword + "/events?app_id=codingbootcamp", function (error, response, body) {
      var temp = JSON.parse(body);
      console.log("\r\n------------------------------------------------------------");
      for(var i = 0; i < temp.length; i++) {
        console.log("\r\nVenue Name:", temp[i].venue.name);
        console.log("\r\nLocation:", temp[i].venue.city + ", " + temp[i].venue.region);
        console.log("\r\nDate:", formatDate(temp[i].datetime));
        console.log("\r\n------------------------------------------------------------");
      }
    });
  }
}

function whatItSays() {
  fs.readFile('random.txt', 'utf-8', (err, data) => {
    var temp = data.split(',');
    temp[0].includes('concert') ? concert(temp[1])
    : temp[0].includes('spotify') ? song(temp[1])
    : temp[0].includes('movie') ? movie(temp[1])
    : console.log("")
  });
}
