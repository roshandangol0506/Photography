import type { StoryScene } from "./CinematicStory";

/**
 * Scenes for the full-screen story section under "Selected frames" on the
 * home page. One scroll gesture moves one scene. Edit this list to change the
 * copy or photographs; CinematicStory never needs touching.
 *
 * Photos are the numbered files in /public - replace `image` with any other
 * /public or /uploads path. `focus` is an optional CSS object-position for
 * keeping a subject in frame as the panel crops.
 *
 * kinds:
 *   intro    eyebrow + paragraph + a "next" button
 *   pair     two photos side by side
 *   trio     one wide photo over two
 *   feature  one tall photo, one photo beside it, and a link panel
 */
export const STORY_SCENES: StoryScene[] = [
  {
    kind: "intro",
    eyebrow: "Over a decade of visual storytelling",
    text: "At Stock Photography Nepal, we are one of the leading film and video production companies in Nepal with over a decade of experience in documentary filmmaking, photography, and storytelling. From remote Himalayan villages to bustling cities, we specialize in crafting visual stories that inspire, inform, and create lasting impact. Our team works across borders, partnering with global organizations to deliver films, documentaries, promotional videos, and photography projects that matter.",
    cta: "Selected work",
  },
  {
    kind: "pair",
    panels: [
      {
        image: "/20.jpg",
        alt: "Close portrait of a young girl looking into the camera",
        title: "Hilti Foundation",
        focus: "50% 35%",
      },
      {
        image: "/1.jpg",
        alt: "A woman in a white hat working in a green rice field",
        title: "Swisscontact",
      },
    ],
  },
  {
    kind: "trio",
    panels: [
      {
        image: "/2.jpg",
        alt: "A hillside village beneath bare mountains in autumn",
        title: "High Valleys",
        focus: "50% 60%",
      },
      {
        image: "/7.jpg",
        alt: "A costumed festival dancer with many arms in a temple courtyard",
        title: "Living Traditions",
        focus: "50% 30%",
      },
      {
        image: "/3.jpg",
        alt: "A boy standing in drifting steam, lit from behind",
        title: "Portraits",
        focus: "50% 30%",
      },
    ],
  },
  {
    kind: "feature",
    panels: [
      {
        image: "/15.jpg",
        alt: "A girl in a red festival costume standing in a dark doorway",
        title: "Heritage",
        focus: "50% 40%",
      },
      {
        image: "/19.jpg",
        alt: "A spotted deer standing on a forest path",
        title: "Wildlife",
      },
    ],
    link: { label: "What we do", href: "/about" },
  },
];
