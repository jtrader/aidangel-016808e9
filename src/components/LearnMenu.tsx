import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountry } from "@/hooks/useCountry";

interface LearnMenuProps {
  variant?: "header" | "footer";
}

export default function LearnMenu({ variant = "header" }: LearnMenuProps) {
  const { country } = useCountry();
  const classes =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors";
  const href = `/learn/${country.code.toLowerCase()}`;
  return (
    <Link to={href} className={classes} aria-label={`Learn first aid — ${country.name}`}>
      <GraduationCap className="h-4 w-4" aria-hidden="true" />
      <span className="sm:hidden">Learn</span>
      <span className="hidden sm:inline">Learn First Aid</span>
      <span aria-hidden="true" className="text-base leading-none">{country.flag}</span>
    </Link>
  );
}
