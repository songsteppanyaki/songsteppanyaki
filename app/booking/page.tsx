"use client";

import Link from "next/link";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
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
  "Chicken",
  "Steak",
  "Filet Mignon",
  "Shrimp",
  "Salmon",
  "Scallops",
  "Lobster Tail",
  "Tofu",
];

const addOns: PricedItem[] = [
  {
    name: "Garlic Fried Rice",
    price: 5,
  },
  {
    name: "Yakisoba Noodles",
    price: 4,
  },
  {
    name: "Extra Chicken",
    price: 6,
  },
  {
    name: "Extra Steak",
    price: 8,
  },
  {
    name: "Shrimp",
    price: 8,
  },
  {
    name: "Salmon",
    price: 8,
  },
  {
    name: "Scallops",
    price: 10,
  },
  {
    name: "Lobster Tail",
    price: 10,
  },
  {
    name: "Filet Mignon",
    price: 12,
  },
  {
    name: "Extra Vegetables",
    price: 4,
  },
  {
    name: "Kids Meal",
    price: 15,
  },
];

const allergies = [
  "No Allergies",
  "Shellfish",
  "Fish",
  "Peanuts",
  "Tree Nuts",
  "Eggs",
  "Dairy / Milk",
  "Soy",
  "Wheat",
  "Gluten",
  "Sesame",
  "Garlic",
  "Onion",
  "Mushrooms",
  "Other",
];

const dietaryPreferences = [
  "None",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Low Carb",
];

