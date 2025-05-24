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
