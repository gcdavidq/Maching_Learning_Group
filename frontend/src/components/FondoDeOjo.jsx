// Ilustración de un fondo de ojo: disco óptico, arcadas vasculares, mácula y microlesiones.
const VASOS = [
  "M292 196 C 250 150, 200 110, 120 96",
  "M292 196 C 262 128, 250 84, 214 44",
  "M292 196 C 250 240, 196 290, 116 306",
  "M292 196 C 268 268, 252 318, 222 356",
  "M292 196 C 322 160, 342 128, 352 84",
  "M292 196 C 326 232, 344 270, 350 318",
  "M232 138 C 206 140, 186 150, 160 170",
  "M226 262 C 200 258, 182 248, 158 232",
];

const LESIONES = [
  [150, 210, 5],
  [182, 246, 3.5],
  [128, 176, 3],
  [206, 300, 4],
  [246, 112, 3],
  [170, 132, 3.5],
];

export default function FondoDeOjo() {
  return (
    <svg className="fondo-ojo" viewBox="0 0 400 400" role="img" aria-label="Ilustración de una retina analizada">
      <defs>
        <radialGradient id="retina" cx="46%" cy="48%" r="60%">
          <stop offset="0" stopColor="#f0a35e" />
          <stop offset="0.55" stopColor="#d9542b" />
          <stop offset="1" stopColor="#6d1d0c" />
        </radialGradient>
        <radialGradient id="disco" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#f6c667" />
        </radialGradient>
        <radialGradient id="foco" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fde047" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fde047" stopOpacity="0" />
        </radialGradient>
        <clipPath id="recorte">
          <circle cx="200" cy="200" r="184" />
        </clipPath>
      </defs>

      <circle cx="200" cy="200" r="196" fill="#0e1b2a" />
      <circle cx="200" cy="200" r="184" fill="url(#retina)" />

      <g clipPath="url(#recorte)">
        <circle cx="168" cy="204" r="34" fill="#7a2410" opacity="0.45" />
        <g fill="none" stroke="#7a1f10" strokeLinecap="round" opacity="0.85">
          {VASOS.map((trazo, i) => (
            <path key={trazo} d={trazo} strokeWidth={i < 6 ? 4.5 : 2.5} />
          ))}
        </g>
        <circle cx="292" cy="196" r="30" fill="url(#disco)" />

        <g className="focos">
          <circle cx="160" cy="224" r="78" fill="url(#foco)" />
          <circle cx="212" cy="122" r="46" fill="url(#foco)" />
        </g>
        {LESIONES.map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="#4a0d05" />
        ))}
        <rect className="barrido" x="16" y="0" width="368" height="3" fill="#fff8e1" opacity="0.7" />
      </g>

      <circle cx="200" cy="200" r="184" fill="none" stroke="#f7f5f0" strokeOpacity="0.25" />
    </svg>
  );
}
