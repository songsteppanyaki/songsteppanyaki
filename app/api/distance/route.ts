import { NextRequest, NextResponse } from "next/server";

const BUSINESS_ADDRESS =
  "9083 Arcadia Ave, San Gabriel, CA 91775";

const FREE_TRAVEL_MILES = 20;
const TRAVEL_PRICE_PER_EXTRA_MILE = 2;
const METERS_PER_MILE = 1609.344;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      destinationAddress?: string;
      address?: string;
      city?: string;
      zip?: string;
    };

    const destinationAddress =
      body.destinationAddress?.trim();

    const taxAddress = body.address?.trim();
    const taxCity = body.city?.trim();
    const taxZip = body.zip?.trim();

    if (!destinationAddress) {
      return NextResponse.json(
        {
          error: "Please enter the complete event address.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Google Maps API key is not configured.",
        },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters",
        },
        body: JSON.stringify({
          origin: {
            address: BUSINESS_ADDRESS,
          },
          destination: {
            address: destinationAddress,
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_UNAWARE",
          computeAlternativeRoutes: false,
          units: "IMPERIAL",
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Google Routes API error:", errorText);

      return NextResponse.json(
        {
          error:
            "Unable to calculate distance. Check the address, API key, Routes API, and billing.",
        },
        { status: 400 },
      );
    }

    const data = (await response.json()) as {
      routes?: Array<{
        distanceMeters?: number;
      }>;
    };

    const distanceMeters =
      data.routes?.[0]?.distanceMeters;

    if (typeof distanceMeters !== "number") {
      return NextResponse.json(
        {
          error: "No driving route was found.",
        },
        { status: 400 },
      );
    }

    const distanceMiles =
      distanceMeters / METERS_PER_MILE;

    const extraMiles = Math.max(
      0,
      Math.ceil(distanceMiles - FREE_TRAVEL_MILES),
    );

    const travelFee =
      extraMiles * TRAVEL_PRICE_PER_EXTRA_MILE;

    let salesTaxRate: number | null = null;
    let taxJurisdiction = "";

    if (taxAddress && taxCity && /^\d{5}$/.test(taxZip || "")) {
      const taxUrl = new URL(
        "https://services.maps.cdtfa.ca.gov/api/taxrate/GetRateByAddress",
      );

      taxUrl.searchParams.set("address", taxAddress);
      taxUrl.searchParams.set("city", taxCity);
      taxUrl.searchParams.set("zip", taxZip || "");

      const taxResponse = await fetch(taxUrl.toString(), {
        method: "GET",
        cache: "no-store",
      });

      if (!taxResponse.ok) {
        const taxErrorText = await taxResponse.text();
        console.error(
          "CDTFA Tax Rate API error:",
          taxErrorText,
        );

        return NextResponse.json(
          {
            error:
              "Unable to determine the current sales tax rate for this event address. Please verify the street address, city, and ZIP code.",
          },
          { status: 400 },
        );
      }

      const taxData = (await taxResponse.json()) as {
        taxRateInfo?: Array<{
          rate?: number;
          jurisdiction?: string;
          city?: string;
          county?: string;
          tac?: string;
        }>;
        geocodeInfo?: {
          formattedAddress?: string;
          confidence?: string;
          calcMethod?: string;
        };
      };

      const taxInfo = taxData.taxRateInfo?.[0];

      if (typeof taxInfo?.rate !== "number") {
        console.error(
          "CDTFA Tax Rate API returned no usable rate:",
          taxData,
        );

        return NextResponse.json(
          {
            error:
              "A sales tax rate could not be determined for this event address. Please verify the address.",
          },
          { status: 400 },
        );
      }

      salesTaxRate = taxInfo.rate;
      taxJurisdiction = taxInfo.jurisdiction || taxInfo.city || "";

      if ((taxData.taxRateInfo?.length || 0) > 1) {
        console.warn(
          "CDTFA returned multiple tax areas for this address; using the first result:",
          taxData.taxRateInfo,
        );
      }
    }

    return NextResponse.json({
      distanceMiles: Number(distanceMiles.toFixed(1)),
      extraMiles,
      travelFee,
      salesTaxRate,
      taxJurisdiction,
    });
  } catch (error) {
    console.error("Distance API error:", error);

    return NextResponse.json(
      {
        error: "Unable to calculate the travel fee.",
      },
      { status: 500 },
    );
  }
}