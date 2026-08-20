import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Componente base para reaproveitar props comuns de todos os ícones
const Icon: React.FC<IconProps & { children: React.ReactNode; fill?: string; stroke?: string }> = ({
  size = 24,
  children,
  fill = 'none',
  stroke = 'currentColor',
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={fill}
    stroke={stroke}
    strokeWidth="1.8"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = (props) => (
  <Icon fill="currentColor" stroke="none" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.89.53 3.66 1.44 5.17L2 22l4.97-1.4A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18c-1.6 0-3.1-.44-4.4-1.2l-.31-.18-3.06.86.85-2.98-.2-.32A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8Zm4.36-5.86c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4-.14 0-.3-.02-.46-.02s-.42.06-.64.3c-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
  </Icon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <Icon strokeWidth={2} {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);

export const FlaskIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M9 3h6M10 3v5.5L5.5 16A3 3 0 0 0 8 21h8a3 3 0 0 0 2.5-5L14 8.5V3" />
  </Icon>
);

export const LayersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2 3 7l9 5 9-5-9-5ZM3 17l9 5 9-5M3 12l9 5 9-5" />
  </Icon>
);

export const PocketIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="7" y="2" width="10" height="20" rx="3" />
    <path d="M9 6h6" />
  </Icon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.35-4.35" />
  </Icon>
);

export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2 3 7v6c0 5 3.8 8.7 9 9 5.2-.3 9-4 9-9V7l-9-5Z" />
  </Icon>
);

export const MapPinIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 21c4-4 8-7.58 8-12A8 8 0 0 0 4 9c0 4.42 4 8 8 12Z" />
    <circle cx="12" cy="9" r="3" />
  </Icon>
);

// Mapa de ícones por nome — fácil de adicionar novos ícones sem tocar no código dos componentes
export const ICON_MAP: Record<string, React.FC<IconProps>> = {
  flask: FlaskIcon,
  layers: LayersIcon,
  pocket: PocketIcon,
  sparkles: SparklesIcon,
  shield: ShieldCheckIcon,
  award: MapPinIcon,
};
