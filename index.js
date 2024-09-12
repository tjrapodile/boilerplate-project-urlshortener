require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
const urls = new Map();
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", function (req, res) {
  let url;
  try {
    url = new URL(req.body.url);
  } catch (err) {
    res.json({ error: "invalid url" });
    return;
  }

  for (let [key, value] of urls) {
    if (value === url.href) {
      res.json({ original_url: value, short_url: key });
      return;
    }
  }

  dns.lookup(url.hostname, function (err, address, family) {
    if (err) {
      res.json({ error: "invalid url" });
      return;
    }

    const shortUrl = urls.size + 1;
    urls.set(shortUrl, url.href);
    res.json({ original_url: url.href, short_url: shortUrl });
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = req.params.short_url;
  if (/^\d+$/.test(shortUrl) && urls.has(Number(shortUrl))) {
    res.redirect(urls.get(Number(shortUrl)));
  } else {
    res.json({ error: "invalid url: short_url does not exist" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
