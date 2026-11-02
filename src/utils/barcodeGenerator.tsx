import React from 'react';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
  lightBackground?: boolean;
}

/**
 * High-fidelity SVG Code 128 / EAN style vector barcode generator
 */
export const SvgBarcode: React.FC<BarcodeProps> = ({
  value,
  height = 56,
  showText = true,
  className = '',
  lightBackground = true,
}) => {
  // Deterministic pseudo-random bar pattern generated from value hash
  const generateBars = (code: string) => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }

    const pattern: number[] = [2, 1, 1, 2]; // Start guard
    let currentHash = Math.abs(hash);

    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const b1 = (charCode % 3) + 1;
      const b2 = ((charCode * 3 + i) % 4) + 1;
      const b3 = ((currentHash + i * 7) % 3) + 1;
      const b4 = ((currentHash >> 2) % 2) + 1;
      pattern.push(b1, b2, b3, b4);
      currentHash = (currentHash * 1103515245 + 12345) & 0x7fffffff;
    }

    pattern.push(2, 1, 2, 3); // Stop guard
    return pattern;
  };

  const barPattern = React.useMemo(() => generateBars(value), [value]);
  const totalUnits = barPattern.reduce((acc, w) => acc + w, 0);

  let currentX = 10;
  const unitWidth = 2.4;
  const svgWidth = (totalUnits + 10) * unitWidth;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        className="w-full h-auto max-h-16 select-none"
        preserveAspectRatio="none"
      >
        {lightBackground && (
          <rect x="0" y="0" width={svgWidth} height={height} fill="#ffffff" rx="4" />
        )}
        {barPattern.map((width, idx) => {
          const isBar = idx % 2 === 0;
          const x = currentX;
          currentX += width * unitWidth;

          if (!isBar) return null;
          return (
            <rect
              key={idx}
              x={x}
              y={lightBackground ? 4 : 0}
              width={width * unitWidth * 0.9}
              height={height - (lightBackground ? 8 : 0)}
              fill="currentColor"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="font-mono text-xs tracking-widest mt-1 opacity-90 tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
};

interface QrProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Crisp SVG simulated QR Code with real alignment and finder patterns
 */
export const SvgQrCode: React.FC<QrProps> = ({ value, size = 120, className = '' }) => {
  // Generate deterministic 15x15 matrix with 3 standard corner finder patterns
  const matrix = React.useMemo(() => {
    const grid = Array.from({ length: 15 }, () => Array(15).fill(false));

    // Fill corner finder patterns (7x7 corners)
    const addFinder = (startX: number, startY: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    };

    addFinder(0, 0);       // Top-left
    addFinder(8, 0);       // Top-right
    addFinder(0, 8);       // Bottom-left

    // Fill timing patterns
    for (let i = 0; i < 15; i++) {
      if (i % 2 === 0) {
        if (!grid[6][i]) grid[6][i] = true;
        if (!grid[i][6]) grid[i][6] = true;
      }
    }

    // Deterministic payload encoding
    let seed = 0;
    for (let i = 0; i < value.length; i++) {
      seed = (seed * 31 + value.charCodeAt(i)) & 0xffffffff;
    }

    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        // Skip corner finder zones
        if ((r < 7 && c < 7) || (r < 7 && c >= 8) || (r >= 8 && c < 7)) continue;
        if (r === 6 || c === 6) continue;

        seed = (seed * 1664525 + 1013904223) & 0xffffffff;
        grid[r][c] = (seed & 1) === 1;
      }
    }

    return grid;
  }, [value]);

  const cellSize = size / 15;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-2 rounded-lg shadow-sm ${className}`}
    >
      {matrix.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize * 0.96}
              height={cellSize * 0.96}
              fill="#0f172a"
              rx={cellSize * 0.15}
            />
          ) : null
        )
      )}
    </svg>
  );
};
