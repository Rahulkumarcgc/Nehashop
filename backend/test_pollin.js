async function test() {
  try {
    const res = await fetch('https://image.pollinations.ai/prompt/laptop');
    console.log("STATUS:", res.status);
    console.log("URL:", res.url);
  } catch(e) { console.error(e); }
}
test();
