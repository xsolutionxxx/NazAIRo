"use client";

import { useRef } from "react";

import { Container } from "@/shared/ui/container";

import ParallaxScreen from "@/widgets/parallax-screen/ParallaxScreen";
import Header from "@/widgets/header/Header";
/* import SearchWidget from "@/widgets/search-widget/SearchWidget"; */

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden h-[130vw] md:h-[60vw] max-h-202.5 perspective-[2500px] bg-linear-to-t from-[#293a38] to-[#578582]"
    >
      <ParallaxScreen containerRef={sectionRef} />
      <Container>
        <Header className="z-9999" />
        {/* <SearchWidget className="absolut z-9998" /> */}
      </Container>
    </section>
  );
}
