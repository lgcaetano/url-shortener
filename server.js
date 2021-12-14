require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose")
const validUrl = require("valid-url");
const bodyParser = require('body-parser');
// Basic Configuration

function hasProtocol(url){
  return url.substr(0, 7) == "http://" || url.substr(0, 8) == "https://" 
}


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ShortURLSchema = new mongoose.Schema({
  url: {
    type: String,
    unique: true
  }
})

const ShortURL = mongoose.model('ShortURL', ShortURLSchema)


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


app.post('/api/shorturl', (req, res) => {

  let submittedUrl = req.body.url

  if(validUrl.isUri(submittedUrl) && hasProtocol(submittedUrl)){
    
    let newURL = new ShortURL({
      url: submittedUrl
    })

    newURL.save((err, data) => {
      
      if(err){

        console.log("ERRO")

        ShortURL.findOne({ url: submittedUrl }, (err, data) => {
          console.log(data)
          res.json({ original_url: data.url, short_url: data._id })
        })
      } else
        res.json({ original_url: data.url, short_url: data._id })
    })

  } else{
    res.json({ error: 'Invalid URL' })
  }

})

app.use('/api/shorturl/:id', (req, res) => {
  ShortURL.findOne({ _id: req.params.id }, (err, data) => {
    if(err)
      res.json({ error: 'Invalid URL' })
    res.redirect(data.url)
  })
})
