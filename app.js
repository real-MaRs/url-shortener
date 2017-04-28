const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl.js');

const app = express();
app.use(bodyParser.json());
app.use(cors());

//connect to database
mongoose.connect('mongodb://test:test@ds123311.mlab.com:23311/urlshortener');

const urlencodedParser = bodyParser.urlencoded({extended: false});

//hooks up backend to frontend
app.use(express.static(__dirname + '/public'));


app.get('/',urlencodedParser, (req, res) => {
  res.render(index.html);
});

app.post('/', urlencodedParser, (req, res) => {
  res.redirect(307, `/new/${req.body.url}`);
});

app.get('/new/:url(*)', (req, res) => {
  const {url} = req.params;
  const regex = /[-a-zA-Z0=9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0=9@:%_\+.~#?&//=]*)?/gi;
  if(regex.test(url) === true) {
    const short = Math.floor(Math.random()*100000).toString();
    const data = new shortUrl(
      {
          originalUrl: url,
          shortUrl: short
      }
    );
    data.save(err => {
      if(err) {
        return res.send('Error saving to database');
      }
    });
    return res.json(data);
  }
  return res.json({error: 'invalid url'});
});

app.post('/new/:url(*)', (req, res) => {
  const {url} = req.params;
  const regex = /[-a-zA-Z0=9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0=9@:%_\+.~#?&//=]*)?/gi;
  if(regex.test(url) === true) {
    const short = Math.floor(Math.random()*100000).toString();
    const data = new shortUrl(
      {
          originalUrl: url,
          shortUrl: short
      }
    );
    data.save(err => {
      if(err) {
        return res.send('Error saving to database');
      }
    });
    return res.json(data);
  }
    return res.json({error: 'invalid url'});
});

app.get('/:url', (req, res) => {
  const {url} = req.params;
  if(url) {
    shortUrl.findOne({'shortUrl': url}, (err, data) => {
      if(err) {
        return res.status(404).end();
      }
      if(!data) {
        return res.send("That short url does not exist!");
      }
      const checkRegex = new RegExp('^(http|https)://', 'i');
      const strToCheck = data.originalUrl;
      if(checkRegex.test(strToCheck)) {
        res.redirect(301, data.originalUrl);
      }
      else {
        res.redirect(301, `http://${data.originalUrl}`);
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
//process.env.port is for deploying the app to heroku later
app.listen(PORT, () => console.log(`listening to port ${PORT}`));
