# Musikki Music API

JavaScript client for Musikki's Music API

https://music-api.musikki.com

## Usage

First, include this module and create an instance:

```
$ npm install musikki
```

```javascript
const Musikki = require('musikki');
let musikki = new Musikki({ appid: yourAppID, appkey: yourAppKey });
```

This implementation abstracts Music API's endpoints and methods with a familiar javascript chaining syntax:

```javascript
musikki.endpoint(mkid).method(filter, paging)
```

All parameters are optional or required, depending on the specific endpoint and method called (see [API documentation](https://music-api.musikki.com) for more information)

`endpoint` — A Music API endpoint, like `artist` or `video`

`method` — A Music API endpoint method, like `search` or `info`

`mkid` — Musikki ID of a specific resource

`filter` — An object containing the filter parameters specific to the given method

`paging` — An object containing the pagination options (page number and results limit)


To find all artists that match a given name

```javascript
musikki.artists().search({ 'artist-name': 'slowdive' }).then(console.log);
```

```javascript
musikki.artists().search({ 'artist-name': 'the' }, { limit: 100, page: 10 }).then(console.log);
```

To obtain info about a given artist

```javascript
musikki.artists(100038744).info().then(console.log);
```

