import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useSpring(0, { damping: 25, stiffness: 300 });
  const cursorY = useSpring(0, { damping: 25, stiffness: 300 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const rotation = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      rotation.set(rotation.get() + 2);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, rotation]);

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-primary/50 pointer-events-none z-[9999] d-none d-lg-block mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          rotate: rotation,
        }}
        animate={{
          scale: isHovering ? 1.5 : isClicking ? 0.8 : 1,
          borderColor: isHovering ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.5)',
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"
          animate={{
            scale: isClicking ? 2 : 1,
          }}
          transition={{ duration: 0.1 }}
        />
      </motion.div>

      {/* Trailing cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full bg-primary/20 pointer-events-none z-[9998] d-none d-lg-block blur-sm"
        style={{
          x: useSpring(cursorX, { damping: 40, stiffness: 150 }),
          y: useSpring(cursorY, { damping: 40, stiffness: 150 }),
        }}
        animate={{
          scale: isHovering ? 2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full border border-primary/30 pointer-events-none z-[9997] d-none d-lg-block"
        style={{
          x: useSpring(cursorX, { damping: 35, stiffness: 200 }),
          y: useSpring(cursorY, { damping: 35, stiffness: 200 }),
        }}
        animate={{
          scale: isHovering ? 1.3 : 1,
          opacity: isHovering ? 0.8 : 0.3,
        }}
        transition={{ duration: 0.4 }}
      />
    </>
  );
};

export default CustomCursor;
