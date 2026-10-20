"use client";

import { SqueezeCarousel, type SqueezeSlide } from "@/components/ui/carousel-squeeze";

export const settings = {
    height: 320,
    gap: 16,
    slatGap: 8,
    slatWidth: 8,
    radius: 6,
    duration: 1000,
    hoverGrow: true,
    autoplay: false,
    interval: 6000,
    controls: true,
};

type DemoProps = Partial<typeof settings>;

/** A wordmark for the corner of the open panel. */
const mark = (text: string) => (
    <span className="text-sm font-medium tracking-tight text-white">{text}</span>
);

const unsplash = (id: string) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&h=675&q=80`;

// Placeholder series until this is fed from the CMS's collections.
const slides: SqueezeSlide[] = [
    {
        id: "khumbu",
        title: "Prayer flags and the roof of the world.",
        description:
            "Three weeks on the trail from Lukla to Everest Base Camp, photographed at first light and in the long blue hour after.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Khumbu"),
        image: unsplash("1544735716-392fe2489ffa"),
        imageAlt: "A white stupa on a ridge beneath snow-covered Himalayan peaks",
    },
    {
        id: "above",
        title: "Above the weather.",
        description:
            "Summits at dawn, standing clear of a sea of cloud that hides everything below.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Above"),
        image: unsplash("1506905925346-21bda4d32df4"),
        imageAlt: "Snow-capped peaks rising above a sea of cloud at sunrise",
    },
    {
        id: "still-water",
        title: "Still water.",
        description:
            "Alpine lakes in the hour before the wind picks up, when the surface still holds the mountains.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Still water"),
        image: unsplash("1501785888041-af3ef285b470"),
        imageAlt: "A rowing boat on a turquoise alpine lake beneath rocky peaks",
    },
    {
        id: "dusk",
        title: "One tree, one lake, one long exposure.",
        description:
            "A study in patience: the same frame, returned to through a season of evenings.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Dusk"),
        image: unsplash("1494500764479-0c8f2919a3d8"),
        imageAlt: "A lone tree standing in a calm lake under a violet dusk sky",
    },
    {
        id: "glen",
        title: "Small worlds in the highlands.",
        description:
            "Hidden glens and stone circles, found by walking off the map and waiting for the light to arrive.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Highlands"),
        image: unsplash("1472214103451-9374bd1c798e"),
        imageAlt: "A spiral of stones in a green glen with the sun setting between hills",
    },
    {
        id: "red-rock",
        title: "Roads that run out of reasons.",
        description:
            "Desert highways through red-rock country, shot from the centre line at the hottest hour of the day.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Red rock"),
        image: unsplash("1500530855697-b586d89ba3ee"),
        imageAlt: "An empty road running between red sandstone formations toward a mountain",
    },
    {
        id: "shoreline",
        title: "The edge of the tide.",
        description:
            "Coastlines at sunrise, where the sea draws a new line on the sand every few seconds.",
        action: "View the series",
        href: "/gallery",
        overlay: mark("Shoreline"),
        image: unsplash("1507525428034-b723cf961d3e"),
        imageAlt: "Gentle waves washing onto a sandy beach as the sun rises",
    },
];

export default function SqueezeCarouselDemo(props: DemoProps) {
    const options = { ...settings, ...props };

    return (
        <SqueezeCarousel
            slides={slides}
            label="Featured series"
            // The site's red, rather than the shadcn primary, so the arrows and
            // the button match the rest of the public pages.
            accent="var(--md-red)"
            accentForeground="#f8f4f4"
            {...options}
        />
    );
}
