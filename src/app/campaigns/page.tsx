import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import CampaignGrid from "../components/CampaignGrid";

export default function CampaignsPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <Navbar />

      <section className="border-b border-white/[0.06] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500/80">
            Campaigns
          </span>

          <h1 className="mt-3 text-3xl font-semibold leading-[1.05] tracking-tight text-neutral-50 sm:text-4xl md:text-[2.75rem]">
            Brands want your worst ideas.
          </h1>

          <p className="mt-4 text-base text-neutral-400 sm:text-lg">
            Make them good.
          </p>

          <div className="mt-12">
            <CampaignGrid showEnded />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}