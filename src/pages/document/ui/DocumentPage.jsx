import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '@/widgets/page-layout/PageLayout';
import '../DocumentPage.scss';

const pad = (n) => String(n).padStart(2, '0');

function Block({ block }) {
  if (block.type === 'p') return <p>{block.text}</p>;
  if (block.type === 'ul') return <ul>{block.items.map((it) => <li key={it}>{it}</li>)}</ul>;
  return (
    <table>
      <thead><tr>{block.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{block.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

/** Страница-документ: лента, заголовок, липкое содержание слева, белый лист с разделами справа. */
export function DocumentPage({ doc, title }) {
  const [active, setActive] = useState(0);

  // Подсвечиваем в содержании раздел, который сейчас на экране
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('.doc__sec'));
    if (!sections.length) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(sections.indexOf(visible.target));
    }, { rootMargin: '-120px 0px -60% 0px', threshold: 0 });
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [doc]);

  return (
    <PageLayout title={title} noindex compactFooter={false}>
      <section className="section section--cream doc-hero">
        <img className="doc-hero__goat reveal" src="/img/goat-scroll.webp" alt="" width={330} height={690} />
        <img className="doc-hero__branch" src="/img/branch.webp" alt="" width={180} height={193} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Link className="doc-hero__back reveal" to="/">←&nbsp; На главную</Link>
          <div><span className="ribbon reveal" style={{ '--d': '40ms' }}>Документ</span></div>
          <h1 className="reveal" style={{ '--d': '80ms' }}>{doc.title}</h1>
          <p className="lead reveal" style={{ '--d': '120ms' }}>{doc.lead}</p>
        </div>
      </section>

      <section className="section section--cream doc">
        <div className="container doc__grid">
          <aside className="doc__toc reveal" aria-label="Содержание">
            <h2>Содержание</h2><hr />
            <ol>
              {doc.toc.map((t, i) => (
                <li key={t} className={i === active ? 'is-active' : undefined}><span className="num">{pad(i + 1)}</span><a href={`#sec-${i + 1}`}>{t}</a></li>
              ))}
            </ol>
          </aside>
          <div className="doc__sheet reveal" style={{ '--d': '80ms' }}>
            <img className="doc__clip" src="/img/paperclip.webp" alt="" width={46} height={70} />
            {doc.preamble && <div className="doc__pre reveal"><p>{doc.preamble}</p></div>}
            {doc.sections.map((s, i) => (
              <section key={s.title} className="doc__sec reveal" id={`sec-${i + 1}`}>
                <h2><span className="num">{pad(i + 1)}</span><span>{s.title}</span></h2>
                <div className="doc__body">{s.blocks.map((b, j) => <Block key={j} block={b} />)}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
