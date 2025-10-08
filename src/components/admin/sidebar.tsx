'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChartBarIcon, UsersIcon, DocumentIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import SidebarIcon from './sidebarIcon';

const icons = [
	{ icon: ChartBarIcon, label: 'Dashboard', path: '/admin' },
	{ icon: UsersIcon, label: 'Gestion usuarios', path: '/admin/gestion-usuarios' },
	{ icon: DocumentIcon, label: 'Gestion encuestas', path: '/admin/encuestas' },
];

export default function Sidebar() {
	const router = useRouter();
	const [isExpanded, setIsExpanded] = useState(false);
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [activeItem, setActiveItem] = useState(0);

	useEffect(() => {
		const currentPath = window.location.pathname;
		const activeIndex = icons.findIndex((icon) => icon.path === currentPath);
		if (activeIndex !== -1) {
			setActiveItem(activeIndex);
		}
	}, []);

	return (
		<aside
			className={`fixed top-0 left-0 h-screen bg-white shadow-xl z-60 overflow-hidden transition-all duration-300 ease-in-out ${
				isExpanded ? 'w-64' : 'w-16 hover:w-64'
			}`}
			onMouseEnter={() => setIsExpanded(true)}
			onMouseLeave={() => {
				setIsExpanded(false);
				setHoveredIndex(null);
			}}
		>
			<div className='h-full flex flex-col py-6 space-y-3 px-2'>
				{icons.map(({ icon: Icon, label, path }, index) => (
					<button
						key={index}
						className={`flex items-center pl-3 pr-2 py-2 rounded-lg transition-all duration-200 ${
							hoveredIndex === index || activeItem === index ? 'bg-gray-100 scale-105' : ''
						}`}
						onMouseEnter={() => setHoveredIndex(index)}
						onMouseLeave={() => setHoveredIndex(null)}
						onClick={() => {
							setActiveItem(index);
							router.push(path);
						}}
					>
						<SidebarIcon
							icon={Icon}
							active={activeItem === index || hoveredIndex === index}
							className={`transition-transform ${hoveredIndex === index ? 'scale-110' : ''}`}
						/>
						{isExpanded && (
							<span
								className={`ml-3 text-sm font-medium ${
									activeItem === index ? 'text-gray-900' : 'text-gray-600'
								} whitespace-nowrap transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
							>
								{label}
							</span>
						)}
					</button>
				))}
			</div>
		</aside>
	);
}
