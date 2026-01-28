"use client";

import { RefObject } from "react";
import Image from "next/image";

import { useMouseFromCenter } from "@/shared/lib/hooks/use-mouse-from-center";
import { ParallaxItem } from "@/shared/ui/parallax-item";

import background from "@shared/assets/img/hero_parallax/background.png";
import fog_7 from "@shared/assets/img/hero_parallax/fog_7.png";
import mountain_10 from "@shared/assets/img/hero_parallax/mountain_10.png";
import fog_6 from "@shared/assets/img/hero_parallax/fog_6.png";
import mountain_9 from "@shared/assets/img/hero_parallax/mountain_9.png";
import mountain_8 from "@shared/assets/img/hero_parallax/mountain_8.png";
import fog_5 from "@shared/assets/img/hero_parallax/fog_5.png";
import mountain_7 from "@shared/assets/img/hero_parallax/mountain_7.png";
import mountain_6 from "@shared/assets/img/hero_parallax/mountain_6.png";
import fog_4 from "@shared/assets/img/hero_parallax/fog_4.png";
import mountain_5 from "@shared/assets/img/hero_parallax/mountain_5.png";
import fog_3 from "@shared/assets/img/hero_parallax/fog_3.png";
import mountain_4 from "@shared/assets/img/hero_parallax/mountain_4.png";
import mountain_3 from "@shared/assets/img/hero_parallax/mountain_3.png";
import fog_2 from "@shared/assets/img/hero_parallax/fog_2.png";
import mountain_2 from "@shared/assets/img/hero_parallax/mountain_2.png";
import mountain_1 from "@shared/assets/img/hero_parallax/mountain_1.png";
import sun_rays from "@shared/assets/img/hero_parallax/sun_rays.png";
import black_shadow from "@shared/assets/img/hero_parallax/black_shadow.png";
import fog_1 from "@shared/assets/img/hero_parallax/fog_1.png";
import { MapPin } from "lucide-react";

interface ParallaxScreenProps {
  containerRef: RefObject<HTMLElement | null>;
}

