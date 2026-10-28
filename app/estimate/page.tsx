"use client";

import Link from "next/link";
import { jsPDF } from "jspdf";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

type PricedItem = {
  name: string;
  price: number;
};

type GuestCategory = {
  name: string;
  description: string;
  price: number;
};

const MINIMUM_BOOKING_CHARGE = 600;
const MINIMUM_GUEST_SLOTS = 10;
const PROTEINS_PER_GUEST_SLOT = 2;

const BUSINESS_ADDRESS =
  "9083 Arcadia Ave, San Gabriel, CA 91775";
const FREE_TRAVEL_MILES = 20;
const TRAVEL_PRICE_PER_EXTRA_MILE = 2;

const guestCategories: GuestCategory[] = [
  {
    name: "Adults",
    description: "Ages 14 and up",
    price: 60,
  },
  {
    name: "Children",
    description: "Ages 5–13",
    price: 30,
  },
  {
    name: "Children Under 5",
    description: "Ages 4 and under",
    price: 0,
  },
];

const proteins = [
  "New York Steak",
  "Chicken",
  "Shrimp",
  "Tuna",
  "Tofu",
];

const addOns: PricedItem[] = [
  {
    name: "Extra Chicken",
    price: 6,
  },
  {
  name: "Filet Mignon Upgrade",
  price: 15,
},
 {
  name: "Extra New York Steak",
  price: 15,
},
{
  name: "Lamb Chops",
  price: 28,
},
  {
    name: "Extra Shrimp",
    price: 8,
  },
  {
    name: "Lobster Tail",
    price:50,
  },
  {
    name: "Extra Filet Mignon",
    price:30,
  },
  {
    name: "Calamari Steak",
    price:20,
  },

  {
    name: "Edamame",
    price:6,
  },
  {
    name: "Extra Fried Rice",
    price:4,
  },
  {
    name: "Extra Vegetables",
    price: 4,
  },
  {
    name: "Scallops",
    price:20,
  },
  {
    name: "Salmon",
    price:20,
  },
  {
    name: "Extra Salad",
    price: 3,
  },
  {
    name: "Gyoza",
    price: 15,
  },
  {
    name: "Noodles",
    price: 5,
  },
  {
    name: "Sushi",
    price: 15,
  },
 {
  name: "Extra Tofu",
  price: 8,
},
{
  name: "Wagyu Beef",
  price: 129
},
{
  name: "Halal Steak",
  price:99,
},
{
  name: "Halal Wagyu Beef",
  price: 199,
},
{
  name: "Extra Tuna",
  price:20,
},
{
  name: "Full Halal Upgrade",
  price: 259,
},
{
  name: "Full Kosher Upgrade",
  price: 199,
},
];

const proteinToAddOn: Record<string, string> = {
  Chicken: "Extra Chicken",
  "New York Steak": "Extra New York Steak",
  Shrimp: "Extra Shrimp",
  Tuna: "Extra Tuna",
  Tofu: "Extra Tofu",
};

export default function EstimatePage() {
  const [guestQuantities, setGuestQuantities] = useState<
    Record<string, number>
  >({});

  const [proteinQuantities, setProteinQuantities] = useState<
    Record<string, number>
  >({});

  const [addOnQuantities, setAddOnQuantities] = useState<
    Record<string, number>
  >({});

  const [tablesAndChairsSelected, setTablesAndChairsSelected] = useState(false);
  const [tableSetupSelected, setTableSetupSelected] = useState(false);

  const [eventAddress, setEventAddress] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventZipCode, setEventZipCode] = useState("");

  const [distanceMiles, setDistanceMiles] = useState(0);
  const [extraMiles, setExtraMiles] = useState(0);
  const [travelFee, setTravelFee] = useState(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceCalculated, setDistanceCalculated] = useState(false);
  const [distanceError, setDistanceError] = useState("");
  const [salesTaxRate, setSalesTaxRate] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState(""); 

  const totalGuests = useMemo(() => {
    return guestCategories.reduce((total, category) => {
      return total + (guestQuantities[category.name] || 0);
    }, 0);
  }, [guestQuantities]);

  const calculatedGuestTotal = useMemo(() => {
    return guestCategories.reduce((total, category) => {
      const quantity = guestQuantities[category.name] || 0;

      return total + quantity * category.price;
    }, 0);
  }, [guestQuantities]);

  const chargedGuestTotal = Math.max(
  calculatedGuestTotal,
  MINIMUM_BOOKING_CHARGE,
);

