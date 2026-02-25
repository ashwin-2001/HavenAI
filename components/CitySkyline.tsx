"use client"

import { motion } from "framer-motion"

export function CitySkyline() {
  return (
    <div className="city-skyline-wrapper" aria-hidden="true">
      <svg
        viewBox="0 0 900 420"
        xmlns="http://www.w3.org/2000/svg"
        className="city-skyline-svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Sky gradient */}
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fce4ec" />
            <stop offset="40%" stopColor="#f8bbd0" />
            <stop offset="100%" stopColor="#f48fb1" />
          </linearGradient>

          {/* Building gradients */}
          <linearGradient id="bldg-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e91e8c" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#c2185b" stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="bldg-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ad1457" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#880e4f" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="bldg-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#880e4f" />
            <stop offset="100%" stopColor="#560027" />
          </linearGradient>
          <linearGradient id="bldg-accent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c2185b" />
            <stop offset="100%" stopColor="#880e4f" />
          </linearGradient>

          {/* Window glows */}
          <radialGradient id="win-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fce4ec" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f48fb1" stopOpacity="0.2" />
          </radialGradient>

          {/* Ground gradient */}
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#560027" />
            <stop offset="100%" stopColor="#3d0018" />
          </linearGradient>

          {/* Fog / atmosphere */}
          <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fce4ec" stopOpacity="0" />
            <stop offset="100%" stopColor="#fce4ec" stopOpacity="0.18" />
          </linearGradient>

          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#880e4f" floodOpacity="0.4" />
          </filter>
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="900" height="420" fill="url(#sky)" />

        {/* Distant moon / sun orb */}
        <circle cx="720" cy="80" r="42" fill="#fce4ec" opacity="0.55" filter="url(#soft-blur)" />
        <circle cx="720" cy="80" r="28" fill="#fff" opacity="0.8" />

        {/* ── Far background buildings (silhouette layer) ── */}

        {/* Far left block */}
        <rect x="-10" y="170" width="90" height="260" fill="url(#bldg-far)" rx="2" />
        <rect x="2" y="160" width="68" height="20" fill="url(#bldg-far)" rx="1" />
        {/* cornice details */}
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={2 + i * 17} y="157" width="14" height="6" fill="#f48fb1" opacity="0.4" rx="1" />
        ))}

        {/* Tall far-left spire building */}
        <rect x="80" y="100" width="75" height="330" fill="url(#bldg-far)" rx="2" />
        <rect x="90" y="90" width="55" height="18" fill="url(#bldg-far)" rx="1" />
        <rect x="103" y="78" width="30" height="16" fill="url(#bldg-far)" rx="1" />
        <rect x="113" y="66" width="10" height="18" fill="url(#bldg-far)" rx="1" />

        {/* Far center tall */}
        <rect x="230" y="80" width="80" height="350" fill="url(#bldg-far)" rx="2" />
        <rect x="238" y="68" width="64" height="18" fill="url(#bldg-far)" rx="1" />
        <rect x="252" y="54" width="36" height="20" fill="url(#bldg-far)" rx="1" />

        {/* Far right cluster */}
        <rect x="750" y="130" width="70" height="300" fill="url(#bldg-far)" rx="2" />
        <rect x="820" y="150" width="90" height="280" fill="url(#bldg-far)" rx="2" />
        <rect x="760" y="118" width="50" height="18" fill="url(#bldg-far)" rx="1" />

        {/* ── Mid-layer buildings ── */}

        {/* Mid building A — left */}
        <rect x="30" y="195" width="120" height="235" fill="url(#bldg-mid)" rx="2" />
        {/* Ornate cornice */}
        <rect x="28" y="185" width="124" height="16" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={32 + i * 20} y="178" width="14" height="12" fill="#ad1457" rx="1" />
        ))}
        {/* Arched windows mid-A */}
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => {
            const wx = 46 + col * 36
            const wy = 210 + row * 55
            return (
              <g key={`maw-${row}-${col}`}>
                <rect x={wx} y={wy + 8} width="22" height="28" fill="url(#win-glow)" rx="1" />
                <path d={`M${wx} ${wy + 8} Q${wx + 11} ${wy} ${wx + 22} ${wy + 8}`} fill="url(#win-glow)" />
                <path d={`M${wx} ${wy + 8} Q${wx + 11} ${wy} ${wx + 22} ${wy + 8}`} fill="none" stroke="#f48fb1" strokeWidth="1" opacity="0.6" />
              </g>
            )
          })
        )}

        {/* Mid building B — center left */}
        <rect x="195" y="150" width="145" height="280" fill="url(#bldg-mid)" rx="2" />
        <rect x="193" y="138" width="149" height="18" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <rect key={i} x={197 + i * 21} y="128" width="14" height="14" fill="#ad1457" rx="1" />
        ))}
        {/* Arched windows mid-B */}
        {[0, 1, 2, 3].map(row =>
          [0, 1, 2, 3].map(col => {
            const wx = 208 + col * 32
            const wy = 162 + row * 56
            return (
              <g key={`mbw-${row}-${col}`}>
                <rect x={wx} y={wy + 9} width="20" height="30" fill="url(#win-glow)" rx="1" />
                <path d={`M${wx} ${wy + 9} Q${wx + 10} ${wy} ${wx + 20} ${wy + 9}`} fill="url(#win-glow)" />
                <rect x={wx + 2} y={wy + 14} width="7" height="12" fill="#fce4ec" opacity="0.4" rx="1" />
                <rect x={wx + 11} y={wy + 14} width="7" height="12" fill="#fce4ec" opacity="0.4" rx="1" />
              </g>
            )
          })
        )}

        {/* Mid building C — center right */}
        <rect x="540" y="168" width="130" height="262" fill="url(#bldg-mid)" rx="2" />
        <rect x="538" y="155" width="134" height="18" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={542 + i * 22} y="146" width="16" height="13" fill="#ad1457" rx="1" />
        ))}
        {[0, 1, 2, 3].map(row =>
          [0, 1, 2].map(col => {
            const wx = 553 + col * 38
            const wy = 178 + row * 55
            return (
              <g key={`mcw-${row}-${col}`}>
                <rect x={wx} y={wy + 9} width="22" height="30" fill="url(#win-glow)" rx="1" />
                <path d={`M${wx} ${wy + 9} Q${wx + 11} ${wy} ${wx + 22} ${wy + 9}`} fill="url(#win-glow)" />
              </g>
            )
          })
        )}

        {/* Mid building D — right */}
        <rect x="710" y="182" width="115" height="248" fill="url(#bldg-mid)" rx="2" />
        <rect x="708" y="170" width="119" height="17" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={712 + i * 23} y="160" width="16" height="14" fill="#ad1457" rx="1" />
        ))}
        {[0, 1, 2, 3].map(row =>
          [0, 1, 2].map(col => {
            const wx = 720 + col * 34
            const wy = 194 + row * 54
            return (
              <g key={`mdw-${row}-${col}`}>
                <rect x={wx} y={wy + 8} width="20" height="28" fill="url(#win-glow)" rx="1" />
                <path d={`M${wx} ${wy + 8} Q${wx + 10} ${wy} ${wx + 20} ${wy + 8}`} fill="url(#win-glow)" />
              </g>
            )
          })
        )}

        {/* ── Foreground / front buildings ── */}

        {/* Front building LEFT */}
        <rect x="-5" y="240" width="155" height="200" fill="url(#bldg-front)" rx="2" filter="url(#shadow)" />
        {/* Grand cornice */}
        <rect x="-7" y="228" width="159" height="18" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <g key={i}>
            <rect x={-3 + i * 22} y="216" width="15" height="16" fill="#ad1457" rx="2" />
            <rect x={-1 + i * 22} y="212" width="11" height="6" fill="#c2185b" rx="1" />
          </g>
        ))}
        {/* Column pilasters */}
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={8 + i * 37} y="246" width="6" height="194" fill="#ad1457" opacity="0.5" />
        ))}
        {/* Windows front left */}
        {[0, 1, 2].map(row =>
          [0, 1, 2].map(col => {
            const wx = 14 + col * 44
            const wy = 256 + row * 56
            return (
              <g key={`flw-${row}-${col}`}>
                <rect x={wx} y={wy + 10} width="28" height="36" fill="url(#win-glow)" rx="2" />
                <path d={`M${wx} ${wy + 10} Q${wx + 14} ${wy} ${wx + 28} ${wy + 10}`} fill="url(#win-glow)" />
                <line x1={wx + 14} y1={wy + 10} x2={wx + 14} y2={wy + 46} stroke="#f8bbd0" strokeWidth="0.8" opacity="0.5" />
                <line x1={wx} y1={wy + 28} x2={wx + 28} y2={wy + 28} stroke="#f8bbd0" strokeWidth="0.8" opacity="0.5" />
              </g>
            )
          })
        )}
        {/* Fire escape front left */}
        <rect x="110" y="250" width="28" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="110" y="306" width="28" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="110" y="362" width="28" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="110" y="250" width="2" height="114" fill="#f48fb1" opacity="0.6" />
        <rect x="136" y="250" width="2" height="114" fill="#f48fb1" opacity="0.6" />
        {/* diagonal ladder */}
        <line x1="112" y1="252" x2="112" y2="364" stroke="#f48fb1" strokeWidth="1" opacity="0.4" strokeDasharray="4 4" />

        {/* Front building CENTER — widest, most ornate */}
        <rect x="340" y="210" width="220" height="230" fill="url(#bldg-front)" rx="2" filter="url(#shadow)" />
        {/* Triple cornice */}
        <rect x="336" y="196" width="228" height="20" fill="#c2185b" rx="2" />
        <rect x="340" y="188" width="220" height="12" fill="#ad1457" rx="1" />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
          <g key={i}>
            <rect x={342 + i * 22} y="178" width="14" height="14" fill="#c2185b" rx="2" />
            <rect x={344 + i * 22} y="174" width="10" height="6" fill="#e91e8c" rx="1" opacity="0.7" />
          </g>
        ))}
        {/* Pilasters center */}
        {[0, 1, 2, 3, 4].map(i => (
          <rect key={i} x={350 + i * 42} y="218" width="7" height="222" fill="#ad1457" opacity="0.45" />
        ))}
        {/* Windows center building */}
        {[0, 1, 2].map(row =>
          [0, 1, 2, 3].map(col => {
            const wx = 358 + col * 48
            const wy = 226 + row * 58
            return (
              <g key={`fcw-${row}-${col}`}>
                <rect x={wx} y={wy + 12} width="30" height="38" fill="url(#win-glow)" rx="2" />
                <path d={`M${wx} ${wy + 12} Q${wx + 15} ${wy} ${wx + 30} ${wy + 12}`} fill="url(#win-glow)" />
                <line x1={wx + 15} y1={wy + 12} x2={wx + 15} y2={wy + 50} stroke="#f8bbd0" strokeWidth="0.8" opacity="0.5" />
                <line x1={wx} y1={wy + 30} x2={wx + 30} y2={wy + 30} stroke="#f8bbd0" strokeWidth="0.8" opacity="0.5" />
              </g>
            )
          })
        )}
        {/* Center building fire escapes */}
        <rect x="465" y="218" width="36" height="2" fill="#f48fb1" opacity="0.85" />
        <rect x="465" y="276" width="36" height="2" fill="#f48fb1" opacity="0.85" />
        <rect x="465" y="334" width="36" height="2" fill="#f48fb1" opacity="0.85" />
        <rect x="465" y="218" width="2" height="118" fill="#f48fb1" opacity="0.65" />
        <rect x="499" y="218" width="2" height="118" fill="#f48fb1" opacity="0.65" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <line key={i} x1="467" y1={228 + i * 16} x2="499" y2={228 + i * 16} stroke="#f48fb1" strokeWidth="0.8" opacity="0.4" />
        ))}

        {/* Front building RIGHT */}
        <rect x="750" y="228" width="160" height="212" fill="url(#bldg-front)" rx="2" filter="url(#shadow)" />
        <rect x="747" y="216" width="166" height="18" fill="#c2185b" rx="2" />
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <g key={i}>
            <rect x={751 + i * 23} y="206" width="15" height="14" fill="#ad1457" rx="2" />
            <rect x={753 + i * 23} y="202" width="11" height="6" fill="#c2185b" rx="1" />
          </g>
        ))}
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={758 + i * 36} y="234" width="6" height="206" fill="#ad1457" opacity="0.45" />
        ))}
        {[0, 1, 2].map(row =>
          [0, 1, 2, 3].map(col => {
            const wx = 760 + col * 34
            const wy = 242 + row * 56
            return (
              <g key={`frw-${row}-${col}`}>
                <rect x={wx} y={wy + 9} width="20" height="30" fill="url(#win-glow)" rx="2" />
                <path d={`M${wx} ${wy + 9} Q${wx + 10} ${wy} ${wx + 20} ${wy + 9}`} fill="url(#win-glow)" />
                <line x1={wx + 10} y1={wy + 9} x2={wx + 10} y2={wy + 39} stroke="#f8bbd0" strokeWidth="0.8" opacity="0.5" />
              </g>
            )
          })
        )}
        {/* Fire escape right */}
        <rect x="856" y="234" width="30" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="856" y="290" width="30" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="856" y="346" width="30" height="2" fill="#f48fb1" opacity="0.8" />
        <rect x="856" y="234" width="2" height="114" fill="#f48fb1" opacity="0.6" />
        <rect x="884" y="234" width="2" height="114" fill="#f48fb1" opacity="0.6" />

        {/* Street / sidewalk */}
        <rect x="0" y="400" width="900" height="30" fill="url(#ground)" />
        {/* Sidewalk lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <rect key={i} x={i * 110} y="402" width="100" height="1" fill="#c2185b" opacity="0.3" />
        ))}
        {/* Street lamp posts */}
        {[120, 440, 760].map(x => (
          <g key={x}>
            <rect x={x} y="340" width="3" height="65" fill="#c2185b" opacity="0.8" />
            <rect x={x - 12} y="338" width="27" height="5" fill="#c2185b" opacity="0.8" rx="1" />
            <ellipse cx={x - 8} cy="339" rx="5" ry="4" fill="#fce4ec" opacity="0.9" />
            <ellipse cx={x - 8} cy="339" rx="3" ry="2.5" fill="#fff" opacity="0.8" />
          </g>
        ))}

        {/* Atmospheric fog overlay */}
        <rect x="0" y="0" width="900" height="420" fill="url(#fog)" />

        {/* Subtle floating particles / lights */}
        {[
          { cx: 180, cy: 120 }, { cx: 490, cy: 95 }, { cx: 620, cy: 140 },
          { cx: 300, cy: 60 }, { cx: 800, cy: 100 }, { cx: 65, cy: 170 }
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r="2.5" fill="#fce4ec" opacity="0.5" />
        ))}
      </svg>
    </div>
  )
}
