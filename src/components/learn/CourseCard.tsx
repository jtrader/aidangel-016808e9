import { ArrowRight, BookOpen, Clock, Award } from "lucide-react";
import type { Course } from "./courses";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <a
        href={course.href}
        target="_blank"
        rel="noopener"
        className="block aspect-[16/10] bg-muted overflow-hidden"
      >
        <img
          src={course.image}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover hover:scale-105 transition-transform"
        />
      </a>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {course.tag}
        </p>
        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {course.description}
        </p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
          <li className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" aria-hidden="true" />
            {course.topics}
          </li>
          <li className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {course.duration}
          </li>
          <li className="inline-flex items-center gap-1">
            <Award className="h-3 w-3" aria-hidden="true" />
            {course.credential}
          </li>
        </ul>
        <a
          href={course.href}
          target="_blank"
          rel="noopener"
          className="mt-auto inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {course.cta}
          <ArrowRight className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>
    </article>
  );
}
