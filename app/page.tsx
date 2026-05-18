import { SiteLogo } from '@/components/site-logo';
import { StationPicker } from '@/components/station-picker';
import { HomeTagline } from '@/components/home-tagline';

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <SiteLogo size="large" />
        <HomeTagline />
      </div>
      <StationPicker />
    </main>
  );
}
