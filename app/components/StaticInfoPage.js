import SiteChrome from './SiteChrome';

export default function StaticInfoPage({ title, intro, sections = [] }) {
  return (
    <SiteChrome>
      <main className="main-content">
        <section className="zenith-static-page" aria-labelledby="zenith-static-page-title">
          <header className="zenith-static-page-header">
            <h1 id="zenith-static-page-title">{title}</h1>
            {intro ? <p>{intro}</p> : null}
          </header>

          <div className="zenith-static-page-grid">
            {sections.map((section) => (
              <article className="zenith-static-page-card" key={section.heading}>
                <h2>{section.heading}</h2>
                <div className="zenith-static-page-content">{section.body}</div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
