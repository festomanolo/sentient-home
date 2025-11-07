import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageLayoutProps {
  children: ReactNode;
  background?: ReactNode;
}

export const PageLayout = ({ children, background }: PageLayoutProps) => {
  return (
    <motion.div 
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {background && (
        <div className="absolute inset-0 z-0">
          {background}
        </div>
      )}
      <motion.div 
        className="relative z-10 container mx-auto mobile-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}

// [NOX-DEV-92]: ongoing module refinement
