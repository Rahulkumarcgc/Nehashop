async function run() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst();
  
  if(!user) return console.log("No user");

  try {
    const res = await fetch('http://localhost:5000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: user.clerkUserId,
        productId: 1, 
        rating: 5,
        comment: 'frontend simulation review'
      })
    });
    console.log("STATUS:", res.status);
    const json = await res.json();
    console.log("RESPONSE:", json);
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
