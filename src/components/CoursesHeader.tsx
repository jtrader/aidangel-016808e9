import { Link, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import SiteHeader from "@/components/SiteHeader";

export default function CoursesHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="sticky top-0 z-30 bg-card border-b">
      <SiteHeader />
      <div className="container max-w-6xl mx-auto px-4 py-2 flex items-center justify-end gap-2 border-t border-border/60">
        <Link to="/programs" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
          <Layers className="h-4 w-4" /> {t("headerNavCourses")}
        </Link>
        <Link to="/topics" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
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
      </div>
    </div>
  );
}
