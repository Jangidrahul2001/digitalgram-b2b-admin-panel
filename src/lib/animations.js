export const butteryDropdown = {
  initial: { opacity: 0, y: -20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.9 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
};

export const getButteryOrigin = (origin = "top right") => ({
  style: { transformOrigin: origin }
});

export const modernDropdown = {
  initial: { opacity: 0, y: 4, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

export const menuItemFade = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

export const checkmarkAnimation = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.2, ease: "easeOut" }
};