const minimumChargeAdjustment = Math.max(
  0,
  MINIMUM_BOOKING_CHARGE - calculatedGuestTotal,
);

  /*
   * 不足 10 人的空缺名额。
   *
   * 例如：
   * 实际 5 人
   * 10 - 5 = 5 个空缺名额
   */
  const complimentaryGuestSlots = Math.max(
    0,
    MINIMUM_GUEST_SLOTS - totalGuests,
  );

  /*
   * 每个实际客人正常包含 2 份蛋白质。
   * 每个空缺名额也额外赠送 2 份蛋白质。
   *
   * 实际 5 人：
   * 正常蛋白质：5 × 2 = 10
   * 赠送蛋白质：5 × 2 = 10
   * 总共可选：20
   */
  const adultProteinAllowance =
    (guestQuantities["Adults"] || 0) * 2;

  const childProteinAllowance =
    (guestQuantities["Children"] || 0) * 1;

  const underFiveProteinAllowance =
    (guestQuantities["Children Under 5"] || 0) * 0;

  const regularProteinAllowance =
    adultProteinAllowance +
    childProteinAllowance +
    underFiveProteinAllowance;

  const complimentaryProteinAllowance =
    complimentaryGuestSlots * PROTEINS_PER_GUEST_SLOT;

const totalIncludedProteinAllowance = Math.max(
  regularProteinAllowance + complimentaryProteinAllowance,
  MINIMUM_GUEST_SLOTS * PROTEINS_PER_GUEST_SLOT
);

  const totalProteinSelections = useMemo(() => {
    return proteins.reduce((total, protein) => {
      return total + (proteinQuantities[protein] || 0);
    }, 0);
  }, [proteinQuantities]);

  const remainingProteinAllowance = Math.max(
    0,
    totalIncludedProteinAllowance - totalProteinSelections,
  );

  const addOnsTotal = useMemo(() => {
    return addOns.reduce((total, item) => {
      const quantity = addOnQuantities[item.name] || 0;

      return total + quantity * item.price;
    }, 0);
  }, [addOnQuantities]);

  const setupPricePerPerson =
    (tablesAndChairsSelected ? 6 : 0) +
    (tableSetupSelected ? 14 : 0);

  const setupFee = totalGuests * setupPricePerPerson;

  const setupOptionLabel =
    tablesAndChairsSelected && tableSetupSelected
      ? "Tables & Chairs + Tableware, Flowers & Table Lighting"
      : tablesAndChairsSelected
        ? "Tables & Chairs"
        : tableSetupSelected
          ? "Tableware, Flowers & Table Lighting"
          : "No Event Setup";

  const subtotal =
  Math.max(
    calculatedGuestTotal + addOnsTotal,
    MINIMUM_BOOKING_CHARGE,
  ) +
  travelFee +
  setupFee;

