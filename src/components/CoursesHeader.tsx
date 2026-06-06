import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, BookOpen, Layers } from "lucide-react";
import aidAngelLogo from "@/assets/aidangel-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CoursesHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <header className="border-b bg-card sticky top-0 z-30">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <img src={aidAngelLogo} alt="First Aid - Online Course" width={28} height={28} className="h-7 w-7" />
          <span className="font-display font-bold"><span className="text-foreground">First Aid </span><span className="text-primary">{t("headerOnlineCourse")}</span></span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/programs" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary">
            <Layers className="h-4 w-4" /> {t("headerNavCourses")}
          </Link>
          <Link to="/topics" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-primary">
            <BookOpen className="h-4 w-4" /> {t("headerNavTopics")}
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[140px]">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/my-learning")}>{t("headerMyLearning")}</DropdownMenuItem>
                {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin/programs")}>{t("headerAdminCourses")}</DropdownMenuItem>}
                {isAdmin && <DropdownMenuItem onClick={() => navigate("/admin/courses")}>{t("headerAdminTopics")}</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut().then(() => navigate("/"))}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("headerSignOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>{t("headerSignIn")}</Button>
          )}
          <HamburgerMenu />
        </nav>
      </div>
    </header>
  );
}
