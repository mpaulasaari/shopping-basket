# Shopping Basket Application

A coding exercise created in early 2015 for a shopping basket application.
The application relies on jQuery JavaScript library (hey, it was *2015*) for
simple DOM manipulation tasks, but is mostly written in vanilla JavaScript. No
task runners or package bundlers were used, but all the dependencies are
included in the repository.

## Getting Started

Get you a copy of the project up and running on your local machine or host it
on your server for global access.

### Prerequisites

The application requires a [Firebase](https://firebase.google.com/) database,
which can be acquired for free using a [Google account](https://myaccount.google.com/intro).
The application does not include any kind of authentication on client side, so
it expects the database to have open r/w permissions.

### Installing

1. Clone the code repository:

```
$ git clone git@github.com:mpaulasaari/shopping-basket-application.git
```

2. Edit `main.js` file and add your Firebase database URL on **line 5**:

```
var fbDatabaseURL = 'https://XXXX.firebaseio.com/'
```

3. Open `index.html` in your preferred browser (Chrome recommended). The
application does not require a localhost server.

## Built With

* [Firebase](https://firebase.google.com/) - Real-time database used to store the data
* [jQuery](https://jquery.com/) - JavaScript library used for DOM manipulation
* [jQuery UI](https://jqueryui.com/) - Using *Sortable* module for sorting the items
* [jQuery UI Touch Punch](http://touchpunch.furf.com/) - Plugin to support mobile devices
* [Modernizr](http://modernizr.com/) - Browser feature detection

## Authors

* **Mika Paulasaari** - [mpaulasaari](github.com/mpaulasaari)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md)
file for details.
