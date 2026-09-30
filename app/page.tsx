import { PageShell } from '@/components/site-shell';
import { HeroSection } from '@/components/HeroSection';
import { OrganizeSection } from '@/components/OrganizeSection';
import { FindSection } from '@/components/FindSection';
import { WaitlistSection } from '@/components/WaitlistSection';

export default function Home() {
  return (
    <PageShell>
      <HeroSection />
      <OrganizeSection />
      <FindSection />
      <WaitlistSection />
    </PageShell>
  );
}
