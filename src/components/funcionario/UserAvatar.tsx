import { UserIcon } from '@heroicons/react/24/outline';

export default function UserAvatar() {
	return (
		<div className='w-10 h-10 rounded-[10px] bg-gray-100 flex items-center justify-center hover:bg-gray-200'>
			<UserIcon className='h-5 w-5 text-gray-500' />
		</div>
	);
}
