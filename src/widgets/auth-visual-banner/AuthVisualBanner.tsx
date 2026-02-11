"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { cn } from "@shared/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@shared/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";

import planeImg from "@shared/assets/img/banner/banner_1.jpg";
import hotelImg from "@shared/assets/img/banner/banner_2.jpg";
import hotelImg2 from "@shared/assets/img/banner/banner_3.jpg";

export default function AuthVisualBanner() {
  const bannerImages = [planeImg, hotelImg, hotelImg2];

  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [count, setCount] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setSelectedIndex(api.selectedScrollSnap());

    api.on("select", onSelect);
    api.on("reinit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reinit", onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="relative w-full max-h-200 rounded-4xl overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false }), Fade()]}
      >
        <CarouselContent>
          {bannerImages.map((image, index) => (
            <CarouselItem key={index}>
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                priority={index === 0}
                className="aspect-3/8 lg:aspect-4/8 xl:aspect-3/4 h-full object-cover rounded-4xl"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2.5 rounded-full cursor-pointer transition-all duration-300",
              index === selectedIndex ? "w-8 bg-primary" : "w-2.5 bg-white",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-4xl pointer-events-none" />
    </div>
  );
}
