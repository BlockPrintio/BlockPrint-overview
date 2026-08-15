import { useEffect, useRef, useState } from 'react';
import styles from './MilestoneMark.module.css';

export interface MarkRow {
    id: string;
    total: number;
    completed: number;
}

interface MilestoneMarkProps {
    rows: MarkRow[];
}

/* ==========================================================================
   THE MARK

   Geometry comes from the logo itself — public/blockprint-mark.svg — not from
   measurements taken off a render. Earlier passes eyeballed it and got three
   things wrong: the two lobes are the SAME width (both 510), the slot between
   them is 10 units rather than the ~40 guessed, and the B glyph is a perfect
   510x510 square rather than the upright rectangle used before.

   The `d` strings below are copied verbatim from that file. The fallback
   renders them directly; the WebGL path transcribes the same curves, with y
   negated because SVG counts downward and Three counts up.

   Mark space is SVG user units: 1140 x 510, origin at the mark's top-left.
   ========================================================================== */

const MARK_W = 1140;
const MARK_H = 510;

/** Verbatim from the logo file. */
const PATH_GLYPH_2 = 'M630 255C630 114.167 744.167 0 885 0C1025.83 0 1140 114.167 1140 255C1140 395.833 1025.83 510 885 510H630V255Z';
const PATH_LOBE_UPPER = 'M0 0H385C454.036 0 510 55.9644 510 125C510 194.036 454.036 250 385 250H0V0Z';
const PATH_LOBE_LOWER = 'M0 260H385C454.036 260 510 315.964 510 385C510 454.036 454.036 510 385 510H0V260Z';
const MARK_PATHS = [PATH_LOBE_UPPER, PATH_LOBE_LOWER, PATH_GLYPH_2];

/** Mark height maps to 1.5 scene units, which is what the cube sizes assume. */
const UNIT = 1.5 / MARK_H;

/* One cube per contracted milestone, breaking off the mark's left edge.
   Authored in mark space so they share the letterform's coordinate system,
   and fixed rather than random so the composition is identical on the server
   and on every render. [x, y, size]. */
const CUBE_LAYOUT: [number, number, number][] = [
    [-235, 10, 96], [-390, 88, 64], [-520, 132, 42],
    [-250, 165, 100], [-405, 228, 66], [-545, 268, 40],
    [-240, 330, 98], [-390, 392, 64], [-520, 428, 44],
    [-310, 468, 78],
];

/* --------------------------------------------------------------------------
   Static fallback — the logo's own path data, unmodified.

   Renders on the server and is what a visitor sees with JavaScript off, with
   WebGL blocked, or where WebGL software-renders.
   -------------------------------------------------------------------------- */
function MarkFallback({ rows }: { rows: MarkRow[] }) {
    const total = rows.reduce((s, r) => s + r.total, 0);
    const done = rows.reduce((s, r) => s + r.completed, 0);

    const cubes = CUBE_LAYOUT.slice(0, total).map(([x, y, s], i) => ({
        x, y, s, filled: i < done,
    }));

    const pad = 40;
    const minX = Math.min(...cubes.map((c) => c.x), 0) - pad;
    const minY = Math.min(...cubes.map((c) => c.y), 0) - pad;
    const maxX = MARK_W + pad;
    const maxY = Math.max(...cubes.map((c) => c.y + c.s), MARK_H) + pad;

    return (
        <svg
            className={styles.fallback}
            viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`The BlockPrint mark, with ${total} cubes for the ${total} contracted milestones, ${done} signed off`}
        >
            {MARK_PATHS.map((d, i) => (
                <path key={i} d={d} className={styles.markShape} />
            ))}
            {cubes.map((c, i) => (
                <rect
                    key={i}
                    x={c.x} y={c.y} width={c.s} height={c.s}
                    className={c.filled ? styles.cubeFilled : styles.cubeLine}
                />
            ))}
        </svg>
    );
}

