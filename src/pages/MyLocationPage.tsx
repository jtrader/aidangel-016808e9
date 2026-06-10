import { SeoHead } from "@/components/SeoHead";
import SiteHeader from "@/components/SiteHeader";
import HamburgerMenu from "@/components/HamburgerMenu";
import NetworkFooter from "@/components/NetworkFooter";
import { MyLocationPanel } from "@/components/shared";
import { Link } from "react-router-dom";

export default function MyLocationPage() {
  return (
    <>
      <SeoHead
        lang="en"
        basePath="/my-location"
        title="My Location — First Aid Angel"
        description="Get your what3words address, GPS coordinates and nearest street address to share with 000 emergency services."
      />
      <div className="min-h-screen bg-background">
        <SiteHeader backTo="/" backLabel="Home" />
        <main>
          <MyLocationPanel />
        </main>
        <NetworkFooter />
      </div>
    </>
  );
}
