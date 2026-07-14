"use client";

import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useI18n } from "@/i18n/client";

export function RestaurantGallery({ images }: { images: string[] }) {
  const { dir } = useI18n();

  return (
    <Carousel
      opts={{ loop: true, direction: dir }}
      dir="ltr"
      className="group relative"
    >
      <CarouselContent className="ms-0">
        {images.map((src, index) => (
          <CarouselItem key={src} className="relative ps-0">
            <div className="relative h-[42vh] w-full md:h-[56vh]">
              <Image
                src={src}
                alt=""
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-black/20" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="start-4 border-0 bg-white/80 opacity-0 shadow-lifted backdrop-blur transition-opacity group-hover:opacity-100 max-md:opacity-100 dark:bg-black/50" />
      <CarouselNext className="end-4 border-0 bg-white/80 opacity-0 shadow-lifted backdrop-blur transition-opacity group-hover:opacity-100 max-md:opacity-100 dark:bg-black/50" />
    </Carousel>
  );
}
