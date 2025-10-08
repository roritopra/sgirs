interface SidebarIconProps {
  icon: React.ElementType;
  active?: boolean;
  className?: string;
}

export default function SidebarIcon({ icon: Icon, active = false, className = '' }: SidebarIconProps) {
  return (
    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${className}`}>
      <Icon className={`h-5 w-5 ${active ? 'text-[#71717A]' : 'text-gray-400'}`} />
    </div>
  );
}
