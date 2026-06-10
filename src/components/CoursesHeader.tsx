import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import { buildBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function CoursesHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const breadcrumbItems = buildBreadcrumbs(location.pathname);
  const showBreadcrumbs = location.pathname !== "/" && breadcrumbItems.length > 1;

  return (
    <div className="sticky top-0 z-30 bg-card border-b">
      <SiteHeader containerClassName="max-w-[1000px]" showBreadcrumbs={false} />
      <div className="border-t border-border/60 px-4 py-3">
        <div className="max-w-[1000px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {showBreadcrumbs ? (
            <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
              <ol className="flex flex-wrap items-center justify-start gap-x-1.5 gap-y-1 text-sm text-muted-foreground">
                {breadcrumbItems.map((crumb, index) => {
                  const current = index === breadcrumbItems.length - 1;
                  return (
                    <li key={`${crumb.href ?? crumb.label}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
                      {index > 0 && <span aria-hidden="true" className="text-muted-foreground/60">/</span>}
                      {current || !crumb.href ? (
                        <span aria-current={current ? "page" : undefined} className="truncate font-medium text-muted-foreground">
                          {crumb.label}
                        </span>
                      ) : (
                        <Link to={crumb.href} className="truncate text-muted-foreground hover:text-foreground transition-colors">
                          {crumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : (
            <span className="flex-1" aria-hidden="true" />
          )}

          <div className="flex items-center justify-end gap-2">
            <Link to="/programs" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
              <Layers className="h-4 w-4" /> {t("headerNavCourses")}
            </Link>
            <Link to="/topics" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary">
              <BookOpen className="h-4 w-4" /> {t("headerNavTopics")}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open profile menu">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
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
      </div>
    </div>
  );
}
