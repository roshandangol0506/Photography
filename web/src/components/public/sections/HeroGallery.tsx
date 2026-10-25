import {
  BentoCell,
  BentoGrid,
  ContainerScale,
  ContainerScroll,
} from "@/components/ui/hero-gallery-scroll-animation";

import type { CSSProperties } from "react";
import { getImageProps } from "next/image";

import { Button } from "@/components/ui/Button";

/**
 * A photo from /public, sent through the Next image optimizer: some originals
 * are full-size camera files, far too heavy to hand the browser directly.
 * `width` is the most the cell shows it at; the source comes back at twice
 * that for 2x screens.
 */
const photo = (n: number, width: number) =>
  getImageProps({ src: `/${n}.jpg`, alt: "", width, height: width }).props.src;

// Ordered for the default layout: a wide lead image, two tall side cells (the
// portraits crop well there), then two wide strips along the base. Widths
// follow each cell's share of the screen. Decorative - the hero's text
// carries the meaning - so alt stays empty.
const IMAGES = [
  photo(5, 1080), // masked dancer above a festival crowd
  photo(10, 480), // snow-dusted Himalayan peak against a blue sky
  photo(15, 480), // girl in a red festival costume in a dark doorway
  photo(1, 720), // woman working in a green rice field
  photo(9, 720), // girl with eyes closed, orange powder in her hair
];

const HeroDemo1 = () => {
  return (
    <ContainerScroll className="h-[350vh]">
      <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4">
        {IMAGES.map((imageUrl, index) => (
          <BentoCell
            key={index}
            // flow-item: follows the section in when it slides in sideways
            // (FlowPanel); --i staggers the cells.
            className="flow-item overflow-hidden rounded-xl shadow-xl"
            style={{ "--i": index } as CSSProperties}
            // The cursor opens into "View project" over each photo.
            data-pointer="view"
          >
            <img
              className="size-full object-cover object-center"
              src={imageUrl}
              alt=""
            />
          </BentoCell>
        ))}
      </BentoGrid>

      <ContainerScale className="relative z-10 text-center">
        <h2 className="max-w-xl text-5xl font-bold tracking-tighter text-md-light">
          Your Animated Hero
        </h2>
        <p className="my-6 max-w-xl text-sm text-md-light/75 md:text-base">
          Yet another hero section, this time with scroll trigger animations,
          animating the hero content with motion.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400">
            Get Started
          </Button>
          <Button
            variant="link"
            className="bg-transparent px-4 py-2 font-medium"
          >
            Learn more
          </Button>
        </div>
      </ContainerScale>
    </ContainerScroll>
  );
};

const HeroDemo2 = () => {
  return (
    <ContainerScroll className="h-[350vh]">
      <BentoGrid
        variant={"fourCells"}
        className="sticky left-0 top-0 h-svh w-full p-4"
      >
        {IMAGES.filter((_, index) => index <= 3).map((imageUrl, index) => (
          <BentoCell
            key={index}
            className="overflow-hidden rounded-xl shadow-xl"
          >
            <img
              className="size-full object-cover object-center"
              src={imageUrl}
              alt=""
            />
          </BentoCell>
        ))}
      </BentoGrid>
      <ContainerScale className="text-center">
        <h2 className="max-w-xl text-5xl font-bold tracking-tighter">
          Your Animated Hero
        </h2>
        <p className="my-6 max-w-xl text-sm text-stone-500 md:text-base">
          Yet another hero section, this time with scroll trigger animations,
          animating the hero content with motion.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="bg-indigo-700 px-4 py-2 font-medium   hover:bg-indigo-200">
            Get Started
          </Button>
          <Button
            variant={"link"}
            className="bg-transparent px-4 py-2 font-medium  "
          >
            Learn more
          </Button>
        </div>
      </ContainerScale>
    </ContainerScroll>
  );
};

const HeroDemo3 = () => {
  return (
    <ContainerScroll className="h-[350vh] bg-slate-900 text-slate-100">
      <BentoGrid
        variant={"threeCells"}
        className="sticky left-0 top-0 h-svh w-full p-4"
      >
        {IMAGES.filter((_, index) => index <= 2).map((imageUrl, index) => (
          <BentoCell
            key={index}
            className="overflow-hidden rounded-xl shadow-xl"
          >
            <img
              className="size-full object-cover object-center"
              src={imageUrl}
              alt=""
            />
          </BentoCell>
        ))}
      </BentoGrid>
      <ContainerScale className="text-center">
        <h2 className="max-w-xl text-5xl font-bold tracking-tighter ">
          Your Animated Hero
        </h2>
        <p className="my-6 max-w-xl text-sm opacity-80 md:text-base">
          Yet another hero section, this time with scroll trigger animations,
          animating the hero content with motion.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button className="bg-indigo-700 px-4 py-2 font-medium   hover:bg-indigo-400">
            Get Started
          </Button>
          <Button
            variant={"link"}
            className="bg-transparent px-4 py-2 font-medium text-white  "
          >
            Learn more
          </Button>
        </div>
      </ContainerScale>
    </ContainerScroll>
  );
};
export { HeroDemo1, HeroDemo2, HeroDemo3 };
