import { mockCardsACU } from '@/mock/cardsACU';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cards-acu`;

export async function getCardsACU(useMock = true) {
  if (useMock) {
    return mockCardsACU;
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al traer datos de ACU');
  return res.json();
}
