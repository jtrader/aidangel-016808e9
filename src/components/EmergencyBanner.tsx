import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const EmergencyBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-primary px-4 py-2 flex items-center justify-center gap-2 text-primary-foreground text-sm font-medium">
      <Phone className="h-3.5 w-3.5" />
      <span>{t("emergencyBanner")}</span>
    </div>
  );
};

export default EmergencyBanner;
