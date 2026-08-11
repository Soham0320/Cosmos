import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', light = false, ...props }) => {
  return (
    <motion.div
      className={`${light ? 'glass-panel-light' : 'glass-panel'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassPanel;
