import { permanentRedirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function TopTenIndex({ searchParams }) {
  const pos = searchParams?.pos ? String(searchParams.pos).toLowerCase() : 'st';
  permanentRedirect(`/top-10/${pos}`);
}
