const Svg = ({ size = 16, sw = 2.5, children }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
export const Mail = () => <Svg size={20} sw={2}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></Svg>
export const Lock = () => <Svg size={20} sw={2}><rect x="5" y="11" width="14" height="9" rx="3" /><path d="M8 11V8a4 4 0 018 0v3" /></Svg>
export const User = () => <Svg size={20} sw={2}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5" /></Svg>
export const At = () => <Svg size={20} sw={2}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-4 8" /></Svg>
export const Search = () => <Svg size={20} sw={2}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>
export const Info = () => <Svg size={22} sw={2}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Svg>
export const Sparkle = () => <Svg size={24} sw={2}><path d="M12 3l2.2 6.3L20.5 12l-6.3 2.7L12 21l-2.2-6.3L3.5 12l6.3-2.7z" /></Svg>
export const Paperclip = () => <Svg size={22} sw={2}><path d="M21 11.5l-8.6 8.6a5 5 0 01-7.1-7.1l8.9-8.9a3.3 3.3 0 014.7 4.7l-8.9 8.9a1.7 1.7 0 01-2.4-2.4l8.2-8.2" /></Svg>
export const FileIcon = () => <Svg size={22} sw={2}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8zM14 3v5h5" /></Svg>
export const Trash = () => <Svg size={22} sw={2}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" /></Svg>
export const XSmall = () => <Svg size={14} sw={2.5}><path d="M18 6L6 18M6 6l12 12" /></Svg>
