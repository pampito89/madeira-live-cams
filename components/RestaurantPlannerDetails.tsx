import Link from 'next/link';
import { getRestaurant } from '../data/restaurants';

export default function RestaurantPlannerDetails({ slug, locale, preview = false }: { slug?: string; locale: 'en' | 'uk'; preview?: boolean }) {
  const restaurant = getRestaurant(slug);
  if (!restaurant) return null;
  return <div className={preview ? 'mt-3 rounded-xl border border-slate-200 bg-panel p-4' : 'mt-2'}>
    {preview && <><p className="font-semibold text-navy">🍽️ {restaurant.name} · ★ {restaurant.rating} <span className="font-normal">({restaurant.reviewCount.toLocaleString(locale)})</span></p><p className="mt-2 text-sm leading-6 text-slate-600">{restaurant.summary[locale]}</p></>}
    {restaurant.temporarilyClosed && <p className="mt-2 text-sm font-medium text-amber-800">{locale === 'uk' ? 'Тимчасово закрито за даними Google Maps — уточніть перед поїздкою.' : 'Temporarily closed on Google Maps — check before visiting.'}</p>}
    <Link href={`/explore/${restaurant.slug}`} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline underline-offset-4">{locale === 'uk' ? 'Картка ресторану' : 'Restaurant details'} ↗</Link>
  </div>;
}
