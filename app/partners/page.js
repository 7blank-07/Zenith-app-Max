import SiteChrome from '../components/SiteChrome';
import PartnersIndexPage from '../components/partners/PartnersIndexPage';
import { listPublicPartners } from '../../src/lib/server/partners/repository.mjs';

export const dynamic = 'force-dynamic';
// export const revalidate = 3600; // Removed to prevent stale cache after admin updates

export async function generateMetadata({ searchParams = {} }) {
  const search = searchParams?.search ? ` matching "${searchParams.search}"` : '';
  return {
    title: `Official Partners${search} | ZenithFCM`,
    description: 'Creators, streamers, communities, and ecosystem partners supporting ZenithFCM.',
    openGraph: {
      title: 'Official ZenithFCM Partners',
      description: 'Meet the creators and communities that power the ZenithFCM ecosystem.',
      images: ['/assets/images/zenith_logo_main.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Official ZenithFCM Partners',
      description: 'Meet the creators and communities that power the ZenithFCM ecosystem.',
    }
  };
}

export default async function PartnersPage({ searchParams = {} }) {
  const search = searchParams?.search || '';
  const platform = searchParams?.platform || '';

  const partners = await listPublicPartners({
    search,
    platform
  });

  return (
    <SiteChrome activeView="partners">
      <main className="main-content">
        <PartnersIndexPage 
          partners={partners}
          activePlatform={platform}
          searchValue={search}
        />
      </main>
    </SiteChrome>
  );
}
