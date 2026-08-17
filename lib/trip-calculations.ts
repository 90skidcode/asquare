export type TripCalcInput = {
  openingKm: number;
  closingKm: number;
  includedKm: number;
  extraKmRate: number;
  waitingCharges: number;
  tollCharges: number;
  parkingCharges: number;
  driverBata: number;
  permitCharges: number;
  fuelCharges: number;
  otherExpenses: number;
  customerCharges: number;
};

export type TripCalcResult = {
  totalKm: number;
  extraKm: number;
  extraKmAmount: number;
  totalExpenses: number;
  netRevenue: number;
};

/** Single source of truth for Trip Sheet derived numbers — used by both the
 *  live form preview (client) and the server action that persists a trip. */
export function calculateTrip(input: TripCalcInput): TripCalcResult {
  const totalKm = Math.max(input.closingKm - input.openingKm, 0);
  const extraKm = Math.max(totalKm - input.includedKm, 0);
  const extraKmAmount = extraKm * input.extraKmRate;

  const totalExpenses =
    extraKmAmount +
    input.waitingCharges +
    input.tollCharges +
    input.parkingCharges +
    input.driverBata +
    input.permitCharges +
    input.fuelCharges +
    input.otherExpenses;

  const netRevenue = input.customerCharges - totalExpenses;

  return { totalKm, extraKm, extraKmAmount, totalExpenses, netRevenue };
}
