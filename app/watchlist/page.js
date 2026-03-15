import { permanentRedirect } from 'next/navigation';

export default function WatchlistCompatPage() {
  permanentRedirect('/tools?tool=watchlist');
}
