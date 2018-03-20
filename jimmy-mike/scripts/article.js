'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEW: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// This method isn't written as an arrow function because it uses the contextual this. Arrow functions can't create its' own contextual this.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // The line below uses a ternary operator which is a condensed version of an if/else statement. The question mark represents the if while the colon represents the else. We have seen this same logic represented in if/else statements. The line before the question mark is the conditional where if it is true; it runs the code after the question mark but before the colon while if it is false, it runs the code after the colon.
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEW: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// This function is called in the Article.fetchAll function which checks local storage to see if there are locally stored data of the articles. 'rawData' represents the data stored in local storage for the articles. This is different from previous labs because the data is not static.
Article.loadAll = articleData => {
  articleData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  articleData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEW: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEW: What is this 'if' statement checking for? Where was the rawData set to local storage?
  if (localStorage.rawData) {

    Article.loadAll(JSON.parse(localStorage.rawData));

  } else {
    // We determined if the article data does not exist on the local storage, then we need to grab it from the json file. Once we grab it; then we want it to run the Article.loadAll function for the parsed data that we just received. Then we would set the item to local storage. If the grab fails, then we want to see what the error is as a console log message.
    $.getJSON('../data/hackerIpsum.json')
      .then(
        function(data) {
          Article.loadAll(data);
          localStorage.setItem('rawData', JSON.stringify(data));
        },
        function(error) {console.log(error)}
      )
  }
}
