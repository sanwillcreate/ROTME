import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import CampaignGrid from "../components/CampaignGrid";

const ANTON = "font-[family-name:var(--font-anton)]";
const GEIST = "font-[family-name:var(--font-geist-sans)]";

export default function CampaignsPage() {
  return (
    <main className={`${GEIST} min-h-screen bg-[#080808] text-neutral-100`}>
      <Navbar />

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-orange-500">
                <span aria-hidden="true" className="h-px w-8 bg-orange-500" />
                Campaigns
              </p>

              <h1
                className={`${ANTON} mt-5 text-[3.25rem] leading-[0.92] text-white sm:text-7xl lg:text-[5.75rem]`}
              >
                Brands want your{" "}
                <span className="text-orange-500">worst ideas.</span>
              </h1>

              <p className="mt-5 text-lg text-neutral-400">Make them good.</p>
            </div>

            <p className="max-w-xs text-base leading-relaxed text-neutral-400 lg:text-right">
             
             
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <CampaignGrid showEnded />
      </section>

      <SiteFooter />
    </main>
  );
}