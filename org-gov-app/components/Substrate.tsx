/**
 * The sheet's substrate: a network of blocks, nodes and traces.
 *
 * Replaces the plain square grid. The vocabulary comes from the supplied
 * network artwork — scattered blocks, circular nodes, and orthogonal traces
 * routing between them at right angles, the way a board is routed — but in
 * this sheet's ink rather than the artwork's cyan-on-navy, because it has to
 * sit under text on paper.
 *
 * It is a substrate, not a picture. Traces are drawn at ~1.07:1 against the
 * paper and nodes at ~1.16:1 — legible as texture, invisible as content,
 * which is the correct weight for something a governance record is printed
 * on. Anything louder competes with the figures, which are the point.
 *
 * Rendered as one tiling <pattern> in a single fixed SVG: no repeated DOM, no
 * image request, no JavaScript, and stroke colours that still read from the
 * token layer — a data-URI background could not, and would have pinned the
 * colour outside the theme.
 */
export default function Substrate() {
    return (
        <svg className="substrate" aria-hidden="true" focusable="false">
            <defs>
                {/* Traces enter and leave on matching coordinates — the
                    horizontal run at y=60 on both edges, the vertical at
                    x=90 — so the tile joins itself without visible seams. */}
                <pattern
                    id="substrate-net"
                    width="240"
                    height="240"
                    patternUnits="userSpaceOnUse"
                >
                    <g className="substrate-trace">
                        <path d="M0 60 H60 V140 H160 V60 H240" />
                        <path d="M90 0 V60 H150 V180 H90 V240" />
                        {/* Branches that terminate in a node, as a routed
                            board's do. Internal, so they cross no seam. */}
                        <path d="M160 140 H210 V190" />
                        <path d="M90 180 H30 V212" />
                    </g>

                    <g className="substrate-node">
                        <circle cx="60" cy="60" r="3.5" />
                        <circle cx="160" cy="140" r="3.5" />
                        <circle cx="150" cy="60" r="2.5" />
                        <circle cx="90" cy="180" r="2.5" />
                        <circle cx="210" cy="190" r="3" />
                        <circle cx="30" cy="212" r="3" />
                    </g>

                    {/* Blocks. A few solid, most outlined — the same read as
                        the milestone cubes in the hero, where a filled block
                        means something has landed. */}
                    <g className="substrate-block">
                        <rect x="24" y="96" width="11" height="11" />
                        <rect x="186" y="90" width="7" height="7" />
                        <rect x="112" y="204" width="13" height="13" />
                        <rect x="44" y="18" width="6" height="6" />
                        <rect x="196" y="228" width="9" height="9" />
                        <rect x="128" y="118" width="6" height="6" />
                    </g>
                    <g className="substrate-block-solid">
                        <rect x="70" y="106" width="7" height="7" />
                        <rect x="212" y="52" width="5" height="5" />
                        <rect x="150" y="166" width="6" height="6" />
                    </g>
                </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#substrate-net)" />
        </svg>
    );
}
