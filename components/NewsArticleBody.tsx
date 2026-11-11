import { newsReadingBlocks, listItemText } from '../lib/newsReading';
import type { SiteNewsArticle } from '../lib/newsTypes';
import styles from '../styles/news.module.css';

export function NewsEmphasis({ text }: { text: string }) {
  const parts = text.split(/(€\s*\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s*(?:€|євро|euros?|km\/h|км\/год|km\/godz\.?|mm|мм)|\b(?:PR|ER|VR)\s*\d+(?:\.\d+)?\b|\b20\d{2}\b)/gi);
  return <>{parts.map((part, i) => i % 2 ? <strong key={i}>{part}</strong> : part)}</>;
}
function Text({ text }: { text: string }) {
  const label = text.match(/^([^.!?:]{2,32}[.:])\s+(.+)$/);
  return label ? <><strong className={styles.inlineLabel}>{label[1]}</strong> <NewsEmphasis text={label[2]} /></> : <NewsEmphasis text={text} />;
}
const labels = { uk: 'У цій новині', en: 'In this article', pt: 'Neste artigo', de: 'In diesem Artikel', fr: 'Dans cet article', es: 'En este artículo', pl: 'W tym artykule' };
export default function NewsArticleBody({ item }: { item: SiteNewsArticle }) {
  const blocks = newsReadingBlocks(item.paragraphs);
  const headings = blocks.flatMap((block, index) => block.kind === 'heading' ? [{ text: block.text, index }] : []);
  const lead = blocks.findIndex(block => block.kind === 'paragraph');
  const showContents = headings.length >= 3 && item.paragraphs.join(' ').length > 1400;
  return <div lang={item.contentLanguage} className={styles.body}>
    {showContents && <nav className={styles.contents} aria-label={labels[item.contentLanguage]}>
      <span>{labels[item.contentLanguage]}</span>
      <ul>{headings.map(({ text, index }) => <li key={index}><a href={`#news-section-${index}`}>{text.replace(/:$/, '')}</a></li>)}</ul>
    </nav>}
    {blocks.map((block, index) => {
      if (block.kind === 'heading') return <h2 id={`news-section-${index}`} className={styles.sectionTitle} key={index}>{block.text.replace(/:$/, '')}</h2>;
      if (block.kind === 'list') {
        const List = block.ordered ? 'ol' : 'ul';
        return <List key={index} className={styles.newsList}>{block.items.map((text, i) => <li key={i}><Text text={listItemText(text)} /></li>)}</List>;
      }
      return <p key={index} className={index === lead && block.text.length > 90 ? styles.lead : undefined}><Text text={block.text} /></p>;
    })}
  </div>;
}
