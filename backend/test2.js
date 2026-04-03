async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/wishlist/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: 'test',
        items: []
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
