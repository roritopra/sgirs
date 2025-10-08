import { mockCardsRSO } from '@/mock/cardsRSO';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cards-rso`;

export async function getCardsRSO(useMock = true) {
  if (useMock) {
    return mockCardsRSO;
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al traer datos de RSO');
  return res.json();
}
