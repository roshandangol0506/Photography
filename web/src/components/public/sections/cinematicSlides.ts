import type { CinematicSlide } from "./CinematicSlider";

/**
 * Slides for the "cinematic" hero style (Admin -> Appearance -> Transition
 * style -> E). Edit this list to change the photographs and copy; the slider
 * itself never needs touching. Add, remove or reorder entries freely.
 *
 * The slides form one strip: slide 1's photo is on the left with slide 2's
 * on the right, and stepping forward slides slide 2's photo across to the
 * left and brings slide 3's in on the right. The copy shown is always the
 * left photo's. Photos alternate wide and narrow along the strip, so any
 * photo may be cropped either way - landscape shots work best.
 *
 * PLACEHOLDERS: the photos are the numbered files in /public and the copy is
 * stand-in text. Replace `image` with your own path (any file under /public,
 * e.g. "/hero/everest.jpg", or an /uploads/... path) and rewrite the text.
 *
 * - image / alt                    the photograph (required)
 * - heading, subtitle, description optional copy, all three can be left out
 * - overlay                        0-1 darkening over the photograph, raise
 *                                  it if the copy is hard to read
 * - focus                          CSS object-position for the photograph,
 *                                  e.g. "50% 30%" to keep a face in frame
 */
export const CINEMATIC_SLIDES: CinematicSlide[] = [
  {
    image: "/16.jpg",
    alt: "A smiling girl in a red and gold festival headdress, her forehead painted with a third eye",
    heading: "Faces of the Valley",
    subtitle: "Festival portraits",
    description:
      "Painted eyes, red and gold, and the quiet second before the procession moves on.",
    focus: "50% 35%",
  },
  {
    image: "/18.jpg",
    alt: "Three young monks in maroon robes leaping and kicking in front of a weathered yellow wall",
    heading: "Gravity Optional",
    subtitle: "Monastery mornings",
    description:
      "Novice monks at play between lessons. The frame lasts a fraction of a second.",
  },
  {
    image: "/14.jpg",
    alt: "A rider in traditional dress galloping a decorated horse along a mountain road",
    heading: "Into the High Country",
    subtitle: "Riders and wild places",
    description:
      "Dust on the road, hooves on stone, and long light across the hills.",
  },
  {
    image: "/21.jpg",
    alt: "A crowd of men covered in orange powder celebrating at a festival",
    heading: "Colour in the Air",
    subtitle: "Celebration, up close",
    description:
      "Powder, drums and crowds, photographed from inside the moment rather than the edge of it.",
  },
  {
    image: "/2.jpg",
    alt: "A hillside village beneath bare mountains in autumn",
    heading: "Villages Above the Clouds",
    subtitle: "The high valleys",
    description:
      "Stone houses, autumn trees and the long walk between one valley and the next.",
  },
  {
    image: "/22.jpg",
    alt: "Two boys peering over a wooden ledge, in black and white",
    heading: "Quiet Minutes",
    subtitle: "In black and white",
    description:
      "Two boys at a ledge, and the stillness between one moment and the next.",
    overlay: 0.25,
  },
];
