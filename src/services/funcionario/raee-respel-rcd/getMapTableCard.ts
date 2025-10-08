import mockEstablecimientos from '@/mock/establecimientos.json';

const API_URL = process.env.NEXT_PUBLIC_API_MAPCARD;

export async function getMapCard() {
  if (!API_URL) {
    return mockEstablecimientos;
  }

  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error fetching map data');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ Error en API, usando mock:', error);
    return mockEstablecimientos;
  }
}
