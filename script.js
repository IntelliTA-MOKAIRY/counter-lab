  let count = 0;

  // Checkpoint 1: make increment() increase count by 1
  function increment() {
    // TODO
  }

  // Checkpoint 2: make decrement() decrease count by 1
  function decrement() {
    // TODO
  }

  // Checkpoint 3: make getCount() return the current count
  function getCount() {
    // TODO
  }

  // Checkpoint 4: make displayCount() show the count in the #count element
  function displayCount() {
    // TODO
  }

  // Wiring (already done for you)
  document.getElementById("increaseBtn").addEventListener("click", () => { increment(); displayCount(); });
  document.getElementById("decreaseBtn").addEventListener("click", () => { decrement(); displayCount(); });
  displayCount();