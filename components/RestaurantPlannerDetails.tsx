import { useText } from '../lib/i18n/TranslationProvider';
import Link from 'next/link';
import { getRestaurant } from '../data/restaurants';
import { getLocationBySlug } from '../data/plannerLocations';
export default function RestaurantPlannerDetails({ slug, locale, preview = false }: {
    slug?: string;
    locale: 'en' | 'uk';
    preview?: boolean;
}) {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const location = slug ? getLocationBySlug(slug) : undefined;
    if (!location)
        return null;
    const restaurant = getRestaurant(slug);
    const uk = locale === 'uk';
    const label = restaurant ? (uk ? 'Картка ресторану' : 'Restaurant details') : location.tags.includes('Supermarkets') ? (uk ? 'Картка супермаркету' : 'Supermarket details') : (uk ? 'Картка локації' : 'Location details');
    return <div className={preview ? 'mt-3 rounded-xl border border-slate-200 bg-panel p-4' : 'mt-2'}>
    {localize(preview && <><p className="font-semibold text-navy">{localize(location.name[locale])}{localize(restaurant && <>{localize(" \u00B7 \u2605 ")}{localize(restaurant.rating)} <span className="font-normal">{localize("(")}{localize(restaurant.reviewCount.toLocaleString(translationLanguage))}{localize(")")}</span></>)}</p><p className="mt-2 text-sm leading-6 text-slate-600">{localize(location.summary[locale])}</p></>)}
    {localize(restaurant?.temporarilyClosed && <p className="mt-2 text-sm font-medium text-amber-800">{localize(uk ? 'Тимчасово закрито за даними Google Maps — уточніть перед поїздкою.' : 'Temporarily closed on Google Maps — check before visiting.')}</p>)}
    <Link href={'/explore/' + location.slug} className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-ocean underline underline-offset-4">{localize(label)}{localize(" \u2197")}</Link>
  </div>;
}
