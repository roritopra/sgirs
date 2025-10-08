'use client';

import LocationIndicator from './LocationIndicator';
import NotificationButton from './NotificationButton';
import UserAvatar from './UserAvatar';

export default function Topbar() {
	return (
		<header className='fixed top-0 left-16 right-0 z-50 flex justify-between items-center px-6 py-4 bg-white shadow-sm'>
			<LocationIndicator />
			<div className='flex items-center gap-4'>
				<NotificationButton />
				<UserAvatar />
			</div>
		</header>
	);
}
