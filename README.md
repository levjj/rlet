rlet: Reactive Variables for JavaScript
=======================================

This project uses sweet.js macros to enable reactive variable declarations to
JavaScript.

As example, the following code implements a counter that increases every 100ms
but can be paused by a button:

```javaScript
rlet counting = subscribe($("#countbtn").click)
                initially(false) !counting;

rlet count = subscribe(interval(100))
             initially(0) counting ? count + 1 : count;

rlet txt = counting ? ("Count: " + count) : "Paused";

subscribe(txt) {
  $("#countBtn").text(txt);
}
```

Demo
----

A live online demo is available at [http://levjj.github.io/rlet](http://levjj.github.io/rlet).

Installing and Running
----------------------

To build this project, you need NodeJS and npm.

In the project root folder, execute

    $> npm install

to install all dependencies (including sweet.js, webpack and React).

Now, in order to build the JavaScript library for in-browser testing, execute
the following line which uses webpack to create files in the folder `static/`:

    $> npm run build

After building the library, go to [./index.html](./index.html) to open the
programming environment.  You can also host these static files in a web browser.

To run the tests, you need to build the test library by executing the following
line:

    $> npm run test

Then, you can run all tests in-browser by opening [./tests.html](./tests.html).

Files
-----

- `src/editor.js`: Contains the UI of the programming environment
- `src/index.js`: Main library for rewriting JavaScript code with reactive variables.
- `src/macros.sjs`: The `rlet` and the `subscribe` macros written with sweet.js
- `src/signal.js`: A minimal library for signals and change propagation
