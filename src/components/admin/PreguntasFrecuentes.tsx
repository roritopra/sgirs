'use client';

import React from 'react';

type QuestionItem = {
	question: string;
	count: number;
};

type TopQuestionsProps = {
	title: string;
	subtitle?: string;
	data: QuestionItem[];
};

export default function TopQuestions({ title, subtitle, data }: TopQuestionsProps) {
	return (
		<div className='bg-white rounded-xl shadow-sm p-6 w-full'>
			{/* Header */}
			<div className='mb-4 flex justify-between'>
				<div>
					<h2 className='text-base font-semibold text-gray-900'>{title}</h2>
					{subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
				</div>
			</div>

			{/* Lista de preguntas */}
			<div className='space-y-3'>
				{data.map((item, idx) => (
					<div
						key={idx}
						className='flex items-center gap-4 rounded-lg p-4'
						style={{ backgroundColor: '#F3F9EC' }} // verde claro
					>
						{/* Número */}
						<div
							className='w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm text-white'
							style={{ backgroundColor: '#5F8B1D' }} // verde principal
						>
							{idx + 1}
						</div>

						{/* Pregunta y número */}
						<div className='flex flex-col'>
							<span className='text-gray-900 font-medium'>{item.question}</span>
							<span
								className='font-semibold text-lg'
								style={{ color: '#4B6C16' }} // verde oscuro para texto
							>
								{item.count}{' '}
								<span className='text-sm font-normal' style={{ color: '#4B6C16' }}>
									preguntas
								</span>
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