export default function BookingPage() {
  const [guestQuantities, setGuestQuantities] = useState<
    Record<string, number>
  >({});

  const [proteinQuantities, setProteinQuantities] = useState<
    Record<string, number>
  >({});

  const [addOnQuantities, setAddOnQuantities] = useState<
    Record<string, number>
  >({});

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

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
  const regularProteinAllowance =
    totalGuests * PROTEINS_PER_GUEST_SLOT;

  const complimentaryProteinAllowance =
    complimentaryGuestSlots * PROTEINS_PER_GUEST_SLOT;

  const totalIncludedProteinAllowance =
    regularProteinAllowance + complimentaryProteinAllowance;

  const totalProteinSelections = useMemo(() => {
    return proteins.reduce((total, protein) => {
      return total + (proteinQuantities[protein] || 0);
    }, 0);
  }, [proteinQuantities]);

  const remainingProteinAllowance = Math.max(
    0,
    totalIncludedProteinAllowance - totalProteinSelections,
  );

  const proteinSelectionExceeded =
    totalProteinSelections > totalIncludedProteinAllowance;

  const addOnsTotal = useMemo(() => {
    return addOns.reduce((total, item) => {
      const quantity = addOnQuantities[item.name] || 0;

      return total + quantity * item.price;
    }, 0);
  }, [addOnQuantities]);

  const estimatedTotal = chargedGuestTotal + addOnsTotal;

  function updateQuantity(
    setter: Dispatch<SetStateAction<Record<string, number>>>,
    name: string,
    quantity: number,
  ) {
    const safeQuantity = Math.max(
      0,
      Math.min(
        100,
        Number.isNaN(quantity) ? 0 : Math.floor(quantity),
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

  function handleAllergyChange(allergy: string, checked: boolean) {
    if (allergy === "No Allergies" && checked) {
      setSelectedAllergies(["No Allergies"]);
      return;
    }

    setSelectedAllergies((current) => {
      const withoutNoAllergies = current.filter(
        (item) => item !== "No Allergies",
      );

      if (checked) {
        return [...withoutNoAllergies, allergy];
      }

      return withoutNoAllergies.filter(
        (item) => item !== allergy,
      );
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (totalGuests === 0) {
      alert("Please enter the number of guests.");
      return;
    }

    if (proteinSelectionExceeded) {
      alert(
        [
          "Protein selection exceeds the included allowance.",
          "",
          `Included protein portions: ${totalIncludedProteinAllowance}`,
          `Selected protein portions: ${totalProteinSelections}`,
          "",
          "Please reduce the protein quantities before submitting.",
        ].join("\n"),
      );

      return;
    }

    const formData = new FormData(event.currentTarget);

    const selectedGuests = guestCategories
      .filter(
        (category) =>
          (guestQuantities[category.name] || 0) > 0,
      )
      .map((category) => {
        const quantity =
          guestQuantities[category.name] || 0;

        return {
          category: category.name,
          ageRange: category.description,
          quantity,
          pricePerGuest: category.price,
          subtotal: quantity * category.price,
        };
      });

    const selectedProteins = proteins
      .filter(
        (protein) =>
          (proteinQuantities[protein] || 0) > 0,
      )
      .map((protein) => ({
        name: protein,
        quantity: proteinQuantities[protein] || 0,
      }));

    const selectedAddOns = addOns
      .filter(
        (item) =>
          (addOnQuantities[item.name] || 0) > 0,
      )
      .map((item) => {
        const quantity =
          addOnQuantities[item.name] || 0;

        return {
          name: item.name,
          quantity,
          unitPrice: item.price,
          subtotal: quantity * item.price,
        };
      });

    const bookingData = {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      zipCode: formData.get("zipCode"),
      eventDate: formData.get("eventDate"),
      eventTime: formData.get("eventTime"),
      occasion: formData.get("occasion"),

      guests: selectedGuests,
      totalGuests,

      calculatedGuestTotal,
      minimumBookingCharge: MINIMUM_BOOKING_CHARGE,
      minimumChargeAdjustment,
      chargedGuestTotal,

      minimumGuestSlots: MINIMUM_GUEST_SLOTS,
      complimentaryGuestSlots,

      proteins: selectedProteins,
      regularProteinAllowance,
      complimentaryProteinAllowance,
      totalIncludedProteinAllowance,
      totalProteinSelections,
      remainingProteinAllowance,

      addOns: selectedAddOns,
      addOnsTotal,

      allergies: formData.getAll("allergies"),
      otherAllergies: formData.get("otherAllergies"),
      dietaryPreferences: formData.getAll(
        "dietaryPreferences",
      ),
      specialRequests: formData.get("specialRequests"),

      estimatedTotal,
    };

    console.log("Booking request:", bookingData);

    alert(
      [
        "Thank you! Your booking request has been received.",
        "",
        `Total guests: ${totalGuests}`,
        `Charged guest total: $${chargedGuestTotal.toFixed(2)}`,
        `Included protein portions: ${totalIncludedProteinAllowance}`,
        `Selected protein portions: ${totalProteinSelections}`,
        `Add-ons total: $${addOnsTotal.toFixed(2)}`,
        `Estimated total: $${estimatedTotal.toFixed(2)}`,
      ].join("\n"),
    );
  }

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
            Book Your Event
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-gray-400">
            Tell us about your event, guest count, menu
            selections and dietary needs. We will contact you
            to confirm availability and final pricing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-10 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl md:p-10"
        >
          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400">
              Contact Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormInput
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="Your full name"
                required
              />

              <FormInput
                label="Phone Number"
                name="phone"
                type="tel"
                placeholder="Your phone number"
                required
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

              <FormInput
                label="Event Address"
                name="address"
                type="text"
                placeholder="Street address"
                required
              />

              <FormInput
                label="City"
                name="city"
                type="text"
                placeholder="City"
                required
              />

              <FormInput
                label="ZIP Code"
                name="zipCode"
                type="text"
                placeholder="ZIP code"
                required
              />
            </div>
          </section>

          {/* Event Details */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400">
              Event Details
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormInput
                label="Event Date"
                name="eventDate"
                type="date"
                required
              />

              <FormInput
                label="Preferred Time"
                name="eventTime"
                type="time"
                required
              />

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-gray-200">
                  Occasion
                </span>

                <select
                  name="occasion"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                >
                  <option value="" disabled>
                    Select an occasion
                  </option>

                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Graduation</option>
                  <option>Wedding</option>
                  <option>Baby Shower</option>
                  <option>Corporate Event</option>
                  <option>Holiday Party</option>
                  <option>Family Gathering</option>
                  <option>Bachelor Party</option>
                  <option>Bachelorette Party</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
          </section>

          {/* Guest Pricing */}
          <section>
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">
                  Number of Guests
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Enter the number of guests in each age group.
                </p>

                <p className="mt-2 text-sm font-semibold text-yellow-400">
                  A $600 minimum booking charge applies.
                  Add-ons are charged separately.
                </p>
              </div>

              <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-3">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Guest Charge
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
                        decreaseQuantity(
                          guestQuantities,
                          setGuestQuantities,
                          category.name,
                        )
                      }
                      onIncrease={() =>
                        increaseQuantity(
                          guestQuantities,
                          setGuestQuantities,
                          category.name,
                        )
                      }
                      onChange={(value) =>
                        updateQuantity(
                          setGuestQuantities,
                          category.name,
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

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SummaryBox
                label="Total Guests"
                value={String(totalGuests)}
              />

              <SummaryBox
                label="Calculated Guest Total"
                value={`$${calculatedGuestTotal.toFixed(2)}`}
              />

              <SummaryBox
                label="Charged Guest Total"
                value={`$${chargedGuestTotal.toFixed(2)}`}
                highlighted
              />
            </div>

            {minimumChargeAdjustment > 0 && (
              <div className="mt-4 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                <p className="font-semibold text-yellow-400">
                  Minimum booking adjustment: $
                  {minimumChargeAdjustment.toFixed(2)}
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Your calculated guest total is below the
                  $600 minimum, so the guest charge is adjusted
                  to $600.
                </p>
              </div>
            )}
          </section>

          {/* Protein Quantities */}
          <section>
            <div className="border-b border-white/10 pb-5">
              <h2 className="text-2xl font-bold text-yellow-400">
                Protein Selection
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Each guest includes two protein selections.
                When your party has fewer than 10 guests, each
                unused minimum guest slot also includes two
                complimentary protein portions.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <ProteinSummaryCard
                label="Actual Guest Protein Portions"
                value={regularProteinAllowance}
                description={`${totalGuests} guests × ${PROTEINS_PER_GUEST_SLOT} proteins`}
              />

              <ProteinSummaryCard
                label="Complimentary Protein Portions"
                value={complimentaryProteinAllowance}
                description={`${complimentaryGuestSlots} unused guest slots × ${PROTEINS_PER_GUEST_SLOT} proteins`}
                highlighted
              />

              <ProteinSummaryCard
                label="Total Included Proteins"
                value={totalIncludedProteinAllowance}
                description="Maximum included protein portions"
                highlighted
              />

              <ProteinSummaryCard
                label="Remaining Protein Portions"
                value={remainingProteinAllowance}
                description={`${totalProteinSelections} currently selected`}
                warning={proteinSelectionExceeded}
              />
            </div>

            {totalGuests > 0 &&
              complimentaryGuestSlots > 0 && (
                <div className="mt-5 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                  <p className="font-bold text-yellow-400">
                    Complimentary Protein Benefit
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-200">
                    Your party has {totalGuests} guests. Because
                    the booking minimum covers{" "}
                    {MINIMUM_GUEST_SLOTS} guest slots, the{" "}
                    {complimentaryGuestSlots} unused slots
                    include{" "}
                    {complimentaryProteinAllowance} additional
                    complimentary protein portions.
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
                        decreaseQuantity(
                          proteinQuantities,
                          setProteinQuantities,
                          protein,
                        )
                      }
                      onIncrease={() =>
                        increaseQuantity(
                          proteinQuantities,
                          setProteinQuantities,
                          protein,
                        )
                      }
                      onChange={(value) =>
                        updateQuantity(
                          setProteinQuantities,
                          protein,
                          value,
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>

            <div
              className={`mt-6 rounded-2xl border p-5 ${
                proteinSelectionExceeded
                  ? "border-red-500/50 bg-red-500/10"
                  : "border-yellow-400/30 bg-yellow-400/10"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    Protein Selection Summary
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      proteinSelectionExceeded
                        ? "text-red-300"
                        : "text-gray-300"
                    }`}
                  >
                    {proteinSelectionExceeded
                      ? `You selected ${
                          totalProteinSelections -
                          totalIncludedProteinAllowance
                        } protein portions over the included allowance.`
                      : `${remainingProteinAllowance} included protein portions remaining.`}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-400">
                    Selected / Included
                  </p>

                  <p
                    className={`text-2xl font-bold ${
                      proteinSelectionExceeded
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
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
                  minimum booking charge.
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

          {/* Allergies */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400">
              Food Allergies
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Select all that apply. Serious allergies should
              also be explained in the special requests
              section.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {allergies.map((allergy) => (
                <label
                  key={allergy}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition hover:border-yellow-400/60"
                >
                  <input
                    type="checkbox"
                    name="allergies"
                    value={allergy}
                    checked={selectedAllergies.includes(
                      allergy,
                    )}
                    onChange={(event) =>
                      handleAllergyChange(
                        allergy,
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 accent-yellow-400"
                  />

                  <span className="text-sm text-gray-200">
                    {allergy}
                  </span>
                </label>
              ))}
            </div>

            {selectedAllergies.includes("Other") && (
              <div className="mt-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-200">
                    Describe Other Allergies
                  </span>

                  <textarea
                    name="otherAllergies"
                    rows={3}
                    placeholder="Please describe the allergy and severity."
                    className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
                  />
                </label>
              </div>
            )}
          </section>

          {/* Dietary Preferences */}
          <CheckboxSection
            title="Dietary Preferences"
            description="Select any dietary preferences for your group."
            name="dietaryPreferences"
            options={dietaryPreferences}
          />

          {/* Special Requests */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400">
              Special Requests
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Tell us about children, setup details, parking
              instructions, accessibility needs or other
              important requests.
            </p>

            <textarea
              name="specialRequests"
              rows={6}
              placeholder="Please enter any special requests or important event details."
              className="mt-6 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
            />
          </section>

          {/* Estimated Price */}
          <section className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
            <h2 className="text-2xl font-bold text-yellow-400">
              Estimated Price
            </h2>

            <div className="mt-6 space-y-4">
              <PriceRow
                label={`Calculated Guest Total (${totalGuests} guests)`}
                value={calculatedGuestTotal}
              />

              {minimumChargeAdjustment > 0 && (
                <PriceRow
                  label="Minimum Booking Adjustment"
                  value={minimumChargeAdjustment}
                />
              )}

              <PriceRow
                label="Charged Guest Total"
                value={chargedGuestTotal}
              />

              <PriceRow
                label="Add-ons Total"
                value={addOnsTotal}
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
                  This includes{" "}
                  {complimentaryProteinAllowance} complimentary
                  protein portions from{" "}
                  {complimentaryGuestSlots} unused minimum guest
                  slots.
                </p>
              )}
            </div>

            <p className="mt-5 text-xs leading-5 text-gray-400">
              This is an estimated total. Final pricing may
              change based on location, travel requirements,
              menu details and other event requirements.
            </p>
          </section>

          {/* Submit */}
          <div className="border-t border-white/10 pt-8">
            <label className="flex items-start gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                name="acknowledgement"
                required
                className="mt-1 h-4 w-4 accent-yellow-400"
              />

              <span>
                I understand that submitting this form does
                not confirm the booking. Song Teppanyaki will
                contact me to confirm availability, menu
                details and final pricing.
              </span>
            </label>

            <button
              type="submit"
              disabled={proteinSelectionExceeded}
              className="mt-8 w-full rounded-full bg-yellow-500 px-8 py-4 text-lg font-bold text-black transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
            >
              {proteinSelectionExceeded
                ? "REDUCE PROTEIN QUANTITIES"
                : `SUBMIT BOOKING REQUEST — $${estimatedTotal.toFixed(
                    2,
                  )}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

type FormInputProps = {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required?: boolean;
};

function FormInput({
  label,
  name,
  type,
  placeholder,
  required,
}: FormInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-200">
        {label}
      </span>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-400"
      />
    </label>
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
        value={quantity}
        onChange={(event) =>
          onChange(Number(event.target.value))
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