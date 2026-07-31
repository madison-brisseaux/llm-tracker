import { Model, formatDate } from '@/lib/models';
import { buildSummary, buildFaq, latestByProvider } from '@/lib/insights';

interface Props {
  models: Model[];
  lastUpdated: string | null;
}

// Server-rendered prose + FAQ. This ships as crawlable HTML so search and
// answer engines can read (and cite) the tracker's key facts without running JS.
export default function TrackerAbout({ models, lastUpdated }: Props) {
  const summary = buildSummary(models);
  const faq = buildFaq(models, lastUpdated);
  const latest = latestByProvider(models);

  return (
    <section
      className="border-t border-[#DFD8D8] bg-white"
      style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}
      aria-labelledby="about-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-3xl">
          <h2 id="about-heading" className="text-xl sm:text-2xl font-semibold text-[#000000] tracking-tight">
            About the AI Model Release Tracker
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#595959] leading-relaxed">
            {summary}
          </p>
          <p className="mt-3 text-sm sm:text-base text-[#595959] leading-relaxed">
            The AI Model Release Tracker is maintained by{' '}
            <a href="https://www.evertune.ai" className="text-[#F7594E] hover:underline">Evertune</a>, the
            platform for measuring brand discovery in AI search. It records major model releases and AI-search
            feature updates from OpenAI, Anthropic, Google, Meta, and DeepSeek, with the release date, a plain-English
            summary, and a link to the official announcement for each entry. Data is compiled from official provider
            announcements, engineering blogs, and press coverage, reviewed before publishing, and updated daily.
          </p>
        </div>

        {latest.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base sm:text-lg font-semibold text-[#000000]">
              Latest model from each provider
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map(({ provider, model }) => (
                <li key={provider} className="text-sm text-[#595959] leading-relaxed">
                  <span className="font-semibold text-[#000000]">{provider}:</span>{' '}
                  {model.link ? (
                    <a href={model.link} className="text-[#F7594E] hover:underline" rel="noopener noreferrer">
                      {model.model}
                    </a>
                  ) : (
                    <span>{model.model}</span>
                  )}{' '}
                  <span className="text-[#7F7F7F] tabular-nums">({formatDate(model.releaseDate)})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10">
          <h3 id="faq-heading" className="text-base sm:text-lg font-semibold text-[#000000]">
            Frequently asked questions
          </h3>
          <dl className="mt-4 space-y-5 max-w-3xl">
            {faq.map((item, i) => (
              <div key={i}>
                <dt className="text-sm sm:text-base font-semibold text-[#000000]">{item.question}</dt>
                <dd className="mt-1 text-sm text-[#595959] leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#7F7F7F]">
          <a href="/ai-model-tracker.json" className="hover:text-[#F7594E]">Download JSON</a>
          <span aria-hidden="true">·</span>
          <a href="/ai-model-tracker.csv" className="hover:text-[#F7594E]">Download CSV</a>
          <span aria-hidden="true">·</span>
          <a href="/feed.xml" className="hover:text-[#F7594E]">RSS feed</a>
          <span aria-hidden="true">·</span>
          <span>
            Have feedback? Email{' '}
            <a href="mailto:madison@evertune.ai" className="text-[#F7594E] hover:underline">madison@evertune.ai</a>
          </span>
        </div>
        <p className="mt-4 text-xs text-[#7F7F7F]">
          Data licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="hover:text-[#F7594E]" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          . Attribution: Evertune AI Model Release Tracker.
        </p>
      </div>
    </section>
  );
}
