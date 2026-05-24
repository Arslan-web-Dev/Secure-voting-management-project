import type { Variants } from 'framer-motion';

// 1. Fade Up Animation
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// 2. Fade Down Animation
export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// 3. Fade Left Animation
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// 4. Fade Right Animation
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// 5. Scale Up Animation
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

// 6. Scale Down Animation
export const scaleDown: Variants = {
  hidden: { opacity: 0, scale: 1.2 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

// 7. Rotate In Animation
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  visible: { 
    opacity: 1, 
    rotate: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

// 8. Slide Up Animation
export const slideUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// 9. Slide Down Animation
export const slideDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// 10. Slide Left Animation
export const slideLeft: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// 11. Slide Right Animation
export const slideRight: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// 12. Bounce In Animation
export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.8, 
      ease: [0.68, -0.55, 0.265, 1.55],
      times: [0, 0.5, 1]
    }
  }
};

// 13. Flip In Animation
export const flipIn: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: { 
    opacity: 1, 
    rotateY: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};

// 14. Zoom In Animation
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0, rotate: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotate: 360,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

// 15. Elastic Pop Animation
export const elasticPop: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// 16. Wave Animation (for staggered items)
export const wave: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  })
};

// 17. Circular Rotate Animation
export const circularRotate: Variants = {
  hidden: { opacity: 0, rotate: 0 },
  visible: { 
    opacity: 1, 
    rotate: 360,
    transition: { duration: 1.5, ease: "linear", repeat: Infinity }
  }
};

// 18. Float Up Animation
export const floatUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
  }
};

// 19. Float Down Animation
export const floatDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }
  }
};

// 20. Pulse Glow Animation
export const pulseGlow: Variants = {
  hidden: { opacity: 0.5, scale: 1 },
  visible: { 
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: { duration: 2, ease: "easeInOut", repeat: Infinity }
  }
};

// 21. Shake Animation
export const shake: Variants = {
  hidden: { x: 0 },
  visible: { 
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5, ease: "easeInOut" }
  }
};

// 22. Swing Animation
export const swing: Variants = {
  hidden: { rotate: 0 },
  visible: { 
    rotate: [0, 15, -15, 15, -15, 0],
    transition: { duration: 0.8, ease: "easeInOut" }
  }
};

// 23. Wobble Animation
export const wobble: Variants = {
  hidden: { rotate: 0 },
  visible: { 
    rotate: [0, -5, 5, -5, 5, -5, 5, 0],
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

// Container variants for staggered animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

// Hover variants
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const hoverLift = {
  y: -8,
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};

export const hoverGlow = {
  boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)",
  transition: { duration: 0.3 }
};
