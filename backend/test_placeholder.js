async function test() {
  try {
    const res = await fetch('https://loremflickr.com/400/400/laptop?lock=1');
    console.log("STATUS:", res.status);
    console.log("URL:", res.url);
  } catch(e) { console.error(e); }
}
test();
