import { TenetsStage } from "./TenetsStage";
import "./tenets.css";

/** Placeholder for every image in the section - swap per the note in the PR. */
const SRC = "/about.png";

/**
 * Eight panels, server-rendered, handed to the client stage as children.
 *
 * Panel order is the scroll order. `data-panel` on a parallax image is its
 * index in that order - the scroll module uses it to work out when the panel
 * is on screen, so it must match the panel's position.
 */
export function TenetsSlider() {
  return (
    <TenetsStage>
      {/* 1 - intro card: scales up and cross-fades as it settles */}
      <article className="panel panel--intro">
        <div className="panel__card">
          <div className="panel__card-body">
            <h2 className="tenets__title" id="tenets-title">
              Working Principles
            </h2>
            <p className="panel__lede">
              Placeholder copy for the opening panel. It runs long enough to
              show how a full paragraph settles into the column at this width,
              where the line breaks fall, and how the type holds against the
              background. Replace it with the real introduction once the copy
              has been written.
            </p>
          </div>
          <figure className="panel__media">
            <img
              src={SRC}
              alt=""
              width={1600}
              height={900}
              loading="eager"
              draggable={false}
            />
            <figcaption className="panel__media-title">Field Notes</figcaption>
          </figure>
        </div>
      </article>

      {/* 2 - full bleed */}
      <article className="panel panel--image">
        <h3 className="tenets__sr-only">First study</h3>
        <img
          className="panel__bleed"
          data-parallax
          data-panel="1"
          src={SRC}
          alt=""
          width={2000}
          height={1335}
          loading="lazy"
          draggable={false}
        />
      </article>

      {/* 3 - text and a small image */}
      <article className="panel panel--text">
        <div className="panel__col">
          <p className="panel__kicker">Method and craft</p>
          <h3 className="panel__display">Process</h3>
          <p className="panel__body">
            Placeholder copy for this panel. It runs long enough to show how a
            paragraph settles into a narrower measure, where the line breaks
            land, and how the spacing reads beneath a display heading. Replace
            it with the real text when the copy is ready.
          </p>
        </div>
        <figure className="panel__aside">
          <img
            src={SRC}
            alt=""
            width={1200}
            height={600}
            loading="lazy"
            draggable={false}
          />
        </figure>
      </article>

      {/* 4 - full bleed */}
      <article className="panel panel--image">
        <h3 className="tenets__sr-only">Second study</h3>
        <img
          className="panel__bleed"
          data-parallax
          data-panel="3"
          src={SRC}
          alt=""
          width={2000}
          height={1335}
          loading="lazy"
          draggable={false}
        />
      </article>

      {/* 5 - heading rail, three staggered portrait tiles, narrow body */}
      <article className="panel panel--trio">
        <div className="panel__col">
          <p className="panel__kicker">Three studies</p>
          <h3 className="panel__display">Series</h3>
        </div>
        <div className="panel__tiles">
          {["high", "mid", "low"].map((offset) => (
            <figure key={offset} className={`panel__tile panel__tile--${offset}`}>
              <img
                src={SRC}
                alt=""
                width={900}
                height={1200}
                loading="lazy"
                draggable={false}
              />
            </figure>
          ))}
        </div>
        <p className="panel__body">
          Placeholder copy for the side column. It is deliberately short so the
          measure stays narrow next to the images, and long enough to show how
          the leading reads at this size. Replace it with the real text.
        </p>
      </article>

      {/* 6 - full bleed */}
      <article className="panel panel--image">
        <h3 className="tenets__sr-only">Third study</h3>
        <img
          className="panel__bleed"
          data-parallax
          data-panel="5"
          src={SRC}
          alt=""
          width={2000}
          height={1335}
          loading="lazy"
          draggable={false}
        />
      </article>

      {/* 7 - editorial: three offset images at different sizes and heights */}
      <article className="panel panel--editorial">
        <div className="panel__offsets">
          {[
            { key: "a", w: 900, h: 1200 },
            { key: "b", w: 1200, h: 1200 },
            { key: "c", w: 960, h: 1200 },
          ].map((item) => (
            <figure
              key={item.key}
              className={`panel__offset panel__offset--${item.key}`}
            >
              <img
                src={SRC}
                alt=""
                width={item.w}
                height={item.h}
                loading="lazy"
                draggable={false}
              />
            </figure>
          ))}
        </div>
        <h3 className="panel__display">Archive</h3>
        <p className="panel__body">
          Placeholder copy for the editorial panel. It sits in a narrow column
          beside the heading so the two read as one block, and runs long enough
          to show the rhythm of the lines. Replace it with the real text.
        </p>
      </article>

      {/* 8 - closing, dark */}
      <article className="panel panel--closing">
        <img
          className="panel__closing-bg"
          src={SRC}
          alt=""
          width={2000}
          height={1335}
          loading="lazy"
          draggable={false}
        />
        <div className="panel__scrim" />
        <div className="panel__closing-inner">
          <h3 className="panel__display">Closing</h3>
          <p className="panel__body">
            A short closing line that sits centred over the photograph, kept
            brief so it holds its shape against the image behind it. Replace it
            with the real sign-off.
          </p>
        </div>
      </article>
    </TenetsStage>
  );
}
