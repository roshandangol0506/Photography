"use client"

import InkBlotCarousel from "@/components/ui/ink-blot-carousel"

// Real landscape photography (Unsplash).
const U = (id: string) => "https://images.unsplash.com/photo-" + id + "?q=80&w=1800&auto=format&fit=crop"

// Captions only name places that are identifiable in the frame.
const SLIDES = [
  { image: U("1506905925346-21bda4d32df4"), title: "Above the Clouds", caption: "Sunrise over a sea of cloud.", alt: "Snow-capped peaks rising above a sea of cloud at sunrise" },
  { image: U("1501785888041-af3ef285b470"), title: "Glass Lake", caption: "Lago di Braies, a rowboat at noon.", alt: "A rowing boat on a turquoise alpine lake beneath rocky peaks" },
  { image: U("1469474968028-56623f02e42e"), title: "Gold Valley", caption: "Late light pouring over the ridge.", alt: "A hiker standing on a rock above a hazy valley" },
  { image: U("1464822759023-fed622ff2c3b"), title: "Snow Line", caption: "Pines, river flats and the high range.", alt: "Snow-capped mountains above a pine forest" },
  { image: U("1500534314209-a25ddb2bd429"), title: "Blue Ridges", caption: "Seven layers of haze before dusk.", alt: "Layered blue mountain ridges fading into a peach-coloured haze" },
  { image: U("1433086966358-54859d0ed716"), title: "Falls Bridge", caption: "Multnomah Falls after the rain.", alt: "A tall waterfall dropping beneath a stone footbridge through green cliffs" },
  { image: U("1470071459604-3b5ec3a7fe05"), title: "Morning Fog", caption: "Cloud spilling over the ridge at first light.", alt: "Low cloud over green highland ridges with the sun breaking through" },
  { image: U("1441974231531-c6227db76b6e"), title: "Green Cathedral", caption: "Tall trunks and late-summer light.", alt: "Sunlight falling between tall trees onto a forest path" },
]

export default function DemoPhotos() {
  return <InkBlotCarousel slides={SLIDES} ariaLabel="Landscape photographs" />
}
