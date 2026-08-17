import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (careful in production!)
  await Promise.all([
    prisma.tripAttachment.deleteMany({}),
    prisma.payment.deleteMany({}),
    prisma.investmentRecord.deleteMany({}),
    prisma.tripSheet.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.activityLog.deleteMany({}),
  ]);
  console.log("  ✓ Cleared existing data");

  // Create users
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "ChangeMe@123", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@asquare.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  const staff = await prisma.user.create({
    data: {
      name: "Staff User",
      email: "staff@asquare.local",
      passwordHash: adminPassword,
      role: "STAFF",
    },
  });
  console.log("  ✓ Created users (login: admin@asquare.local / staff@asquare.local)");

  // Create investors
  const inv1 = await prisma.investor.create({
    data: {
      code: "INV-0001",
      name: "Rajesh Investments",
      phone: "+91-9876543210",
      email: "rajesh@inv.com",
      bankName: "HDFC Bank",
      bankAccount: "1234567890123",
      bankIfsc: "HDFC0001234",
      address: "Chennai, TN",
    },
  });
  const inv2 = await prisma.investor.create({
    data: {
      code: "INV-0002",
      name: "Priya Capital",
      phone: "+91-9123456789",
      email: "priya@capital.com",
      bankName: "ICICI Bank",
      bankAccount: "9876543210987",
      bankIfsc: "ICIC0000001",
      address: "Bangalore, KA",
    },
  });
  console.log("  ✓ Created investors");

  // Create dealers
  const dl1 = await prisma.dealer.create({
    data: {
      code: "DLR-0001",
      name: "Kumar Travel Services",
      phone: "+91-8765432109",
      email: "kumar@travels.com",
      commissionRate: 5.0,
      address: "Velachery, Chennai",
    },
  });
  const dl2 = await prisma.dealer.create({
    data: {
      code: "DLR-0002",
      name: "Express Rentals",
      phone: "+91-7654321098",
      email: "info@expressrentals.com",
      commissionRate: 3.5,
      address: "Adyar, Chennai",
    },
  });
  console.log("  ✓ Created dealers");

  // Create vehicles
  const v1 = await prisma.vehicle.create({
    data: {
      plateNumber: "TN06AB0001",
      model: "Toyota Innova",
      type: "SUV",
      capacity: 7,
      investorId: inv1.id,
      dealerId: dl1.id,
      status: "ACTIVE",
    },
  });
  const v2 = await prisma.vehicle.create({
    data: {
      plateNumber: "TN06AB0002",
      model: "Maruti Swift",
      type: "Hatchback",
      capacity: 5,
      investorId: inv2.id,
      dealerId: dl2.id,
      status: "ACTIVE",
    },
  });
  const v3 = await prisma.vehicle.create({
    data: {
      plateNumber: "TN06AB0003",
      model: "Hyundai i20",
      type: "Sedan",
      capacity: 5,
      investorId: inv1.id,
      status: "ACTIVE",
    },
  });
  console.log("  ✓ Created vehicles");

  // Create customers
  const cust1 = await prisma.customer.create({
    data: {
      code: "CUS-0001",
      name: "Acme Corporation",
      phone: "+91-4444555566",
      email: "booking@acmecorp.com",
      address: "Nungambakkam, Chennai",
      gstNumber: "33AABCT0001A1Z0",
    },
  });
  const cust2 = await prisma.customer.create({
    data: {
      code: "CUS-0002",
      name: "Tech Solutions Ltd",
      phone: "+91-4445556666",
      email: "ops@techsol.com",
      address: "T. Nagar, Chennai",
      gstNumber: "33AABCU0002A2Z0",
    },
  });
  const cust3 = await prisma.customer.create({
    data: {
      code: "CUS-0003",
      name: "Event Planners Inc",
      phone: "+91-9999888877",
      email: "events@planners.com",
      address: "Egmore, Chennai",
    },
  });
  console.log("  ✓ Created customers");

  // Create trip sheets (sample data)
  const now = new Date();
  const trip1 = await prisma.tripSheet.create({
    data: {
      tripNumber: `TS-${now.getFullYear()}-00001`,
      tripDate: new Date(now.getFullYear(), now.getMonth(), 1),
      customerId: cust1.id,
      vehicleId: v1.id,
      dealerId: dl1.id,
      investorId: inv1.id,
      driverName: "Ramesh Kumar",
      driverPhone: "+91-9000000001",
      pickupLocation: "Nungambakkam",
      dropLocation: "Bangalore",
      tripType: "OUTSTATION",
      startDateTime: new Date(now.getFullYear(), now.getMonth(), 1, 8, 0),
      endDateTime: new Date(now.getFullYear(), now.getMonth(), 1, 20, 0),
      openingKm: 15000,
      closingKm: 15350,
      includedKm: 250,
      extraKmRate: 15,
      waitingCharges: 500,
      tollCharges: 300,
      parkingCharges: 200,
      driverBata: 400,
      permitCharges: 0,
      fuelCharges: 0,
      otherExpenses: 100,
      customerCharges: 4000,
      dealerCharges: 200,
      investorSettlement: 1000,
      totalKm: 350,
      extraKm: 100,
      extraKmAmount: 1500,
      totalExpenses: 2400,
      netRevenue: 1600,
      tripStatus: "COMPLETED",
      paymentStatus: "PAID",
      createdById: staff.id,
    },
  });

  const trip2 = await prisma.tripSheet.create({
    data: {
      tripNumber: `TS-${now.getFullYear()}-00002`,
      tripDate: new Date(now.getFullYear(), now.getMonth(), 5),
      customerId: cust2.id,
      vehicleId: v2.id,
      dealerId: dl2.id,
      investorId: inv2.id,
      driverName: "Suresh Patel",
      driverPhone: "+91-9000000002",
      pickupLocation: "T. Nagar",
      dropLocation: "Ooty",
      tripType: "OUTSTATION",
      startDateTime: new Date(now.getFullYear(), now.getMonth(), 5, 6, 0),
      endDateTime: new Date(now.getFullYear(), now.getMonth(), 5, 18, 0),
      openingKm: 45000,
      closingKm: 45280,
      includedKm: 250,
      extraKmRate: 12,
      waitingCharges: 300,
      tollCharges: 250,
      parkingCharges: 150,
      driverBata: 300,
      permitCharges: 0,
      fuelCharges: 0,
      otherExpenses: 50,
      customerCharges: 3500,
      dealerCharges: 120,
      investorSettlement: 800,
      totalKm: 280,
      extraKm: 30,
      extraKmAmount: 360,
      totalExpenses: 1410,
      netRevenue: 2090,
      tripStatus: "COMPLETED",
      paymentStatus: "PARTIAL",
      createdById: staff.id,
    },
  });

  console.log("  ✓ Created trip sheets");

  // Create investment record
  await prisma.investmentRecord.create({
    data: {
      investorId: inv1.id,
      vehicleId: v1.id,
      amount: 500000,
      date: new Date(now.getFullYear() - 1, 0, 1),
    },
  });
  console.log("  ✓ Created investment records");

  // Create payments
  await prisma.payment.create({
    data: {
      type: "CUSTOMER_RECEIPT",
      amount: 4000,
      date: new Date(now.getFullYear(), now.getMonth(), 2),
      mode: "BANK_TRANSFER",
      reference: "TRF-2026-001",
      customerId: cust1.id,
      tripSheetId: trip1.id,
    },
  });
  await prisma.payment.create({
    data: {
      type: "DEALER_PAYMENT",
      amount: 200,
      date: new Date(now.getFullYear(), now.getMonth(), 3),
      mode: "CASH",
      dealerId: dl1.id,
      tripSheetId: trip1.id,
    },
  });
  console.log("  ✓ Created payments");

  console.log("\n✅ Seed completed!");
  console.log("\n📝 Login Credentials:");
  console.log(`   Admin:  admin@asquare.local`);
  console.log(`   Staff:  staff@asquare.local`);
  console.log(`   Password: ${process.env.SEED_ADMIN_PASSWORD || "ChangeMe@123"}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
