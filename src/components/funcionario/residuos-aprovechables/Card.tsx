type CardProps = {
	title: string;
	value: number;
	icon: React.ElementType;
	iconColor: string;
	bgColor: string;
	className?: string;
};

export default function Card({ title, value, icon: Icon, iconColor, bgColor, className }: CardProps) {
	return (
		<div
			className={`bg-white rounded-2xl p-6 shadow-sm w-full min-h-[170px] flex justify-between items-start gap-4 ${className}`}
		>
			<div className='flex flex-col justify-between mt-4'>
				<div className='text-base font-small text-[#202224]'>{title}</div>
				<div className='text-3xl font-bold text-[#202224] mt-2'>{value.toLocaleString()}</div>
			</div>

			<div className='w-10 h-10 flex items-center justify-center rounded-md' style={{ backgroundColor: bgColor }}>
				<Icon className='w-6 h-6' style={{ color: iconColor }} />
			</div>
		</div>
	);
}
