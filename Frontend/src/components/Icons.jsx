const Svg = ({ size = 16, children }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

export const Check = () => <Svg><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>
export const Checks = () => <Svg><path d="M1.5 12.5L6 17l9.5-9.5M10 15.5l1.5 1.5L21 7.5" /></Svg>
export const Clock = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
export const Alert = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 17h.01" /></Svg>
export const MuteIcon = () => <Svg><path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" /></Svg>
export const Pin = () => <Svg><path d="M12 17v5M8 3h8l-1.5 7L18 14H6l3.5-4z" /></Svg>
export const Send = () => <Svg size={22}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></Svg>
export const Back = () => <Svg size={24}><path d="M15 5l-7 7 7 7" /></Svg>
export const Close = () => <Svg size={24}><path d="M18 6L6 18M6 6l12 12" /></Svg>
