"use client";

import React from "react";

export function TrainLoader({ size = 120, label }: { size?: number; label?: string }) {
  const height = Math.round(size * 0.5);
  return (
    <div role="status" aria-live="polite" style={{ display: "inline-block", textAlign: "center" }}>
      <div style={{ width: size, height, overflow: "hidden", margin: "0 auto" }}>
        <svg
          viewBox="0 0 120 60"
          width={size}
          height={height}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="g" x1="0" x2="1">
              <stop offset="0%" stopColor="#e6eef8" />
              <stop offset="100%" stopColor="#cfe6fb" />
            </linearGradient>
          </defs>

          <rect x="0" y="36" width="120" height="6" fill="#e6e6e6" />
          <g className="train" transform="translate(-30,0)">
            <rect x="8" y="10" rx="4" ry="4" width="72" height="30" fill="url(#g)" stroke="#bcd7f5" />
            <rect x="16" y="16" width="14" height="10" rx="1" fill="#fff" opacity="0.9" />
            <rect x="34" y="16" width="14" height="10" rx="1" fill="#fff" opacity="0.9" />
            <rect x="52" y="16" width="18" height="10" rx="1" fill="#fff" opacity="0.9" />
            <rect x="2" y="28" width="88" height="4" fill="#a8cbe9" />
            <circle className="wheel" cx="20" cy="44" r="6" fill="#3b82f6" />
            <circle className="wheel" cx="64" cy="44" r="6" fill="#3b82f6" />
          </g>
        </svg>
      </div>

      <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>{label ?? "Loading..."}</div>

      <style jsx>{`
        .train {
          animation: train-move 1.6s linear infinite;
        }

        .wheel {
          transform-origin: 20px 44px;
          animation: wheel-rot 0.6s linear infinite;
        }

        .wheel:nth-of-type(2) {
          transform-origin: 64px 44px;
          animation-duration: 0.68s;
        }

        @keyframes train-move {
          0% { transform: translateX(-30px); }
          50% { transform: translateX(18px); }
          100% { transform: translateX(120px); }
        }

        @keyframes wheel-rot {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
