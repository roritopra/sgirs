import { mockCardsRespel } from '@/mock/cardsRespel';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/cards-respel`;

export async function getCardsRespel(useMock = true) {
  if (useMock) {
    return mockCardsRespel;
  }

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al traer datos de RAEE/RESPEL/RCD');
  return res.json();
}
