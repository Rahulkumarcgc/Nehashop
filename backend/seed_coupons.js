const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCustomCoupons() {
  const customCoupons = [
    {
      code: "RAHA1618",
      discountType: "percentage",
      discountValue: 16, // 16% off
      minOrderAmount: 0,
      maxDiscount: 200,
      isActive: true
    },
    {
      code: "NEHA16",
      discountType: "percentage",
      discountValue: 16, // 16% off
      minOrderAmount: 0,
      maxDiscount: 250,
      isActive: true
    },
    {
      code: "BUBU16",
      discountType: "percentage",
      discountValue: 16, // 16% off
      minOrderAmount: 0,
      maxDiscount: 150,
      isActive: true
    }
  ];

  console.log("Adding new custom coupons...");
  
  for (const couponData of customCoupons) {
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: couponData.code }
    });

    if (!existingCoupon) {
      await prisma.coupon.create({
        data: couponData
      });
      console.log(`✅ Coupon ${couponData.code} added successfully.`);
    } else {
      console.log(`⚡ Coupon ${couponData.code} already exists.`);
    }
  }
}

addCustomCoupons()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
