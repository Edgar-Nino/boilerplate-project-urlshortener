const mongoose = require('mongoose');
const URLModel = require("./db/URL")
const URL = require('url').URL;

const bodyParser = require('body-parser')
const dns = require('dns');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use('/', function(req,res,next){
  console.log(req.method, req.baseUrl, req.hostname)
  next();
})

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:url', async function (req, res) {
  let urlToFind = req.params.url*1;
  try {
    console.log(typeof urlToFind, urlToFind);

    const findurl = await URLModel.findOne({ short_url: urlToFind * 1 }, "original_url short_url -_id").exec()
    if(findurl)
    {
      res.redirect(findurl.original_url)
      return
    }
    throw "invalid url"
  } catch (err) {
    res.json({ error: "invalid url" })
  }
})

app.post('/api/shorturl/', async function (req, res) {
  try {
    const url = req.body.url;
    const urlObj = new URL(url);
    dns.lookup(urlObj.hostname, async function (err, address, family) {
      try{
        if (err) {
        throw "Invalid URL"
      }

      const findurl = await URLModel.findOne({ original_url: url }, "original_url short_url -_id")

      if (findurl) {
        res.json(findurl)
        return
      }

      let shortenedURL;
      let noRepeat = true;
      do {
        shortenedURL = Math.floor(Math.random() * 10000000)
        let findurl = await URLModel.findOne({ short_url: shortenedURL }, "original_url short_url -_id")
        if (!(findurl)) { noRepeat = false }
      } while (noRepeat)

      const newUrl = new URLModel({
        original_url: url,
        short_url: shortenedURL
      })

      newUrl.save(function (err, data) {
        if (err) { throw err }

        res.json((({ original_url, short_url }) => ({ original_url, short_url }))(data))
      })
      }
      catch(err){
        res.json({error: err})
      }
      
    })
  } catch (err) {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