export default function ParallaxScreen({ containerRef }: ParallaxScreenProps) {
  const { mouseX, mouseY } = useMouseFromCenter(containerRef);
  const commonParallax = { mouseX, mouseY };

  return (
    <>
      <div className="absolute top-0 left-0 inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent z-85" />
      <div className="absolute top-0 left-0 inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.7))] z-1000" />

      <ParallaxItem
        {...commonParallax}
        speedX={0.3}
        speedY={0.27}
        speedZ={0}
        baseScale={1.1}
        className="top-[12.86%] w-[194.44%] md:top-[8.86%] -bottom-[120%] left-1/2 z-10"
      >
        <Image
          src={background}
          alt="Background"
          fill
          className="object-cover"
        />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.27}
        speedY={0.32}
        speedZ={0}
        className="h-[211.2%] md:w-[132%] top-1/2 left-[65.28%] z-20"
      >
        <Image src={fog_7} alt="Fog 7" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.195}
        speedY={0.305}
        speedZ={0}
        className="h-[99.55%] top-[86.52%] left-[68.97%] md:w-[62.22%] md:top-[62.52%] md:left-[65.97%] z-30"
      >
        <Image src={mountain_10} alt="Mountain 10" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.25}
        speedY={0.28}
        speedZ={0}
        className="h-[225.78%] md:w-[141.11%] top-[90.49%] left-[49.31%] z-40"
      >
        <Image src={fog_6} alt="Fog 6" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.125}
        speedY={0.155}
        speedZ={0.15}
        rotateSpeed={0.02}
        className="h-[53.33%] top-[28.95%] left-[18.26%] md:w-[33.33%] md:top-[68.95%] md:left-[16.26%] z-50"
      >
        <Image src={mountain_9} alt="Mountain 9" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.1}
        speedY={0.11}
        speedZ={0}
        rotateSpeed={0.02}
        className="h-[88.88%] top-[74.95%] left-[19.26%] md:w-[55.55%] md:top-[69.62%] md:left-[35.97%] z-60"
      >
        <Image src={mountain_8} alt="Mountain 8" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.16}
        speedY={0.105}
        speedZ={0}
        className="h-[48.88%] top-[23%] left-[48%] md:w-[30.55%] md:top-[66.19%] md:left-[51.39%] z-70"
      >
        <Image src={fog_5} alt="Fog 5" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.1}
        speedY={0.1}
        speedZ={0}
        rotateSpeed={0.09}
        className="h-[62.21%] top-[60.52%] left-[75.97%] md:w-[38.88%] md:top-[65.19%] md:left-[69.18%] z-80"
      >
        <Image src={mountain_7} alt="Mountain 7" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.07}
        speedY={0.07}
        speedZ={0}
        rotateSpeed={0.11}
        className="top-[35.5%] left-1/2 z-90 text-white text-center whitespace-nowrap"
      >
        <h2 className="font-thin text-[20px] xs:text-[28px] sm:text-[35px] md:text-[28px] lg:text-[35px] xl:text-[45px]">
          Helping Others
        </h2>

        <h1 className="font-bold text-[32px] xs:text-[40px] sm:text-[60px] md:text-[45px] lg:text-[60px] xl:text-[80px] leading-tight tracking-tight uppercase">
          Live & Travel
        </h1>

        <h3 className="mt-4 text-[10px] xs:text-xs sm:text-base md:text-xs lg:text-base xl:text-xl uppercase">
          Special offers to suit your plan
        </h3>
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.065}
        speedY={0.05}
        speedZ={0.05}
        rotateSpeed={0.12}
        className="h-[44.43%] top-[18.52%] left-[72.97%] md:w-[27.77%] md:top-[57.41%] md:left-[85.97%] z-100"
      >
        <Image src={mountain_6} alt="Mountain 6" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.135}
        speedY={0.12}
        speedZ={0}
        className="h-[66.66%] top-[40.52%] left-[75.97%] md:w-[41.66%] md:top-[85.53%] md:left-[45.83%] z-110"
      >
        <Image src={fog_4} alt="Fog 4" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.08}
        speedY={0.09}
        speedZ={0.13}
        rotateSpeed={0.1}
        className="h-[62.21%] top-[84.52%] left-[55.97%] md:w-[38.88%] md:top-[88.21%] md:left-[59.03%] z-120"
      >
        <Image src={mountain_5} alt="Mountain 5" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.11}
        speedY={0.018}
        speedZ={0.35}
        className="h-[177.78%] top-[14.52%] left-[55.97%] md:w-[111.11%] md:top-[63.58%] md:left-[48.96%] z-130"
      >
        <Image src={fog_3} alt="Fog 3" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.059}
        speedY={0.024}
        speedZ={0.32}
        rotateSpeed={0.15}
        className="h-[80%] top-[85.52%] left-[22.97%] md:w-1/2 md:top-[77.28%] md:left-[23.51%] z-140"
      >
        <Image src={mountain_4} alt="Mountain 4" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.04}
        speedY={0.018}
        speedZ={0}
        rotateSpeed={0.05}
        className="h-[44.43%] top-[8.52%] left-[106.97%] md:w-[27.77%] md:top-[63.95%] md:left-[91.67%] z-150"
      >
        <Image src={mountain_3} alt="Mountain 3" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.15}
        speedY={0.0115}
        speedZ={0}
        className="h-[44.43%] top-[40.52%] left-[36.97%] md:w-[97.22%] md:top-[71.85%] md:left-[38.92%] z-160"
      >
        <Image src={fog_2} alt="Fog 2" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.235}
        speedY={0.013}
        speedZ={0.42}
        rotateSpeed={0.15}
        className="h-[68.88%] top-[70.52%] left-[72.97%] md:w-[43.05%] md:top-[73.21%] md:left-[70%] z-170"
      >
        <Image src={mountain_2} alt="Mountain 2" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.027}
        speedY={0.018}
        speedZ={0.53}
        rotateSpeed={0.2}
        className="h-[58.66%] top-[28.52%] left-[12.97%] md:w-[36.66%] md:top-[60.30%] md:-left-[3.26%] z-180"
      >
        <Image src={mountain_1} alt="Mountain 1" />
      </ParallaxItem>

      <Image
        src={sun_rays}
        alt="Sun rays"
        className="absolute w-[41.66%] top-0 -right-[5%] z-190 pointer-events-none"
      />

      <Image
        src={black_shadow}
        alt="Shadow"
        className="absolute w-full bottom-0 right-0 z-200 pointer-events-none"
      />

      <ParallaxItem
        {...commonParallax}
        speedX={0.12}
        speedY={0.01}
        speedZ={0}
        className="h-[58.66%] top-[93%] left-[58%] md:w-[111.11%] md:top-[60.49%] md:left-[53%] z-210"
      >
        <Image src={fog_1} alt="Fog 1" />
      </ParallaxItem>

      <ParallaxItem
        {...commonParallax}
        speedX={0.12}
        speedY={0.01}
        speedZ={0}
        className="flex items-center gap-2 bottom-5 left-[58.2%] text-white text-[10px] sm:text-xs lg:text-lg z-220"
      >
        <MapPin strokeWidth={1.5} size={20} />
        <span>China, Zhangjiajie</span>
      </ParallaxItem>
    </>
  );
}
