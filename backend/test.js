async function test() {
  try {
    const fetch = require('node:fetch'); // Node 24 native fetch is global, but wait!
  } catch(e) {}
  
  try {
    const res = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: 'user_2m', // invalid
        productId: 1, 
        rating: 4,
        comment: 'very good product must buy...'
      })
    });
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log("BODY:", text);
  } catch(e) {
    console.error("FETCH ERROR:", e);
  }
}
test();