const salesTax =
    salesTaxRate === null ? 0 : subtotal * salesTaxRate;

  const estimatedTotal = subtotal + salesTax - discount;

  const completeEventAddress = [
    eventAddress.trim(),
    eventCity.trim(),
    eventZipCode.trim(),
    "California",
  ]
    .filter(Boolean)
    .join(", ");

  // ZIP code is required. Street address improves route accuracy and is
  // required by the tax lookup; ZIP-only travel results are estimates.
  useEffect(() => {
    const addressIsComplete = /^\d{5}$/.test(eventZipCode.trim());

    if (!addressIsComplete) {
      setDistanceMiles(0);
      setExtraMiles(0);
      setTravelFee(0);
      setDistanceLoading(false);
      setDistanceCalculated(false);
      setDistanceError("");
      setSalesTaxRate(null);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setDistanceLoading(true);
        setDistanceCalculated(false);
        setDistanceError("");

        const response = await fetch("/api/distance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destinationAddress: completeEventAddress,
            address: eventAddress.trim(),
            city: eventCity.trim(),
            zip: eventZipCode.trim(),
          }),
          signal: controller.signal,
        });

        const responseText = await response.text();

        let data: {
          distanceMiles?: number;
          extraMiles?: number;
          travelFee?: number;
          salesTaxRate?: number;
          taxJurisdiction?: string;
          error?: string;
        };

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "Distance service returned an invalid response. Check app/api/distance/route.ts.",
          );
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to calculate the travel distance.",
          );
        }

        setDistanceMiles(Number(data.distanceMiles || 0));
        setExtraMiles(Number(data.extraMiles || 0));
        setTravelFee(Number(data.travelFee || 0));
        setSalesTaxRate(
          typeof data.salesTaxRate === "number"
            ? data.salesTaxRate
            : null,
        );
        setDistanceCalculated(true);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        setDistanceMiles(0);
        setExtraMiles(0);
        setTravelFee(0);
        setDistanceCalculated(false);
        setSalesTaxRate(null);
        setDistanceError(
          error instanceof Error
            ? error.message
            : "Unable to calculate the travel distance.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setDistanceLoading(false);
        }
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    eventAddress,
    eventCity,
    eventZipCode,
    completeEventAddress,
  ]);

  function updateQuantity(
    setter: Dispatch<SetStateAction<Record<string, number>>>,
    name: string,
    quantity: number,
  ) {
    const safeQuantity = Math.max(
      0,
      Math.min(
        100,
        Number.isNaN(quantity)
          ? 0
          : Math.round(quantity * 2) / 2,
      ),
    );

    setter((current) => ({
      ...current,
      [name]: safeQuantity,
    }));
  }

  function decreaseQuantity(
    values: Record<string, number>,
    setter: Dispatch<SetStateAction<Record<string, number>>>,
    name: string,
  ) {
    const currentQuantity = values[name] || 0;

    updateQuantity(setter, name, currentQuantity - 1);
  }

  function increaseQuantity(
    values: Record<string, number>,
    setter: Dispatch<SetStateAction<Record<string, number>>>,
    name: string,
  ) {
    const currentQuantity = values[name] || 0;

    updateQuantity(setter, name, currentQuantity + 1);
  }

  function decreaseGuestQuantity(name: string) {
    const currentQuantity = guestQuantities[name] || 0;

    setGuestQuantities((current) => ({
      ...current,
      [name]: Math.max(0, currentQuantity - 1),
    }));
  }

  function increaseGuestQuantity(name: string) {
    const currentQuantity = guestQuantities[name] || 0;

    setGuestQuantities((current) => ({
      ...current,
      [name]: Math.min(100, currentQuantity + 1),
    }));
  }

  function setGuestQuantity(name: string, quantity: number) {
    const safeQuantity = Math.max(
      0,
      Math.min(
        100,
        Number.isNaN(quantity) ? 0 : Math.floor(quantity),
      ),
    );

    setGuestQuantities((current) => ({
      ...current,
      [name]: safeQuantity,
    }));
  }

  function increaseProteinQuantity(protein: string) {
    const currentIncludedQuantity =
      proteinQuantities[protein] || 0;

    const availableIncludedPortions = Math.max(
      0,
      totalIncludedProteinAllowance - totalProteinSelections,
    );

    if (availableIncludedPortions > 0) {
      const includedIncrease = Math.min(
        1,
        availableIncludedPortions,
      );

      updateQuantity(
        setProteinQuantities,
        protein,
        currentIncludedQuantity + includedIncrease,
      );

      const paidIncrease = 1 - includedIncrease;

      if (paidIncrease > 0) {
        const addOnName = proteinToAddOn[protein];

        updateQuantity(
          setAddOnQuantities,
          addOnName,
          (addOnQuantities[addOnName] || 0) + paidIncrease,
        );
      }

      return;
    }

    const addOnName = proteinToAddOn[protein];

    updateQuantity(
      setAddOnQuantities,
      addOnName,
      (addOnQuantities[addOnName] || 0) + 1,
    );
  }

  function decreaseProteinQuantity(protein: string) {
    const addOnName = proteinToAddOn[protein];
    const paidQuantity = addOnQuantities[addOnName] || 0;

    if (paidQuantity > 0) {
      updateQuantity(
        setAddOnQuantities,
        addOnName,
        paidQuantity - 1,
      );
      return;
    }

    decreaseQuantity(
      proteinQuantities,
      setProteinQuantities,
      protein,
    );
  }

  function setProteinQuantity(
    protein: string,
    requestedQuantity: number,
  ) {
    const safeRequestedQuantity = Math.max(
      0,
      Math.min(
        100,
        Number.isNaN(requestedQuantity)
          ? 0
          : Math.round(requestedQuantity * 2) / 2,
      ),
    );

    const otherIncludedSelections =
      totalProteinSelections -
      (proteinQuantities[protein] || 0);

    const includedCapacityForProtein = Math.max(
      0,
      totalIncludedProteinAllowance -
        otherIncludedSelections,
    );

    const includedQuantity = Math.min(
      safeRequestedQuantity,
      includedCapacityForProtein,
    );

    const paidQuantity = Math.max(
      0,
      safeRequestedQuantity - includedQuantity,
    );

    updateQuantity(
      setProteinQuantities,
      protein,
      includedQuantity,
    );

    updateQuantity(
      setAddOnQuantities,
      proteinToAddOn[protein],
      paidQuantity,
    );
  }

  const downloadPDFQuote = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("SONG TEPPANYAKI", 20, 20);

  doc.setFontSize(14);
  doc.text("Estimated Event Quote", 20, 32);

  doc.setFontSize(11);

  let y = 45;

  doc.text(`Event Address: ${eventAddress || "Not provided"}`, 20, y);
  y += 8;

  doc.text(`City: ${eventCity || "Not provided"}`, 20, y);
  y += 8;

  doc.text(`ZIP Code: ${eventZipCode || "Not provided"}`, 20, y);
  y += 8;

  doc.text(`Total Guests: ${totalGuests}`, 20, y);
  y += 12;

  doc.setFontSize(13);
  // Protein Selection
