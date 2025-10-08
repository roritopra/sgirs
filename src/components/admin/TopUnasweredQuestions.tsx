"use client";
import React from 'react';
import { Pagination } from '@heroui/react';

interface QuestionData {
	number: string;
	date: string;
	question: string;
}

interface TopUnansweredQuestionsProps {
	title: string;
	subtitle?: string;
	data: QuestionData[];
}

function TopUnansweredQuestions({ title, subtitle, data }: TopUnansweredQuestionsProps) {
    const pageSize = 10;
    const [page, setPage] = React.useState(1); // 1-based para HeroUI Pagination
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    React.useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
        if (page < 1) {
            setPage(1);
        }
    }, [totalPages, page]);

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const pageData = data.slice(start, end);

    return (
        <div className='bg-white shadow rounded-2xl p-6'>
            {/* Header */}
            <div className='flex justify-between items-center mb-4'>
                <div>
                    <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
                    {subtitle && <p className='text-sm text-gray-500'>{subtitle}</p>}
                </div>
            </div>

            {/* Table */}
            <div className='overflow-x-auto'>
                <table className='w-full border-collapse rounded-lg overflow-hidden'>
                    <thead>
                        <tr className='bg-gray-100 text-gray-700 text-sm'>
                            <th className='px-4 py-2 text-left font-medium'>Número</th>
                            <th className='px-4 py-2 text-left font-medium'>Fecha recepción pregunta</th>
                            <th className='px-4 py-2 text-left font-medium'>Pregunta</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.map((item, idx) => (
                            <tr key={idx} className='border-t text-sm text-gray-700 hover:bg-gray-50'>
                                <td className='px-4 py-2'>{item.number}</td>
                                <td className='px-4 py-2'>{item.date}</td>
                                <td className='px-4 py-2'>{item.question}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-center mt-4'>
                <Pagination
                    total={totalPages}
                    page={page}
                    onChange={setPage}
                    showControls
                    size='sm'
                    color='primary'
                    aria-label='Paginación de preguntas sin responder'
                />
            </div>
        </div>
    );
}

export default TopUnansweredQuestions;