/**
 * The BlockPrint mark, drawn as a drafted solid.
 *
 * The logo extruded, with cubes breaking off its left edge. Each cube is one
 * contracted milestone — ten of them — drawn in outline until that milestone
 * is signed off, at which point it fills with ink. Today none are, so every
 * cube is outline, and it changes on its own the moment the record does.
 *
 * Deliberately unlit and orthographic: no lights, no emissive, no bloom, no
 * gradient. The reference art is a lit gradient render on black; this is the
 * same mark drawn the way the rest of the sheet is drawn — paper fill,
 * cyanotype edges, planes separated by tone rather than by lighting.
 */
export default function MilestoneMark({ rows }: MilestoneMarkProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const [live, setLive] = useState(false);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;

        let disposed = false;
        let frame = 0;
        let cleanupFns: Array<() => void> = [];

        import('three').then((THREE) => {
            if (disposed) return;

            const probe = document.createElement('canvas');
            if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

            let renderer: InstanceType<typeof THREE.WebGLRenderer>;
            try {
                renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            } catch {
                return;
            }

            // Tokens are authored in oklch(), which THREE.Color cannot parse —
            // it warns and leaves the colour white, invisible on this paper.
            // Reading back fillStyle does not help either, because Chrome
            // re-serialises a non-legacy colour as oklch(). Painting one pixel
            // and reading its bytes is the only reliable route.
            const readColor = (token: string, fallback: string) => {
                const raw = getComputedStyle(document.documentElement)
                    .getPropertyValue(token).trim();
                if (!raw) return new THREE.Color(fallback);
                try {
                    const c = document.createElement('canvas');
                    c.width = 1; c.height = 1;
                    const ctx = c.getContext('2d', { willReadFrequently: true });
                    if (!ctx) return new THREE.Color(fallback);
                    ctx.fillStyle = fallback;
                    ctx.fillStyle = raw;
                    ctx.fillRect(0, 0, 1, 1);
                    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
                } catch {
                    return new THREE.Color(fallback);
                }
            };

            const ink = readColor('--seed-primary', '#143859');
            const paper = readColor('--bg', '#f6f4f0');
            // Three tones off the token ramp. A drafted solid separates its
            // planes by tone rather than by lighting.
            const capTone = readColor('--surface', '#fdfcfa');
            const sideTone = readColor('--surface-sunken', '#eae7e1');

            const scene = new THREE.Scene();
            scene.fog = new THREE.Fog(paper.getHex(), 9, 15);

            /* -- The logo's three paths, transcribed ----------------------
               The same numbers as the `d` strings above, y negated because
               SVG counts downward and Three counts up. Written out as curve
               calls rather than parsed at runtime, so there is no SVG loader
               in the bundle and no second request for the hero. */
            const upperLobe = new THREE.Shape();
            upperLobe.moveTo(0, 0);
            upperLobe.lineTo(385, 0);
            upperLobe.bezierCurveTo(454.036, 0, 510, -55.9644, 510, -125);
            upperLobe.bezierCurveTo(510, -194.036, 454.036, -250, 385, -250);
            upperLobe.lineTo(0, -250);
            upperLobe.lineTo(0, 0);

            const lowerLobe = new THREE.Shape();
            lowerLobe.moveTo(0, -260);
            lowerLobe.lineTo(385, -260);
            lowerLobe.bezierCurveTo(454.036, -260, 510, -315.964, 510, -385);
            lowerLobe.bezierCurveTo(510, -454.036, 454.036, -510, 385, -510);
            lowerLobe.lineTo(0, -510);
            lowerLobe.lineTo(0, -260);

            const glyphTwo = new THREE.Shape();
            glyphTwo.moveTo(630, -255);
            glyphTwo.bezierCurveTo(630, -114.167, 744.167, 0, 885, 0);
            glyphTwo.bezierCurveTo(1025.83, 0, 1140, -114.167, 1140, -255);
            glyphTwo.bezierCurveTo(1140, -395.833, 1025.83, -510, 885, -510);
            glyphTwo.lineTo(630, -510);
            glyphTwo.lineTo(630, -255);

            const markGeometry = new THREE.ExtrudeGeometry(
                [upperLobe, lowerLobe, glyphTwo],
                {
                    depth: 140,          // mark units; ~0.41 once scaled
                    bevelEnabled: true,
                    bevelThickness: 4,
                    bevelSize: 4,
                    bevelSegments: 1,
                    curveSegments: 24,
                }
            );
            // Authored in mark units, brought into scene units in one step so
            // the cubes and the letterform stay in the same space.
            markGeometry.scale(UNIT, UNIT, UNIT);

            const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
            const disposables: { dispose(): void }[] = [markGeometry, cubeGeometry];

            // Opaque, deliberately. A transparent fill renders in the
            // transparent pass and stops occluding the mark's own back edges,
            // which made it read as a hollow wireframe.
            const offset = { polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 };
            const faceMaterial = new THREE.MeshBasicMaterial({ color: capTone, ...offset });
            const sideMaterial = new THREE.MeshBasicMaterial({ color: sideTone, ...offset });
            const topMaterial = new THREE.MeshBasicMaterial({ color: paper, ...offset });
            const edgeMaterial = new THREE.LineBasicMaterial({ color: ink });
            const softEdgeMaterial = new THREE.LineBasicMaterial({
                color: ink, transparent: true, opacity: 0.55,
            });
            const solidMaterial = new THREE.MeshBasicMaterial({ color: ink, ...offset });
            disposables.push(
                faceMaterial, sideMaterial, topMaterial,
                edgeMaterial, softEdgeMaterial, solidMaterial
            );

            const group = new THREE.Group();

            // ExtrudeGeometry emits group 0 = the caps, group 1 = the walls.
            const mark = new THREE.Mesh(markGeometry, [faceMaterial, sideMaterial]);
            group.add(mark);
            // thresholdAngle keeps the tessellation of the curved caps from
            // showing up as a mesh of construction lines.
            const markEdges = new THREE.EdgesGeometry(markGeometry, 25);
            disposables.push(markEdges);
            group.add(new THREE.LineSegments(markEdges, edgeMaterial));

            const cubeEdges = new THREE.EdgesGeometry(cubeGeometry, 25);
            disposables.push(cubeEdges);

            const totalMilestones = rows.reduce((s, r) => s + r.total, 0);
            const doneMilestones = rows.reduce((s, r) => s + r.completed, 0);

            CUBE_LAYOUT.slice(0, totalMilestones).forEach(([x, y, s], i) => {
                const isDone = i < doneMilestones;
                // Mark space is y-down; the scene is y-up.
                const px = (x + s / 2) * UNIT;
                const py = -(y + s / 2) * UNIT;
                const size = s * UNIT;
                // A little depth variation, derived from the index so it is
                // identical on every render rather than random.
                const pz = ((i % 3) - 1) * 0.16;

                const faces = isDone
                    ? solidMaterial
                    : [sideMaterial, sideMaterial, topMaterial, sideMaterial, faceMaterial, faceMaterial];
                const cube = new THREE.Mesh(cubeGeometry, faces);
                cube.position.set(px, py, pz);
                cube.scale.setScalar(size);
                group.add(cube);

                const outline = new THREE.LineSegments(
                    cubeEdges, isDone ? edgeMaterial : softEdgeMaterial
                );
                outline.position.copy(cube.position);
                outline.scale.setScalar(size);
                group.add(outline);
            });

            // Centre on the composition's own bounds. Centring the mark alone
            // left it sitting right of frame, because the cubes extend a long
            // way to its left.
            const bounds = new THREE.Box3().setFromObject(group);
            const centre = bounds.getCenter(new THREE.Vector3());
            group.children.forEach((child) => child.position.sub(centre));

            // A shallow three-quarter view, as the mark is drawn.
            group.rotation.x = -0.20;
            group.rotation.y = -0.42;
            scene.add(group);

            // Measure what actually has to fit, at the rest rotation, rather
            // than guessing a frustum. The full mark plus its cubes is about
            // 3:1 — a hard-coded number overflowed the frame badly.
            group.updateMatrixWorld(true);
            const fitBox = new THREE.Box3().setFromObject(group);
            const fitSize = fitBox.getSize(new THREE.Vector3());
            // Margin covers the sway, which swings the projected width a
            // little either side of the rest pose.
            const FIT_PAD = 1.18;

            // Orthographic: this is an isometric drawing, not a photograph.
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
            camera.position.set(0, 0, 8);
            camera.lookAt(0, 0, 0);

            mount.appendChild(renderer.domElement);
            renderer.domElement.className = styles.canvas;
            setLive(true);

            const resize = () => {
                const { clientWidth, clientHeight } = mount;
                if (!clientWidth || !clientHeight) return;
                const aspect = clientWidth / clientHeight;
                // Fit BOTH dimensions: whichever of height or width is the
                // binding constraint at this aspect wins.
                const height = Math.max(
                    fitSize.y * FIT_PAD,
                    (fitSize.x * FIT_PAD) / aspect
                );
                camera.left = (-height * aspect) / 2;
                camera.right = (height * aspect) / 2;
                camera.top = height / 2;
                camera.bottom = -height / 2;
                camera.updateProjectionMatrix();
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                renderer.setSize(clientWidth, clientHeight, false);
                renderer.render(scene, camera);
            };
            resize();

            const resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(mount);
            cleanupFns.push(() => resizeObserver.disconnect());

            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            const clock = new THREE.Clock();
            let visible = true;

            const tick = () => {
                frame = requestAnimationFrame(tick);
                const t = clock.getElapsedTime();
                group.rotation.y = -0.42 + Math.sin(t * 0.17) * 0.18;
                group.rotation.x = -0.20 + Math.sin(t * 0.12) * 0.05;
                renderer.render(scene, camera);
            };

            const start = () => {
                if (frame || reduceMotion.matches || !visible) return;
                frame = requestAnimationFrame(tick);
            };
            const stop = () => {
                if (!frame) return;
                cancelAnimationFrame(frame);
                frame = 0;
            };

            const applyMotionPreference = () => {
                if (reduceMotion.matches) {
                    stop();
                    group.rotation.y = -0.42;
                    group.rotation.x = -0.20;
                    renderer.render(scene, camera);
                } else {
                    start();
                }
            };
            reduceMotion.addEventListener('change', applyMotionPreference);
            cleanupFns.push(() => reduceMotion.removeEventListener('change', applyMotionPreference));

            const intersectionObserver = new IntersectionObserver(([entry]) => {
                visible = entry.isIntersecting;
                if (visible) applyMotionPreference();
                else stop();
            }, { threshold: 0.01 });
            intersectionObserver.observe(mount);
            cleanupFns.push(() => intersectionObserver.disconnect());

            const onVisibility = () => {
                if (document.hidden) stop();
                else applyMotionPreference();
            };
            document.addEventListener('visibilitychange', onVisibility);
            cleanupFns.push(() => document.removeEventListener('visibilitychange', onVisibility));

            const onContextLost = (event: Event) => {
                event.preventDefault();
                stop();
                setLive(false);
            };
            renderer.domElement.addEventListener('webglcontextlost', onContextLost);
            cleanupFns.push(() =>
                renderer.domElement.removeEventListener('webglcontextlost', onContextLost));

            applyMotionPreference();

            cleanupFns.push(() => {
                stop();
                disposables.forEach((d) => d.dispose());
                renderer.dispose();
                renderer.domElement.remove();
            });
        });

        return () => {
            disposed = true;
            cleanupFns.forEach((fn) => fn());
            cleanupFns = [];
        };
    }, [rows]);

    return (
        <div className={styles.wrap}>
            <div
                className={styles.stage}
                ref={mountRef}
                aria-hidden={live ? 'true' : undefined}
            >
                {!live && <MarkFallback rows={rows} />}
            </div>
        </div>
    );
}