doc.setFontSize(13);
doc.text("Protein Selection", 20, y);
y += 9;

doc.setFontSize(11);

const selectedProteins = Object.entries(proteinQuantities).filter(
  ([, quantity]) => quantity > 0,
);

if (selectedProteins.length === 0) {
  doc.text("No proteins selected", 20, y);
  y += 7;
} else {
  selectedProteins.forEach(([name, quantity]) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(`${name}: ${quantity} portions`, 20, y);
    y += 7;
  });
}

y += 5;

// Add-on Selection
doc.setFontSize(13);
doc.text("Add-on Selection", 20, y);
y += 9;

doc.setFontSize(11);

const selectedAddOns = Object.entries(addOnQuantities).filter(
  ([, quantity]) => quantity > 0,
);

if (selectedAddOns.length === 0) {
  doc.text("No add-ons selected", 20, y);
  y += 7;
} else {
  selectedAddOns.forEach(([name, quantity]) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.text(`${name}: ${quantity}`, 20, y);
    y += 7;
  });
}

y += 12;

// Price Summary
doc.setFontSize(13);
doc.text("Price Summary", 20, y);
y += 9;

doc.setFontSize(11);
  doc.text("Price Summary", 20, y);
  y += 9;

  doc.setFontSize(11);

  doc.text(`Guest Charges: $${calculatedGuestTotal.toFixed(2)}`, 20, y);
  y += 8;

  doc.text(`Add-ons: $${addOnsTotal.toFixed(2)}`, 20, y);
y += 8;

const pdfMinimumChargeAdjustment = Math.max(
  0,
  MINIMUM_BOOKING_CHARGE -
    calculatedGuestTotal -
    addOnsTotal,
);

doc.text(
  `Minimum Charge Adjustment: $${pdfMinimumChargeAdjustment.toFixed(2)}`,
  20,
  y,
);
y += 8;

doc.text(`Event Setup: $${setupFee.toFixed(2)}`, 20, y);
y += 8;

doc.text(`Travel Fee: $${travelFee.toFixed(2)}`, 20, y);
y += 8;

doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, y);
y += 8;

doc.text(
  `Sales Tax Rate: ${
    salesTaxRate === null
      ? "Not calculated"
      : `${(salesTaxRate * 100).toFixed(3)}%`
  }`,
  20,
  y,
);
y += 8;

doc.text(`Sales Tax: $${salesTax.toFixed(2)}`, 20, y);
y += 8;

doc.text(`Discount: -$${discount.toFixed(2)}`, 20, y);
y += 8;

doc.setFontSize(14);
doc.text(`Estimated Total: $${estimatedTotal.toFixed(2)}`, 20, y);
y += 12;

doc.setFontSize(12);
doc.text("Optional Chef Tip (Not Included)", 20, y);
y += 8;

doc.setFontSize(11);

doc.text(
  `20% Tip: $${(estimatedTotal * 0.2).toFixed(2)}`,
  20,
  y,
);
y += 7;

doc.text(
  `25% Tip: $${(estimatedTotal * 0.25).toFixed(2)}`,
  20,
  y,
);
y += 7;

doc.text(
  `30% Tip: $${(estimatedTotal * 0.3).toFixed(2)}`,
  20,
  y,
);
y += 10;

