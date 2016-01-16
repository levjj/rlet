let count = 0, counting = true;
setInterval(() => {
  if (counting) {
    count++;
    $(countBtn).text(`Count: ${count}`);
  }
}, 100);

$(countBtn).click(() => {
  counting = !counting;
  $(countBtn).text(counting ? `Count: ${count}` : "Disabled")
});

// -------------------------------------------------------------

const countingSignal = Rx.Observable
  .fromEvent($("#countBtn"), "click")
  .scan(counting => !counting, true)
  .startWith(true);

Rx.Observable
  .interval(100)
  .pausable(countingSignal)
  .scan(count => count + 1, 0)
  .startWith(0)
  .combineLatest(
    countingSignal,
    (count, counting) => counting ? `Count: ${count}` : "Disabled")
	.subscribe(s => $("#countBtn").text(s));

// -------------------------------------------------------------

rlet count(0) = fps10, count + 1;

rlet btnClicks(null);
$(countBtn).click(() => btnClicks = null);
rlet counting(true) = btnClicks, !counting;

rlet label = counting ? `Count: ${count}` : "Disabled";
subscribe(label) { $("#countBtn").text(label); }

// -------------------------------------------------------------

rlet count subscribe(fps10) initially(0) = count + 1;

rlet btnClicks = subscribe($(countBtn).click);

rlet counting subscribe(btnClicks) initially(false) = !counting;

rlet label = counting ? `Count: ${count}` : "Disabled";
subscribe(label) { $("#countBtn").text(label); }
// -------------------------------------------------------------

rlet count = initially(0), subscribe(fps10), count + 1;

rlet btnClicks = subscribe($(countBtn).click);

rlet counting = initially(false), subscribe(btnClicks), !counting;

rlet label = counting ? `Count: ${count}` : "Disabled";
subscribe(label) { $("#countBtn").text(label); }
