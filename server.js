// first establish dependencies
const express = require("express");
const expressHandlebars = require("express-handlebars");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const axios = require("axios");
const logger = require("morgan");

// start express
let app = express();

// import models
const db = require("./models");

const PORT = 4000;

// establish middleware
app.use(logger("dev"));

// Parse data request
app.use(express.urlencoded({ extended: true}););
app.use(express.json());

app.use(express.static("public"));

// routing
app.get("/scrape", function(req, res) {
//    use axios to get the HTML from the page
    axios.get("http://www.vox.com/").then(function(response) {
        // use the $ operator as a shorthand like in the mongo scrape we used in class
        let $ = cheerio.load(response.data);
        $("article h2").each(function(i, element) {
            // store the result in an empty object
            var result = {};
            
            // save the text and href of the links and convert them into properties of result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            db.article.create(result).then(function(dbarticle) {
            })
            .catch(function(err) {
                console.log(err);
            });     
        });
            // render the message to the client-side to alert them the scrape has complete
            res.send("We got the NEWS!")
    });
});
// routes for the articles
app.get("/articles", function(req, res) {
    db.article.find({}).then(function(dbarticle) {
        res.json(dbarticle);
    })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
    });
});
// Route for updating an article's
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Start the server
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });