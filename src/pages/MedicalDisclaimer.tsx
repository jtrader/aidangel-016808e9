import { CmsPageRenderer } from "@/components/CmsPageRenderer";
import SiteHeader from "@/components/SiteHeader";
import NetworkFooter from "@/components/NetworkFooter";

export default function MedicalDisclaimer() {
  return (
    <>
      <SiteHeader backTo="/" backLabel="Home" />
      <CmsPageRenderer
        slug="medical-disclaimer"
        fallback={
          <main className="container mx-auto px-4 py-12 prose">
            <h1>Medical Disclaimer</h1>
            <p>Coming soon.</p>
          </main>
        }
      />
      <NetworkFooter />
    </>
  );
}
