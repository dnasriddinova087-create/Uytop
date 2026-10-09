import React from 'react';

interface UyTopHouseIconProps {
  size?: number | string;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UyTopHouseIcon: React.FC<UyTopHouseIconProps> = ({
  size = 28,
  color = '#10B981',
  className = '',
  style = {},
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-label="UyTop Logo Icon"
    >
      {/* 
        Exact house silhouette matching the reference icon:
        - Gable roof with rounded apex and soft eave tips
        - Left: rounded-square window
        - Right: tall doorway opening flush with ground, rounded top
        - Uses fillRule="evenodd" for true transparent cutouts
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={`
          M 47.2 14.5
          C 48.8 13.2 51.2 13.2 52.8 14.5
          L 86.8 43.8
          C 88.9 45.6 88.0 49.0 85.2 49.0
          L 77.5 49.0
          L 77.5 79.5
          C 77.5 83.6 74.1 87.0 70.0 87.0
          L 67.5 87.0
          L 67.5 56.5
          C 67.5 53.5 65.0 51.0 62.0 51.0
          L 55.5 51.0
          C 52.5 51.0 50.0 53.5 50.0 56.5
          L 50.0 87.0
          L 30.0 87.0
          C 25.9 87.0 22.5 83.6 22.5 79.5
          L 22.5 49.0
          L 14.8 49.0
          C 12.0 49.0 11.1 45.6 13.2 43.8
          L 47.2 14.5 Z

          M 29.5 54.0
          C 28.1 54.0 27.0 55.1 27.0 56.5
          L 27.0 68.5
          C 27.0 69.9 28.1 71.0 29.5 71.0
          L 41.5 71.0
          C 42.9 71.0 44.0 69.9 44.0 68.5
          L 44.0 56.5
          C 44.0 55.1 42.9 54.0 41.5 54.0
          L 29.5 54.0 Z
        `}
        fill={color}
      />
    </svg>
  );
};

export default UyTopHouseIcon;
