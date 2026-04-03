async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/reviews', { method: 'POST' });
    console.log("STATUS:", res.status);
    console.log("HEADERS:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("BODY:", text);
  } catch(e) {
    console.error("FETCH ERROR:", e);
  }
}
test();
