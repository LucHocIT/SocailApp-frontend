// Utility functions to help with Framer Motion animation issues

/**
 * Converts CSS variables to RGB values for safe animation
 * Use this to fix "You are trying to animate color from var(--color) to rgb(x, y, z)" errors
 * 
 * @param {string} cssVar - The CSS variable name (e.g., '--primary-color')
 * @returns {Object} An object with style property using the CSS variable
 */
export const cssVarToStyle = (cssVar) => {
  return {
    color: `var(${cssVar})`
  };
};

/**
 * Creates a style object for box-shadow with CSS variables
 * Use this to fix box-shadow animation issues with CSS variables
 * 
 * @param {string} cssVar - The CSS variable name (e.g., '--primary-color-rgb')
 * @param {string} intensity - Shadow intensity (e.g., '0.5')
 * @param {string} size - Shadow size (e.g., '15px')
 * @returns {Object} An object with style property for box-shadow
 */
export const boxShadowStyle = (cssVar, intensity = '0.5', size = '15px') => {
  return {
    boxShadow: `0 0 ${size} rgba(var(${cssVar}), ${intensity})`
  };
};

/**
 * Creates a style object for background color with CSS variables
 * Use this to fix background-color animation issues with CSS variables
 * 
 * @param {string} cssVar - The CSS variable name (e.g., '--primary-color-rgb')
 * @param {string} opacity - Background opacity (e.g., '0.1')
 * @returns {Object} An object with style property for backgroundColor
 */
export const bgColorStyle = (cssVar, opacity = '0.1') => {
  return {
    backgroundColor: `rgba(var(${cssVar}), ${opacity})`
  };
};

/**
 * Common animation variants for form field animation
 */
export const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 }
  },
  exit: { opacity: 0, y: -20 }
};

/**
 * Common animation variants for form animation
 */
export const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { duration: 0.2 }
  }
};

/**
 * Creates combined style and animation props for button interactions
 * 
 * @param {Object} options - Options for button animation
 * @param {string} options.hoverScale - Scale factor on hover (default: 1.05)
 * @param {string} options.tapScale - Scale factor on tap/click (default: 0.95)
 * @param {Object} options.additionalStyle - Additional style properties to include
 * @returns {Object} Combined style and animation props object
 */
export const buttonAnimationProps = ({ 
  hoverScale = 1.05, 
  tapScale = 0.95,
  additionalStyle = {}
} = {}) => {
  return {
    whileHover: { scale: hoverScale },
    whileTap: { scale: tapScale },
    style: additionalStyle
  };
};

/**
 * Creates combined style and animation props for icon interactions
 * 
 * @param {Object} options - Options for icon animation 
 * @param {string} options.activeColor - CSS variable for active color (default: '--primary-color')
 * @param {string} options.inactiveColor - CSS variable for inactive color (default: '--text-muted')
 * @param {boolean} options.isActive - Whether the icon is active (default: false)
 * @param {number} options.activeScale - Scale factor when active (default: 1.1)
 * @returns {Object} Combined animation and style props
 */
export const iconAnimationProps = ({
  activeColor = '--primary-color',
  inactiveColor = '--text-muted',
  isActive = false,
  activeScale = 1.1
} = {}) => {
  return {
    animate: {
      scale: isActive ? activeScale : 1
    },
    style: {
      color: isActive ? `var(${activeColor})` : `var(${inactiveColor})`
    }
  };
};

/**
 * Animation variants for reaction button hover effects
 */
export const reactionHoverVariants = {
  initial: { scale: 0, opacity: 0 },
  hover: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    }
  },
  exit: { 
    scale: 0, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Animation variants for individual reaction icons
 */
export const reactionIconVariants = {
  initial: { y: 20, opacity: 0 },
  hover: i => ({ 
    y: 0, 
    opacity: 1,
    transition: { 
      delay: i * 0.05,
      type: "spring", 
      stiffness: 400,
      damping: 17
    }
  }),
  tap: { scale: 1.2 }
};

/**
 * Creates animation props for reaction buttons
 * 
 * @param {Object} options - Options for reaction animation
 * @param {string} options.type - Type of reaction ('like', 'love', 'haha', 'wow', 'sad', 'angry')
 * @param {boolean} options.isActive - Whether the reaction is active
 * @returns {Object} Combined animation and style props for reactions
 */
export const reactionAnimationProps = ({
  type = 'like',
  isActive = false
} = {}) => {
  // Colors for different reaction types
  const reactionColors = {
    like: '--blue-color',
    love: '--red-color',
    haha: '--yellow-color',
    wow: '--yellow-color',
    sad: '--yellow-color',
    angry: '--orange-color'
  };

  // Scales for different reaction types when active
  const reactionScales = {
    like: 1.1,
    love: 1.2,
    haha: 1.1,
    wow: 1.15,
    sad: 1.1,
    angry: 1.2
  };

  return {
    animate: {
      scale: isActive ? reactionScales[type] || 1.1 : 1
    },
    whileHover: { scale: isActive ? reactionScales[type] * 1.05 : 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 },
    style: {
      color: isActive ? `var(${reactionColors[type] || '--primary-color'})` : `var(--text-muted)`
    }
  };
};

/**
 * Animation variants for reaction selection popup
 */
export const reactionPopupVariants = {
  hidden: { y: 10, opacity: 0, pointerEvents: 'none' },
  visible: { 
    y: 0, 
    opacity: 1,
    pointerEvents: 'auto',
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25,
      staggerChildren: 0.05
    }
  }
};

/**
 * Animation for reaction counter
 */
export const reactionCounterVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};
