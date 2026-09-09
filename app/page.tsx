import { TripPlanner } from "@/components/TripPlanner";
import { mockTrip } from "@/data/mockTrip";

export default function Home() {
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY ?? "";
  const amapSecurityJsCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE ?? "";
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <TripPlanner
      trip={mockTrip}
      amapKey={amapKey}
      amapSecurityJsCode={amapSecurityJsCode}
      googleMapsApiKey={googleMapsApiKey}
    />
  );
}
