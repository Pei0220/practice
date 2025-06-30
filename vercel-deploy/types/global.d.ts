/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="react" />
/// <reference types="react-dom" />

// 全域 JSX 類型聲明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// React 類型補充
declare module 'react' {
  interface HTMLAttributes<T> extends React.AriaAttributes, React.DOMAttributes<T> {
    className?: string;
    key?: React.Key | null | undefined;
  }
}

// Lucide React 模組聲明
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    strokeWidth?: number | string;
  }
  
  export const TrendingUp: FC<IconProps>;
  export const TrendingDown: FC<IconProps>;
  export const Activity: FC<IconProps>;
  export const DollarSign: FC<IconProps>;
  export const Users: FC<IconProps>;
  export const BarChart3: FC<IconProps>;
  export const MessageSquare: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const AlertCircle: FC<IconProps>;
  export const RefreshCw: FC<IconProps>;
  export const ChevronLeft: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const Plus: FC<IconProps>;
  export const Minus: FC<IconProps>;
  export const X: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const Settings: FC<IconProps>;
  export const Menu: FC<IconProps>;
  export const Home: FC<IconProps>;
  export const Info: FC<IconProps>;
  export const Bell: FC<IconProps>;
  export const Calendar: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const Download: FC<IconProps>;
  export const Upload: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const EyeOff: FC<IconProps>;
  export const Loader2: FC<IconProps>;
  export const Sun: FC<IconProps>;
  export const Moon: FC<IconProps>;
  export const Star: FC<IconProps>;
  export const Heart: FC<IconProps>;
  export const ThumbsUp: FC<IconProps>;
  export const ThumbsDown: FC<IconProps>;
  export const Share: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const Edit: FC<IconProps>;
  export const Trash: FC<IconProps>;
  export const Save: FC<IconProps>;
  export const Filter: FC<IconProps>;
  export const Sort: FC<IconProps>;
  export const ArrowUp: FC<IconProps>;
  export const ArrowDown: FC<IconProps>;
  export const ArrowLeft: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const ExternalLink: FC<IconProps>;
  export const Link: FC<IconProps>;
  export const Mail: FC<IconProps>;
  export const Phone: FC<IconProps>;
  export const MapPin: FC<IconProps>;
  export const Globe: FC<IconProps>;
  export const Wifi: FC<IconProps>;
  export const Database: FC<IconProps>;
  export const Server: FC<IconProps>;
  export const Cloud: FC<IconProps>;
  export const File: FC<IconProps>;
  export const Folder: FC<IconProps>;
  export const Image: FC<IconProps>;
  export const Video: FC<IconProps>;
  export const Music: FC<IconProps>;
  export const PieChart: FC<IconProps>;
  export const LineChart: FC<IconProps>;
  export const AreaChart: FC<IconProps>;
}

// Next.js 模組聲明
declare module 'next/link' {
  import { ComponentType, ReactNode } from 'react';
  
  interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onMouseEnter?: () => void;
    onTouchStart?: () => void;
    onClick?: () => void;
    children?: ReactNode;
    className?: string;
  }
  
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/image' {
  import { ComponentType } from 'react';
  
  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    loader?: any;
    quality?: number;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    sizes?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
    className?: string;
  }
  
  const Image: ComponentType<ImageProps>;
  export default Image;
}

// Recharts 模組聲明
declare module 'recharts' {
  import { ComponentType, ReactNode } from 'react';
  
  interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    children?: ReactNode;
    className?: string;
  }
  
  interface LineChartProps {
    data: any[];
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
  }
  
  interface LineProps {
    dataKey: string;
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean | any;
    activeDot?: boolean | any;
    connectNulls?: boolean;
  }
  
  interface XAxisProps {
    dataKey?: string;
    type?: 'number' | 'category';
    axisLine?: boolean;
    tickLine?: boolean;
    tick?: boolean | any;
    interval?: number | 'preserveStart' | 'preserveEnd';
    domain?: any[];
    scale?: string;
  }
  
  interface YAxisProps {
    type?: 'number' | 'category';
    axisLine?: boolean;
    tickLine?: boolean;
    tick?: boolean | any;
    domain?: any[];
    scale?: string;
  }
  
  interface CartesianGridProps {
    strokeDasharray?: string;
    stroke?: string;
    horizontal?: boolean;
    vertical?: boolean;
  }
  
  interface TooltipProps {
    active?: boolean;
    payload?: any[];
    label?: any;
    labelFormatter?: (value: any) => ReactNode;
    formatter?: (value: any, name: string) => [ReactNode, string];
    content?: ComponentType<any>;
    cursor?: boolean | any;
  }
  
  interface LegendProps {
    verticalAlign?: 'top' | 'middle' | 'bottom';
    height?: number;
    content?: ComponentType<any>;
  }
  
  export const ResponsiveContainer: ComponentType<ResponsiveContainerProps>;
  export const LineChart: ComponentType<LineChartProps>;
  export const Line: ComponentType<LineProps>;
  export const XAxis: ComponentType<XAxisProps>;
  export const YAxis: ComponentType<YAxisProps>;
  export const CartesianGrid: ComponentType<CartesianGridProps>;
  export const Tooltip: ComponentType<TooltipProps>;
  export const Legend: ComponentType<LegendProps>;
}

// class-variance-authority 型別聲明
declare module 'class-variance-authority' {
  export type VariantProps<T> = T extends (...args: any[]) => any
    ? {
        [K in keyof Parameters<T>[0]]?: Parameters<T>[0][K] extends Record<string, any>
          ? keyof Parameters<T>[0][K]
          : Parameters<T>[0][K]
      }
    : never;

  export function cva<T extends Record<string, any>>(
    base: string,
    options: {
      variants?: T;
      defaultVariants?: Partial<{ [K in keyof T]: keyof T[K] }>;
    }
  ): (props?: Partial<{ [K in keyof T]: keyof T[K] }>) => string;
}

// NOTE: This file should not be edited manually for Next.js specific types
// see https://nextjs.org/docs/basic-features/typescript for more information.

export {};
