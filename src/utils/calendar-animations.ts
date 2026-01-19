// export const calendarVariants = {
//   initial: (direction: number) => ({
//     x: direction * 30,
//     opacity: 0,
//   }),
//   animate: {
//     x: 0,
//     opacity: 1,
//     transition: {
//       x: { 
//         type: "spring" as const, 
//         stiffness: 300, 
//         damping: 35,
//         mass: 0.8
//       },
//       opacity: { 
//         duration: 0.3,
//         ease: [0.25, 0.1, 0.25, 1] as const
//       },
//     },
//   },
//   exit: (direction: number) => ({
//     x: direction * -30,
//     opacity: 0,
//     transition: {
//       x: { 
//         type: "spring" as const, 
//         stiffness: 300, 
//         damping: 35,
//         mass: 0.8
//       },
//       opacity: { 
//         duration: 0.3,
//         ease: [0.25, 0.1, 0.25, 1] as const
//       },
//     },
//   }),
// };

// // Header animation variants
// export const headerVariants = {
//   initial: (direction: number) => ({
//     y: direction * 10,
//     opacity: 0,
//   }),
//   animate: {
//     y: 0,
//     opacity: 1,
//     transition: {
//       y: { 
//         type: "spring" as const, 
//         stiffness: 350, 
//         damping: 35,
//         mass: 0.8
//       },
//       opacity: { 
//         duration: 0.3,
//         ease: [0.25, 0.1, 0.25, 1] as const
//       },
//     },
//   },
//   exit: (direction: number) => ({
//     y: direction * -10,
//     opacity: 0,
//     transition: {
//       y: { 
//         type: "spring" as const, 
//         stiffness: 350, 
//         damping: 35,
//         mass: 0.8
//       },
//       opacity: { 
//         duration: 0.3,
//         ease: [0.25, 0.1, 0.25, 1] as const
//       },
//     },
//   }),
// };

export const calendarVariants = {
  initial: (direction: number) => ({
    x: direction * 30,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      x: { 
        type: "spring" as const, 
        stiffness: 350, 
        damping: 35,
        mass: 0.7
      },
      opacity: { 
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1] as const
      },
    },
  },
  exit: (direction: number) => ({
    x: direction * -30,
    opacity: 0,
    transition: {
      x: { 
        type: "spring" as const, 
        stiffness: 350, 
        damping: 35,
        mass: 0.7
      },
      opacity: { 
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1] as const
      },
    },
  }),
};

// Header animation variants
export const headerVariants = {
  initial: (direction: number) => ({
    y: direction * 10,
    opacity: 0,
  }),
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      y: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 35,
        mass: 0.7
      },
      opacity: { 
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1] as const
      },
    },
  },
  exit: (direction: number) => ({
    y: direction * -10,
    opacity: 0,
    transition: {
      y: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 35,
        mass: 0.7
      },
      opacity: { 
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1] as const
      },
    },
  }),
};