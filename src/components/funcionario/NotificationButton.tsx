import { BellIcon } from '@heroicons/react/24/outline';

export default function NotificationButton() {
  return (
    <button className="w-10 h-10 rounded-[10px] hover:bg-gray-200 flex items-center justify-center relative">
      <BellIcon className="h-5 w-5 text-gray-500" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
    </button>
  );
}
