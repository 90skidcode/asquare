import "server-only";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/utils";

export async function getCustomerLedger(customerId: string) {
  const [trips, payments] = await Promise.all([
    prisma.tripSheet.findMany({
      where: { customerId },
      orderBy: { tripDate: "desc" },
      include: { vehicle: true },
    }),
    prisma.payment.findMany({
      where: { customerId, type: "CUSTOMER_RECEIPT" },
      orderBy: { date: "desc" },
    }),
  ]);

  const billed = trips.reduce((sum, t) => sum + toNumber(t.customerCharges), 0);
  const received = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);

  return { trips, payments, billed, received, outstanding: billed - received };
}

export async function getDealerLedger(dealerId: string) {
  const [trips, payments, vehicles] = await Promise.all([
    prisma.tripSheet.findMany({
      where: { dealerId },
      orderBy: { tripDate: "desc" },
      include: { customer: true, vehicle: true },
    }),
    prisma.payment.findMany({
      where: { dealerId, type: "DEALER_PAYMENT" },
      orderBy: { date: "desc" },
    }),
    prisma.vehicle.findMany({ where: { dealerId } }),
  ]);

  const billed = trips.reduce((sum, t) => sum + toNumber(t.dealerCharges), 0);
  const paid = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);

  return { trips, payments, vehicles, billed, paid, outstanding: billed - paid };
}

export async function getInvestorLedger(investorId: string) {
  const [trips, payments, vehicles, investments] = await Promise.all([
    prisma.tripSheet.findMany({
      where: { investorId },
      orderBy: { tripDate: "desc" },
      include: { customer: true, vehicle: true },
    }),
    prisma.payment.findMany({
      where: { investorId, type: "INVESTOR_SETTLEMENT" },
      orderBy: { date: "desc" },
    }),
    prisma.vehicle.findMany({ where: { investorId } }),
    prisma.investmentRecord.findMany({
      where: { investorId },
      orderBy: { date: "desc" },
      include: { vehicle: true },
    }),
  ]);

  const settlementDue = trips.reduce((sum, t) => sum + toNumber(t.investorSettlement), 0);
  const settled = payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
  const totalInvested = investments.reduce((sum, i) => sum + toNumber(i.amount), 0);

  return {
    trips,
    payments,
    vehicles,
    investments,
    settlementDue,
    settled,
    outstanding: settlementDue - settled,
    totalInvested,
  };
}
