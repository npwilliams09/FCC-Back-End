'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); 
var Schema = mongoose.Schema;

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URL);

var urlSchema = new Schema({
  url : String,
  short_url: Number
});

var urlEntry = mongoose.model('urlEntry',urlSchema);

var createAndSaveURL = (urlPost, count, done) => {
  const url = new urlEntry({url: urlPost,"short_url": count+1});
  url.save((err,data)=>{
    if(err){
      done(err);
    }
    done(null , data);
  });
};

var findOneURL = function(address, done) {
  urlEntry.findOne(address, (err,data)=>{
    if(err){
      done(err);
    }
    if(data !== null){
      done(null, data);
    }else{
     done(null,'noResult'); 
    }
  });   
};

const urlChecker = (url) => {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(url);
}

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api/shorturl/:id',function (req,res){
  findOneURL({"short_url":req.params.id},function(err,data){
    if (err){
      res.json({"error":"There was an error"})
    }
    if(data !== 'noResult'){
      res.redirect(data.url);
    }else{
      res.json({"error":"url not found"});
    }
  });
});

app.post('/api/shorturl/new',function (req,res){
  //check url validity
  if (!urlChecker(req.body.url)){
    res.json({"error":"invalid url"});
  //url is valid
  }else{
    findOneURL({"url":req.body.url},function(err,data){
      //new URL
      if(data === 'noResult'){
        urlEntry.count({}, function( err, count){
          createAndSaveURL(req.body.url,count,function(err,saveData){
            if(err){
              console.log('error')
            }else{
                res.send({"original_url":saveData.url,"short_url":saveData.short_url});
            }
          });
        });
      //already found
      }else{
        res.send({"original_url":data.url,"short_url":data.short_url}); 
      }
    });
  }
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});