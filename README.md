rlet: Reactive Variables for JavaScript
=======================================

This project uses sweet.js macros to enable reactive variable declarations to
JavaScript.

Example:

```javaScript
rlet counting = subscribe($(countbtn).click) initially(false)
                !counting;
rlet count = subscribe(interval(100)) initially(0)
             counting ? count + 1 : count;
rlet txt = counting ? ("Count: " + count) : "Paused";
subscribe(txt) {
  $("#countBtn").text(txt);
}
```

A live online demo is available at [http://levjj.github.io/rlet](http://levjj.github.io/rlet).
