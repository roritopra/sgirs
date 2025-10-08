// src/components/funcionario/CardIcon.tsx

import React from 'react';

interface CardIconProps {
  icon: React.ElementType;
  iconColor?: string;
  bgColor?: string;
}

export default function CardIcon({
  icon: Icon,
  iconColor = '#71717A',
  bgColor = '#E4E4E7',
}: CardIconProps) {
  return (
    <div
      className="w-10 h-10 rounded-[10px] flex items-center justify-center"
      style={{ backgroundColor: bgColor }}
    >
      <Icon className="h-5 w-5" style={{ color: iconColor }} />
    </div>
  );
}
