import { ImageResponse } from "next/og";
import { getCar, getBaseUrl, resolveCarImageUrl } from "./car-service";

export const runtime = "edge";
export const alt = "Car listing preview";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

function formatPrice(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Contact for price";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildSpecs(items: Array<string | undefined>): string {
  return items.filter(Boolean).join(" • ");
}

function getDisplayHost(url: string): string {
  try {
    return new URL(url).host;
  } catch (error) {
    return url.replace(/^https?:\/\//, "");
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);
  const baseUrl = await getBaseUrl();
  const displayHost = getDisplayHost(baseUrl);

  if (!car) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            fontSize: 48,
            fontFamily: "Geist, 'Noto Sans Khmer', system-ui, sans-serif",
          }}
        >
          Listing not found
        </div>
      ),
      size
    );
  }

  const heroImage =
    (await resolveCarImageUrl(car.images?.[0])) || `${baseUrl}/logo.png`;
  const priceLabel = formatPrice(car.price);
  const specs = buildSpecs([car.transmission, car.fuelType, car.location]);
  const statusLabel = car.status === 3 ? "Sold" : car.status === 2 ? "Pending" : "Available";
  const statusStyles = car.status === 3
    ? { background: "#fee2e2", color: "#b91c1c" }
    : car.status === 2
    ? { background: "#fef3c7", color: "#92400e" }
    : { background: "#dcfce7", color: "#166534" };

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          gap: 40,
          padding: 48,
          background: "radial-gradient(circle at top, #0ea5e9 0%, #0f172a 55%)",
          color: "#f8fafc",
          fontFamily: "Geist, 'Noto Sans Khmer', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1.2,
            position: "relative",
            borderRadius: 32,
            overflow: "hidden",
            backgroundColor: "#1f2937",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.1)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: "linear-gradient(180deg, rgba(15,23,42,0) 40%, rgba(15,23,42,0.85) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 32,
              right: 32,
              bottom: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 28,
                fontWeight: 600,
                background: statusStyles.background,
                color: statusStyles.color,
              }}
            >
              {statusLabel}
            </span>
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
              }}
            >
              {priceLabel}
            </span>
          </div>
        </div>

        <div
          style={{
            flex: 0.8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span style={{ fontSize: 28, color: "#bae6fd" }}>
              Featured Listing
            </span>
            <h1
              style={{
                fontSize: 56,
                lineHeight: 1.1,
                fontWeight: 700,
                color: "#f8fafc",
              }}
            >
              {car.name}
            </h1>
            <p
              style={{
                fontSize: 28,
                lineHeight: 1.4,
                color: "#d1d5db",
              }}
            >
              {car.description?.slice(0, 120) || "Premium selection from NAS Car."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 28, color: "#bae6fd" }}>Highlights</span>
            <p style={{ fontSize: 26, color: "#e2e8f0" }}>{specs}</p>
            <div
              style={{
                height: 6,
                width: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #38bdf8, #22d3ee, #818cf8)",
              }}
            />
            <span style={{ fontSize: 24, color: "#94a3b8" }}>
              {displayHost}/cars/{id}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
