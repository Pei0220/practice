// Next.js 模組聲明
declare module 'next/link' {
  import { FC, ReactNode } from 'react';
  
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
  
  const Link: FC<LinkProps>;
  export default Link;
}

declare module 'next/image' {
  import { FC } from 'react';
  
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
  
  const Image: FC<ImageProps>;
  export default Image;
}
