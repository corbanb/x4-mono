/**
 * Mock for next/image — renders a plain img tag.
 */
import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
}

const Image = ({ fill, priority, ...props }: ImageProps) => <img {...props} />;

export default Image;
