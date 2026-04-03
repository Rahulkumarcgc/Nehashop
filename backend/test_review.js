async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: 'user_2m', // some fake ID
        productId: 1, 
        rating: 4,
        comment: 'very good product must buy...'
      })
    });
    const data = await res.json();
    console.log(data);
  } catch(e) {
    console.error(e);
  }
}
test();
