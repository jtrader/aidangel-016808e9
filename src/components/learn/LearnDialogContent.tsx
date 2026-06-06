import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { CourseCard } from "./CourseCard";
import { COURSES } from "./courses";

interface LearnDialogContentProps {
  autoplay?: boolean;
}

export function LearnDialogContent({ autoplay = true }: LearnDialogContentProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!autoplay || !api) return;
    let mounted = true;
    const id = setInterval(() => {
      if (!mounted || !api) return;
      try {
        api.scrollNext();
      } catch {}
    }, 3500);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [autoplay, api]);

  return (
    <section aria-labelledby="learn-courses-heading">
      <div className="mb-3">
        <h2
          id="learn-courses-heading"
          className="text-base sm:text-lg font-semibold text-foreground"
        >
          First Aid Angel Courses
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Free, evidence-based programs aligned to the Australian First Aid 5th Edition.
        </p>
      </div>

      <Carousel
        opts={{ align: "start", loop: true }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {COURSES.map((course) => (
            <CarouselItem
              key={course.slug}
              className="pl-3 basis-[88%] xs:basis-4/5 sm:basis-1/2 md:basis-1/2"
            >
              <CourseCard course={course} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex left-1" />
        <CarouselNext className="hidden sm:flex right-1" />
      </Carousel>
    </section>
  );
}