doc.setFontSize(9);
doc.text(
  "Tips are voluntary and are not included in the estimated total.",
  20,
  y,
  { maxWidth: 170 },
);
y += 8;

  doc.setFontSize(9);
  doc.text(
    "This is an estimate. Final pricing may change based on event details.",
    20,
    y,
    { maxWidth: 170 },
  );

  doc.save("Song-Teppanyaki-Quote.pdf");
};

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold tracking-widest text-yellow-400"
          >
            SONG
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-300 transition hover:text-yellow-400"
          >
            Back to Home
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <p className="text-sm tracking-[0.35em] text-yellow-400">
            PRIVATE HIBACHI EXPERIENCE
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Get Your Estimate
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
          Customize your menu and event setup to see an estimated price. No payment or booking is required.
          </p>
        </div>


          {/* Event Address */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400">Event Address</h2>
            <p className="mt-2 text-sm text-gray-400">
              ZIP Code is required. Street address is optional but recommended for a more accurate driving distance and sales tax lookup. With ZIP Code only, travel distance may be approximate and sales tax will remain unavailable until a street address is entered.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">Street Address (Optional)</span>
                <input
                  type="text"
                  value={eventAddress}
                  onChange={(event) => setEventAddress(event.target.value)}
                  placeholder="Street address"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">City (Optional)</span>
                <input
                  type="text"
                  value={eventCity}
                  onChange={(event) => setEventCity(event.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-200">ZIP Code *</span>
                <input
                  type="text"
                  value={eventZipCode}
                  onChange={(event) => setEventZipCode(event.target.value)}
                  placeholder="ZIP code"
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-yellow-400"
                />
              </label>
            </div>
            <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
              <p className="font-bold text-yellow-400">Travel Fee</p>
              <p className="mt-2 text-sm leading-6 text-gray-300">
                Free travel within {FREE_TRAVEL_MILES} miles of {BUSINESS_ADDRESS}. Each additional mile is ${TRAVEL_PRICE_PER_EXTRA_MILE}.
              </p>
              {distanceLoading && <p className="mt-4 text-sm font-semibold">Calculating driving distance and travel fee...</p>}
              {distanceError && <p className="mt-4 text-sm font-semibold text-red-300">{distanceError}</p>}
              {distanceCalculated && !distanceLoading && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <SummaryBox label="Driving Distance" value={`${distanceMiles.toFixed(1)} mi`} />
                  <SummaryBox label="Chargeable Distance" value={`${extraMiles} mi`} />
                  <SummaryBox label="Travel Fee" value={`$${travelFee.toFixed(2)}`} highlighted />
                </div>
              )}
            </div>
          </section>

        <div className="space-y-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl md:p-10">
          {/* Guest Pricing */}
          <section>
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Number of Guests *
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Enter the number of guests in each age group.
                </p>

                <p className="mt-2 text-sm font-semibold text-yellow-400">
                 A $600 minimum event spend applies to every booking. Add-ons, travel fees, event setup, and sales tax are charged separately.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Minimum Event Spend
                </p>

                <p className="mt-1 text-2xl font-bold text-yellow-400">
                  ${chargedGuestTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {guestCategories.map((category) => {
                const quantity =
                  guestQuantities[category.name] || 0;

                const subtotal =
                  quantity * category.price;

                return (
                  <div
                    key={category.name}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-white">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        {category.description}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-yellow-400">
                        {category.price === 0
                          ? "Free"
                          : `$${category.price.toFixed(2)} per guest`}
                      </p>
                    </div>

                    <QuantityControl
                      name={category.name}
                      quantity={quantity}
                      onDecrease={() =>
                        decreaseGuestQuantity(category.name)
                      }
                      onIncrease={() =>
                        increaseGuestQuantity(category.name)
                      }
                      onChange={(value) =>
                        setGuestQuantity(category.name, value)
                      }
                    />

                    <div className="min-w-28 text-left md:text-right">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Subtotal
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SummaryBox
                label="Total Guests"
                value={String(totalGuests)}
              />

              <SummaryBox
                label="Food Subtotal"
                value={`$${calculatedGuestTotal.toFixed(2)}`}
              />

              <SummaryBox
                label="Minimum Event Spend"
                value={`$${chargedGuestTotal.toFixed(2)}`}
                highlighted
              />
            </div>

            {minimumChargeAdjustment > 0 && (
              <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                <p className="font-semibold text-yellow-400">
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Your Food Subtotal is below the $600 minimum, so the $600 minimum event spend applies.
                </p>
                <div className="mt-4 pt-4 border-t border-yellow-400/30">
  <p className="mt-1 text-gray-300">
    The remaining balance is due at the end of the service on the event date.
  </p>
</div>
              </div>
            )}
          </section>

          {/* Protein Quantities */}
          <section>
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-2xl font-bold text-yellow-400">
                Protein Selection
              </h2>

              <p className="mt-2 text-2xl text-gray-400">
                Choose from New York Steak, Chicken, Shrimp, Tuna and Tofu. Each paid adult includes 2 protein portions. Children ages 5–13 include 1 protein portion. Children under 5 do not include a protein portion. Once the included protein allowance is used, additional Chicken, Steak, or Shrimp will be charged as add-ons.
              </p>
            </div>

            {false && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ProteinSummaryCard
                label="Actual Guest Protein Portions"
                value={regularProteinAllowance}
                description={`Adults: ${adultProteinAllowance}, children: ${childProteinAllowance}, under 5: ${underFiveProteinAllowance}`}
              />

              <ProteinSummaryCard
                label="Complimentary Protein Portions"
                value={complimentaryProteinAllowance}
              description="Included with your minimum booking."
                highlighted
              />

              <ProteinSummaryCard
                label="Total Included Proteins"
                value={totalIncludedProteinAllowance}
                description="Included with your booking"
                highlighted
              />

              <ProteinSummaryCard
  label="Remaining Protein Choices"
  value={remainingProteinAllowance}
  description="Protein choices still available."
/>
            </div>
)}
            {totalGuests > 0 &&
              complimentaryGuestSlots > 0 && (
                <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                  <p className="font-bold text-yellow-400">
                    Complimentary Protein Benefit
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-200">
                   Your booking includes additional protein portions to meet our $600 minimum booking requirement.
                  </p>
                </div>
              )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {proteins.map((protein) => {
                const quantity =
                  proteinQuantities[protein] || 0;

                return (
                  <div
                    key={protein}
                    className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-white">
                        {protein}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Included protein quantity
                      </p>
                    </div>

                    <QuantityControl
                      name={protein}
                      quantity={quantity}
                      onDecrease={() =>
                        decreaseProteinQuantity(protein)
                      }
                      onIncrease={() =>
                        increaseProteinQuantity(protein)
                      }
                      onChange={(value) =>
                        setProteinQuantity(protein, value)
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-6 rounded-2xl border p-5 ${
"border-yellow-400/30 bg-yellow-400/10"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Protein Selection Summary
                  </p>

                  <p
                    className="mt-1 text-sm text-gray-300"
                  >
                    {remainingProteinAllowance > 0
                      ? `${remainingProteinAllowance} included protein portions remaining.`
                      : "Included protein allowance is full. Additional selections automatically appear in Add-ons and are added to the total price."}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-400">
                    Selected / Included
                  </p>

                  <p
                    className="text-2xl font-bold text-yellow-400"
                  >
                    {totalProteinSelections} /{" "}
                    {totalIncludedProteinAllowance}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Add-ons */}
          <section>
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Add-ons
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Add-ons are charged separately from the $600
minimum event spend.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Add-ons Total
                </p>

                <p className="mt-1 text-2xl font-bold text-yellow-400">
                  ${addOnsTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {addOns.map((item) => {
                const quantity =
                  addOnQuantities[item.name] || 0;

                const subtotal =
                  quantity * item.price;

                return (
                  <div
                    key={item.name}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-white">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-yellow-400">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>

                    <QuantityControl
                      name={item.name}
                      quantity={quantity}
                      onDecrease={() =>
                        decreaseQuantity(
                          addOnQuantities,
                          setAddOnQuantities,
                          item.name,
                        )
                      }
                      onIncrease={() =>
                        increaseQuantity(
                          addOnQuantities,
                          setAddOnQuantities,
                          item.name,
                        )
                      }
                      onChange={(value) =>
                        updateQuantity(
                          setAddOnQuantities,
                          item.name,
                          value,
                        )
                      }
                    />

                    <div className="min-w-28 text-left md:text-right">
                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Subtotal
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        ${subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>


          {/* Event Setup */}
          <section>
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Event Setup
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Select either option or choose both. Setup services are charged per guest and added separately to the event spend.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Setup Total
                </p>

                <p className="mt-1 text-2xl font-bold text-yellow-400">
                  ${setupFee.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                  tablesAndChairsSelected
                    ? "border-yellow-400/60 bg-yellow-400/10"
                    : "border-white/10 bg-black/30 hover:border-yellow-400/60"
                }`}
              >
                <input
                  type="checkbox"
                  name="tablesAndChairs"
                  value="selected"
                  checked={tablesAndChairsSelected}
                  onChange={(event) =>
                    setTablesAndChairsSelected(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">
                      Tables & Chairs
                    </h3>

                    <span className="font-bold text-yellow-400">
                      $6 per guest
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
                    We provide tables and chairs for all guests.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                  tableSetupSelected
                    ? "border-yellow-400/60 bg-yellow-400/10"
                    : "border-white/10 bg-black/30 hover:border-yellow-400/60"
                }`}
              >
                <input
                  type="checkbox"
                  name="tableSetup"
                  value="selected"
                  checked={tableSetupSelected}
                  onChange={(event) =>
                    setTableSetupSelected(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 accent-yellow-400"
                />

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-white">
                      Tableware, Flowers & Table Lighting
                    </h3>

                    <span className="font-bold text-yellow-400">
                      $14 per guest
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
                    Includes tableware, floral arrangements and tabletop lighting.
                  </p>
                </div>
              </label>
            </div>

            {tablesAndChairsSelected && tableSetupSelected && (
              <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                <p className="font-bold text-yellow-400">
                  Combined Event Setup: $20 per guest
                </p>

                <p className="mt-2 text-sm text-gray-300">
                  Both setup services are selected. The system automatically calculates $6 + $14 = $20 per guest.
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SummaryBox
                label="Selected Setup"
                value={setupOptionLabel}
              />

              <SummaryBox
                label="Price Per Guest"
                value={`$${setupPricePerPerson.toFixed(2)}`}
              />

              <SummaryBox
                label="Setup Fee"
                value={`$${setupFee.toFixed(2)}`}
                highlighted
              />
            </div>
          </section>

          {/* Estimated Price */}
          <section className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              Estimated Price
            </h2>

            <div className="mt-6 space-y-4">
              <PriceRow
                label={`Food Total (${totalGuests} guests)`}
                value={totalGuests === 0 ? 0 : chargedGuestTotal}
              />

             
              

              <PriceRow
                label="Add-ons Total"
                value={addOnsTotal}
              />
              {discount > 0 && (
  <PriceRow
    label="Promotion Discount"
    value={-discount}
  />
)}
<div className="mt-4 mb-4">
  <label className="block text-sm text-gray-300 mb-2">
    Promotion Code
  </label>

  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Enter promo code"
        value={promoCode}
  onChange={(e) => setPromoCode(e.target.value)}
      className="flex-1 h-11 rounded-lg border border-white/15 bg-black px-4 text-white"
    />

    <button
      type="button"
      onClick={() => {
    const code = promoCode.trim().toUpperCase();

if (code === "FIRST50") {
  setDiscount(50);
  setPromoMessage("Promo code applied! $50 off.");
} else if (/^(100|[1-9]?\d)%$/.test(code)) {
  const percentage = Number(code.replace("%", ""));

  if (percentage <= 0 || percentage >= 100) {
    setDiscount(0);
    setPromoMessage("Enter a discount between 1% and 99%.");
  } else {
    const eligibleAmount = Math.max(
      0,
      subtotal - travelFee - setupFee,
    );

    setDiscount(
      Math.round(eligibleAmount * (percentage / 100) * 100) / 100,
    );

    setPromoMessage(`${percentage}% discount applied!`);
  }
} else {
  setDiscount(0);
  setPromoMessage("Invalid promo code. Try FIRST50 or 20%.");
}
  }}
      className="px-5 rounded-lg bg-yellow-400 text-black font-semibold"
    >
      Apply
    </button>
    {promoMessage && (
  <p className="mt-2 text-sm text-yellow-400">
    {promoMessage}
  </p>
)}
  </div>
</div>
              <PriceRow
                label="Travel Fee"
                value={travelFee}
              />

              <PriceRow
                label={`Event Setup — ${setupOptionLabel}`}
                value={setupFee}
              />
<PriceRow
                label={
                  salesTaxRate === null
                    ? "Sales Tax (enter street address to calculate)"
                    : `Sales Tax (${(salesTaxRate * 100).toFixed(2)}%)`
                }
                value={salesTax}
              />
              <div className="border-t border-yellow-400/20 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-lg font-bold text-white">
                    Estimated Total
                  </span>

                  <span className="text-3xl font-bold text-yellow-400">
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-yellow-400/20 pt-5">
              <p className="text-sm text-gray-300">
                Included proteins:{" "}
                <strong className="text-white">
                  {totalIncludedProteinAllowance}
                </strong>
              </p>

              {complimentaryProteinAllowance > 0 && (
                <p className="mt-2 text-sm text-yellow-400">
                  Your minimum event spend includes{" "}
                  {complimentaryProteinAllowance} protein portions.
                </p>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-400">
              This is an estimated total. The travel fee is
              calculated from the event address and included
              above. Final pricing may change if the address,
              menu details, or other event requirements change.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="font-semibold text-yellow-300">Optional Chef Tip</p>
              <p className="mt-2 text-sm text-gray-300">
                Tips are voluntary and are not included in the estimated total. A customary tip is 20%–30% based on your satisfaction with the chef’s service. Please give tips directly to the chef.
              </p>
              <button
  type="button"
  onClick={downloadPDFQuote}
  className="mt-6 w-full rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black transition hover:bg-yellow-300"
>
  Download PDF Quote
</button>
              <p className="mt-3 text-sm text-gray-200">
                Suggested tip range: ${Math.round(estimatedTotal * 0.2).toFixed(2)}–${Math.round(estimatedTotal * 0.3).toFixed(2)}
              </p>
            </div>
            <Link href="/booking" className="mt-6 block w-full rounded-full bg-yellow-500 px-8 py-4 text-center text-lg font-bold text-black transition hover:bg-yellow-400">
              READY TO BOOK? SUBMIT A BOOKING REQUEST
            </Link>
          </section>

        </div>
      </div>
    </main>
  );
}

type QuantityControlProps = {
  name: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (value: number) => void;
};

function QuantityControl({
  name,
  quantity,
  onDecrease,
  onIncrease,
  onChange,
}: QuantityControlProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={`Decrease ${name} quantity`}
        className="flex h-11 w-11 items-center justify-center rounded-l-xl border border-white/15 bg-white/5 text-xl font-bold transition hover:border-yellow-400 hover:text-yellow-400"
      >
        −
      </button>

      <input
        type="number"
        min="0"
        max="100"
        step="1"
        value={quantity}
        onChange={(event) =>
      onChange(Math.round(Number(event.target.value)))
        }
        aria-label={`${name} quantity`}
        className="h-11 w-20 border-y border-white/15 bg-black text-center text-lg font-semibold text-white outline-none focus:border-yellow-400"
      />

      <button
        type="button"
        onClick={onIncrease}
        aria-label={`Increase ${name} quantity`}
        className="flex h-11 w-11 items-center justify-center rounded-r-xl border border-white/15 bg-white/5 text-xl font-bold transition hover:border-yellow-400 hover:text-yellow-400"
      >
        +
      </button>
    </div>
  );
}

type SummaryBoxProps = {
  label: string;
  value: string;
  highlighted?: boolean;
};

function SummaryBox({
  label,
  value,
  highlighted = false,
}: SummaryBoxProps) {
  return (
    <div
      className={
        highlighted
          ? "flex items-center justify-between rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5"
          : "flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5"
      }
    >
      <span className="font-semibold text-white">
        {label}
      </span>

      <span
        className={
          highlighted
            ? "text-2xl font-bold text-yellow-400"
            : "text-2xl font-bold text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}

type ProteinSummaryCardProps = {
  label: string;
  value: number;
  description: string;
  highlighted?: boolean;
  warning?: boolean;
};

function ProteinSummaryCard({
  label,
  value,
  description,
  highlighted = false,
  warning = false,
}: ProteinSummaryCardProps) {
  const className = warning
    ? "rounded-2xl border border-red-500/50 bg-red-500/10 p-5"
    : highlighted
      ? "rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5"
      : "rounded-2xl border border-white/10 bg-white/5 p-5";

  return (
    <div className={className}>
      <p className="text-sm text-gray-300">{label}</p>

      <p
        className={`mt-2 text-3xl font-bold ${
          warning
            ? "text-red-400"
            : highlighted
              ? "text-yellow-400"
              : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

type PriceRowProps = {
  label: string;
  value: number;
};

function PriceRow({
  label,
  value,
}: PriceRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-gray-300">{label}</span>

      <span className="text-lg font-semibold text-white">
        ${value.toFixed(2)}
      </span>
    </div>
  );
}

type CheckboxSectionProps = {
  title: string;
  description: string;
  name: string;
  options: string[];
};

function CheckboxSection({
  title,
  description,
  name,
  options,
}: CheckboxSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-yellow-400">
        {title}
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        {description}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-yellow-400/60"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              className="h-4 w-4 accent-yellow-400"
            />

            <span className="text-sm text-gray-200">
              {option}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}