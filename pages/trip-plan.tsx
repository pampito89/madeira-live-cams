import { formatDuration } from '../lib/i18n/duration';
import { withStaticTranslations, withServerTranslations, translatedStaticProps } from '../lib/i18n/pageTranslations';
import { useText } from '../lib/i18n/TranslationProvider';
import TripPlanHero from "../components/TripPlanHero";
import { activityCoordinates } from "../data/activities";
import { calculatePlannerRoute, resolvePlannerLocation, validRoutePoint } from "../lib/calculatePlannerRoute";
import PlannerRouteFinish from "../components/PlannerRouteFinish";
import { useRef } from "react";
import { restaurantCoordinates } from "../data/restaurants";
import { restaurantStopTitle } from "../lib/restaurantMeals";
import { usePlannerDraft } from "../lib/usePlannerDraft";
import RestaurantPlannerDetails from "../components/RestaurantPlannerDetails";
import CustomDayPoint, { useCustomDayPoint } from '../components/CustomDayPoint';
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getLocalizedLocation, locations } from "../data/plannerLocations";
import { useMessages } from '../lib/i18n/useMessages';
import { stays } from '../data/stays';
import { plannerStopDuration } from "../lib/plannerStopDuration";
type MealType = 'breakfast' | 'lunch' | 'dinner';
type RecommendationKey = 'weather' | 'beach' | 'levada' | 'sunrise' | 'food' | 'fanal' | 'lastDay' | 'trekking';
const emptyRecommendations: Record<RecommendationKey, boolean> = { weather: false, beach: false, levada: false, sunrise: false, food: false, fanal: false, lastDay: false, trekking: false };
type PlanStop = {
    id: string;
    type: 'location' | 'custom' | 'villa';
    slug?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    sourceUrl?: string;
    arrivalTime: string;
    durationMinutes: number;
    isSunrise?: boolean;
    isSunset?: boolean;
    showRouteInstructions?: boolean;
    boatDirection?: 'officeToCafe' | 'cafeToOffice';
    isWhaleTour?: boolean;
    isLastDay?: boolean;
    mealType?: MealType;
    hasCristovaoBar?: boolean;
    hasCristovaoRestaurant?: boolean;
};
type CustomRoutePoint = {
    name: string;
    latitude: number;
    longitude: number;
};
type WeatherSummary = {
    averageTemperature: number;
    rainProbability: number;
    picoTemperature: number | null;
    picoWindSpeed: number | null;
    picoWindGusts: number | null;
    waterTemperature: number | null;
    fanal?: {
        temperature: number;
        wind: number;
        gusts: number;
        humidity: number | null;
        rain: number | null;
        elevation: number | null;
        forecastTime: string;
        fetchedAt: string;
    };
};
type RouteUsage = {
    limit: number;
    used: number;
    remaining: number;
    month: string;
};
const villas = stays;
const airportStartPoint = { slug: 'madeira-international-airport', latitude: 32.6919, longitude: -16.7745 };
const customStartPoint = 'custom-start-point';
const customRoutePoint = 'custom-route-point';
const madeiraFoodRecommendations = `Що скуштувати на Мадейрі 🍽️

🥩 Espetada — великі соковиті шматки яловичини, обсмажені на лавровій шпазі. Класично подають із bolo do caco та milho frito

🍞 Bolo do caco — традиційний м’який плаский хліб із солодкою картоплею. Найкраще замовляти теплим, з часниковим маслом

🌽 Milho frito — обсмажені кубики кукурудзяної каші з додаванням капусти. Один із найтиповіших гарнірів Мадейри, особливо до espetada, але також добре пасує до риби

Риба та морепродукти 🐟🦐

🐟 Filete de espada com banana — філе чорної шаблезубої риби в паніровці зі смаженим бананом. Найвідоміша рибна страва Мадейри

🍋 Espada com maracujá — філе чорної шаблезубої риби з кисло-солодким соусом із маракуї. Більш тропічна варіація класичної espada

🐟 Bife de atum — стейк із тунця, зазвичай маринований та обсмажений. Один із найкращих варіантів для любителів риби

🐙 Polvo à lagareiro — восьминіг, запечений або обсмажений з оливковою олією, часником і картоплею

🐙 Polvo à vinagrete — холодна закуска з восьминога в заправці з оливкової олії, оцту, цибулі та зелені. Добре брати як закуску до вина або пончі

🦪 Lapas grelhadas — місцеві морські молюски, запечені на грилі у мушлях. Подаються гарячими, з часником, маслом, петрушкою та лимоном

🐟 Atum à escabeche — тунець у пряному маринаді з оцтом, цибулею та спеціями

🦑 Lulas grelhadas — кальмари на грилі з часником, оливковою олією та лимоном

🦐 Camarão ao alho — креветки з часником, вершковим маслом або оливковою олією. До них обов’язково варто взяти bolo do caco, щоб зібрати ароматний соус

🦐 Camarão grelhado — великі креветки, обсмажені на грилі з лимоном і часниковим соусом. Особливо добре замовляти у ресторанах біля океану

🍚 Arroz de marisco — рис із морепродуктами: зазвичай креветки, мідії, кальмари, молюски та риба в ароматному томатному бульйоні. Часто порція розрахована на 2 людей

🍝 Tagliatelle com camarão — тальятеле з креветками у вершковому, томатному або часниково-оливковому соусі. Хороша альтернатива, якщо хочеться морепродуктів, але без риби

🍝 Massa de marisco — паста з міксом морепродуктів: креветками, кальмарами, мідіями та іноді восьминогом. Зазвичай варто брати на двох

🍲 Cataplana de peixe e marisco — велика страва для двох або компанії, яку готують у спеціальній закритій мідній посудині. Усередині — мікс свіжої риби, креветок, кальмарів, мідій, молюсків, томатів, цибулі та зелені

🐟🦐 Prato misto de peixe e marisco — велика тарілка-мікс із риби та морепродуктів на грилі: риба дня, кальмари, креветки, восьминіг, мідії або лапас. Найкраще брати на 2–4 людей і ділитися

🐟 Peixe fresco do dia — свіжа риба дня, зазвичай на грилі. Запитайте в офіціанта, що саме зловили сьогодні; часто пропонують дорадо, окуня, морського ляща або іншу сезонну рибу

Солодке та фрукти 🍰🍌

🍰 Bolo de mel — традиційний мадейрський пряний пиріг із тростинним медом, спеціями та сухофруктами. Добре смакує з кавою, лікером або мадерським вином

🍪 Broas de mel — невеликі пряні медові печива, хрумкі зовні та м’які всередині

🧁 Queijada da Madeira — невелика солодка випічка з м’якого сиру, яєць і цукру. Ідеально до еспресо

🥧 Pastel de nata — класична португальська листкова тарталетка з ніжним заварним кремом. Найкраще смакує ще теплою, з еспресо та дрібкою кориці

🍍 Maracujá — маракуя: пробуйте в десертах, соусах, морозиві або напоях

🍌 Banana da Madeira — маленькі ароматні мадейрські банани. Найавтентичніше поєднання — разом із філе espada

Що випити 🍹

🍹 Poncha — головний місцевий коктейль на основі тростинного алкоголю, меду й лимона. Спробуйте також варіанти з маракуєю, мандарином або апельсином

🍷 Vinho da Madeira — кріплене мадерське вино. Добре взяти дегустацію або келих як аперитив; солодкі стилі пасують до десертів

🍍 Nikita — солодкий вершково-ананасовий коктейль, легкий і десертний за характером

🍺 Coral — місцеве мадейрське пиво, легкий світлий лагер із м’яким смаком. Добре підходить до морепродуктів, espetada та закусок

🥤 Brisa Maracujá — культовий місцевий солодкий газований напій із маракуї.`;
const durationOptions = [15, 30, 45, 60, 90, 120, 150, 180, 210, 240, 270, 300];
const locationCoordinates: Record<string, [
    number,
    number
]> = {
    'pico-do-arieiro': [32.7353, -16.9281],
    'pico-ruivo': [32.7547, -16.9336],
    'pico-grande': [32.7211, -16.9914],
    'fanal-forest': [32.8147, -17.1494],
    'praia-do-porto-do-seixal': [32.8266, -17.1052],
    'machico-beach': [32.7212, -16.7652],
    'faja-dos-padres': [32.6651, -17.0045],
    'calheta-beach': [32.7211, -17.1760],
    'prainha-do-canical': [32.7423, -16.7134],
    'porto-moniz-natural-pools': [32.8667, -17.1662],
    'ribeira-da-janela': [32.8537, -17.1579],
    funchal: [32.6496, -16.9087],
    'mercado-dos-lavradores': [32.6480, -16.9033],
    'cristo-rei': [32.6371, -16.8549],
    'pico-do-facho': [32.7240, -16.7814],
    'cabo-girao-skywalk': [32.6567, -17.0115],
    'anjos-waterfall': [32.6925, -17.1027],
    'miradouro-do-guindaste': [32.8393, -16.8869],
    'levada-nova-levada-do-moinho': [32.6942, -17.0993],
    'monte-palace-tropical-garden': [32.6799, -16.8989],
    'santana-typical-houses': [32.8037, -16.8803],
    'ponta-de-sao-lourenco': [32.7443, -16.6994],
    'madeira-international-airport': [32.6919, -16.7745],
    'continente-modelo-machico': [32.7205797, -16.7690134],
    'continente-modelo-canico-shopping': [32.6533245, -16.8418957],
    'continente-modelo-agua-de-pena': [32.7067415, -16.7683431],
    'continente-modelo-camacha': [32.6755001, -16.8524357],
    'continente-modelo-cancela': [32.6474157, -16.8595163],
    'continente-modelo-viveiros': [32.6601672, -16.9198871],
    'continente-modelo-seminario': [32.6497195, -16.9059145],
    'continente-modelo-santo-antonio': [32.660207, -16.9303789],
    'continente-modelo-madeira-shopping': [32.6592184, -16.9507246],
    'continente-modelo-santana': [32.8105254, -16.8838053],
    'continente-modelo-camara-de-lobos': [32.6547913, -16.9714938],
    'continente-modelo-monumental': [32.6394109, -16.9470358],
    'continente-modelo-sao-martinho': [32.6501934, -16.9378196],
    'continente-modelo-sao-vicente': [32.8028012, -17.0454738],
    'continente-modelo-ribeira-brava': [32.693712, -17.0461526],
    'continente-modelo-ribeira-brava-centro': [32.678645, -17.058575],
    'continente-modelo-estreito-de-camara-de-lobos': [32.6697258, -16.9769132],
    'pingo-doce-machico': [32.7198279, -16.7677055],
    'pingo-doce-camara-de-lobos': [32.6493188, -16.9750799],
    'pingo-doce-plaza-madeira': [32.6369198, -16.9438398],
    'pingo-doce-anadia': [32.649296, -16.904707],
    'pingo-doce-funchal': [32.6369174, -16.9316492],
    'pingo-doce-ribeira-brava': [32.670003, -17.0641829],
    'pingo-doce-santo-antonio': [32.663891, -16.9393958],
    'pingo-doce-brito-camara': [32.6475054, -16.9135832],
    'pingo-doce-penteada': [32.6634256, -16.9286206],
    'pingo-doce-cancela': [32.6466833, -16.857411],
    'pingo-doce-monumental': [32.638662, -16.9345364],
    'pingo-doce-calheta': [32.7197258, -17.1740178],
    ...restaurantCoordinates,
    "ponta-do-pargo-lighthouse": [32.814138, -17.262885],
    "pr9-levada-do-caldeirao-verde": [32.7804, -16.9056],
    "pr6-25-fontes": [32.7608, -17.1156],
    "pr6-levada-do-risco": [32.7558, -17.1138],
    "pr6-2-levada-do-alecrim": [32.7542, -17.1265],
    "pr11-vereda-dos-balcoes": [32.7419, -16.8864],
    "pr18-levada-do-rei": [32.8286, -16.9075],
    "eira-do-serrado": [32.7204, -16.9691],
    "miradouro-da-portela": [32.7354, -16.8295],
    "ponta-do-rosto": [32.7446, -16.7067],
    "veu-da-noiva": [32.8027, -17.1144],
    "miradouro-sao-cristovao": [32.8225, -17.0368],
    "miradouro-terra-grande": [32.7356, -17.0122],
    "bica-da-cana": [32.7544, -17.0387],
    "eira-da-achada": [32.8124, -17.0725],
    "pico-da-murta": [32.7399, -16.9905],
    "pr14-levada-dos-cedros": [32.8111, -17.1582],
    "pr13-vereda-do-fanal": [32.7938, -17.1422],
    "pr5-vereda-das-funduras": [32.7287, -16.8336],
    "pr17-pinaculo-folhadal": [32.7466, -17.0551],
    "levada-do-furado": [32.7408, -16.8767],
    ...activityCoordinates,
    "ribeira-brava-beach": [
        32.6722295,
        -17.0681673
    ]
};
function todayValue() { const date = new Date(); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
function addMinutes(time: string, minutes: number) { const [hours, mins] = time.split(':').map(Number); const total = hours * 60 + mins + minutes; return `${Math.floor((total % 1440) / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`; }
function minutesBetween(fromTime: string, toTime: string) {
    const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
    const [toHours, toMinutes] = toTime.split(':').map(Number);
    const fromTotal = fromHours * 60 + fromMinutes;
    const toTotal = toHours * 60 + toMinutes;
    return (toTotal - fromTotal + 1440) % 1440;
}
function durationLabel(minutes: number, locale: string) { return formatDuration(minutes, locale, "short"); }
function getRouteStopIcon(location: {
    slug: string;
    tags: string[];
}) {
    if (location.tags.includes("Outdoor activities"))
        return "\uD83E\uDDED";
    if (location.tags.includes("Restaurants"))
        return "\uD83C\uDF7D\uFE0F";
    if (location.tags.includes('Supermarkets'))
        return '🛒';
    if (location.slug === 'pico-do-arieiro' || location.slug === 'ponta-de-sao-lourenco')
        return '⛰️';
    if (location.tags.includes('Beaches'))
        return '🏖️';
    if (location.tags.includes('Hiking'))
        return '🌿';
    return '📍';
}
function travelDurationLabel(minutes: number, locale: string) { return formatDuration(minutes, locale, "long"); }
function adviceForWeather(temperature: number, rain: number, locale: 'en' | 'uk') {
    if (locale === 'uk') {
        const clothing = temperature < 12 ? 'Одягайтеся тепло і шарами: тепла кофта, вітрозахисна куртка та закрите взуття.' : temperature < 20 ? 'Одягайтеся шарами: легка кофта або вітровка буде доречною.' : 'Підійде легкий одяг, але візьміть тонку кофту або вітровку на вечір та для гір.';
        return `${rain >= 30 ? 'Ймовірність дощу достатня — візьміть дощовик.' : 'Ймовірність дощу невисока, але легкий дощовик у Мадейрі все одно буде корисним.'} ${clothing}`;
    }
    const clothing = temperature < 12 ? 'Dress warmly in layers: a warm mid-layer, windproof jacket and closed shoes.' : temperature < 20 ? 'Dress in layers; a light fleece or windbreaker is recommended.' : 'Light clothing is suitable, but bring a thin layer or windbreaker for the evening and mountains.';
    return `${rain >= 30 ? 'Rain is possible, so take a rain jacket.' : 'Rain risk is low, but a light rain jacket is still useful in Madeira.'} ${clothing}`;
}
export default function TripPlanPage() {
    const { translate: localize, language: translationLanguage, format: localizeFormat } = useText();
    const { locale, messages } = useMessages();
    const [date, setDate] = useState(todayValue);
    const [villa, setVilla] = useState(villas[0].slug);
    const [startPoint, setStartPoint] = useState(villas[0].slug);
    const [endAtStart, setEndAtStart] = useState(true);
    const [endPoint, setEndPoint] = useState(villas[0].slug);
    const [customPointInput, setCustomPointInput] = useState('');
    const [endCustomPointInput, setEndCustomPointInput] = useState('');
    const [customStartForRoute, setCustomStartForRoute] = useState<CustomRoutePoint | null>(null);
    const [customEndForRoute, setCustomEndForRoute] = useState<CustomRoutePoint | null>(null);
    const [restaurantInput, setRestaurantInput] = useState('');
    const [restaurantFormOpen, setRestaurantFormOpen] = useState(false);
    const selectedVilla = stays.find((stay) => stay.slug === villa) ?? stays[0];
    const selectedEndVilla = stays.find((stay) => stay.slug === endPoint) ?? null;
    const isAirportStart = startPoint === airportStartPoint.slug;
    const isCustomStart = startPoint === customStartPoint;
    const isAirportEnd = endPoint === airportStartPoint.slug;
    const isCustomEnd = endPoint === customStartPoint;
    const customCoordinates = useCustomDayPoint(customPointInput, isCustomStart);
    const endCustomCoordinates = useCustomDayPoint(endCustomPointInput, isCustomEnd && !endAtStart);
    const startPointName = isAirportStart ? (locale === "uk" ? "\u0410\u0435\u0440\u043E\u043F\u043E\u0440\u0442 \u041C\u0430\u0434\u0435\u0439\u0440\u0438" : "Madeira Airport") : isCustomStart ? (customStartForRoute?.name ?? (locale === "uk" ? "\u0414\u043E\u0432\u0456\u043B\u044C\u043D\u0430 \u0442\u043E\u0447\u043A\u0430" : "Custom point")) : selectedVilla.name;
    const startCoordinates: [
        number,
        number
    ] | null = isAirportStart ? [airportStartPoint.latitude, airportStartPoint.longitude] : isCustomStart ? (customStartForRoute ? [customStartForRoute.latitude, customStartForRoute.longitude] : null) : [selectedVilla.latitude, selectedVilla.longitude];
    const selectedEndPointName = isAirportEnd ? (locale === "uk" ? "\u0410\u0435\u0440\u043E\u043F\u043E\u0440\u0442 \u041C\u0430\u0434\u0435\u0439\u0440\u0438" : "Madeira Airport") : isCustomEnd ? (customEndForRoute?.name ?? (locale === "uk" ? "\u0414\u043E\u0432\u0456\u043B\u044C\u043D\u0430 \u0442\u043E\u0447\u043A\u0430" : "Custom point")) : selectedEndVilla?.name ?? "";
    const selectedEndCoordinates: [
        number,
        number
    ] | null = isAirportEnd ? [airportStartPoint.latitude, airportStartPoint.longitude] : isCustomEnd && customEndForRoute ? [customEndForRoute.latitude, customEndForRoute.longitude] : selectedEndVilla ? [selectedEndVilla.latitude, selectedEndVilla.longitude] : null;
    const finalPointName = endAtStart ? startPointName : selectedEndPointName;
    const finalCoordinates = endAtStart ? startCoordinates : selectedEndCoordinates;
    const isAirportFinal = endAtStart ? isAirportStart : isAirportEnd;
    const [departureTime, setDepartureTime] = useState('09:00');
    const [stops, setStops] = useState<PlanStop[]>([]);
    const [selectedSlug, setSelectedSlug] = useState('');
    const [locationFilter, setLocationFilter] = useState('Lab Travel');
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const [recommendations, setRecommendations] = useState<Record<RecommendationKey, boolean>>({ ...emptyRecommendations });
    const [weather, setWeather] = useState<WeatherSummary | null>(null);
    const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle');
    const [routeStatus, setRouteStatus] = useState<'idle' | 'loading'>('idle');
    const [routeUsage, setRouteUsage] = useState<RouteUsage | null>(null);
    const [routeUsageStatus, setRouteUsageStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
    const [returnTravelMinutes, setReturnTravelMinutes] = useState(30);
    const [googleMapsUrl, setGoogleMapsUrl] = useState('');
    const [isResolvingGoogleMapsUrl, setIsResolvingGoogleMapsUrl] = useState(false);
    const [googleMapsUrlError, setGoogleMapsUrlError] = useState('');
    const text = locale === 'uk' ? {
        title: localize("\u041F\u043B\u0430\u043D \u043F\u043E\u0434\u043E\u0440\u043E\u0436\u0456"), intro: localize("\u0421\u0442\u0432\u043E\u0440\u0456\u0442\u044C \u043F\u0440\u043E\u0441\u0442\u0443 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0443 \u0434\u043D\u044F: \u043E\u0431\u0435\u0440\u0456\u0442\u044C \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0443 \u0442\u043E\u0447\u043A\u0443, \u0434\u043E\u0434\u0430\u0439\u0442\u0435 \u043B\u043E\u043A\u0430\u0446\u0456\u0457, \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D \u0456 \u0447\u0430\u0441 \u0434\u043B\u044F \u043A\u043E\u0436\u043D\u043E\u0457 \u0437\u0443\u043F\u0438\u043D\u043A\u0438."), dayDetails: localize("\u0414\u0435\u0442\u0430\u043B\u0456 \u0434\u043D\u044F"), date: localize('Дата'), startVilla: localize("\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430 \u0442\u043E\u0447\u043A\u0430"), endPoint: localize("\u041A\u0456\u043D\u0446\u0435\u0432\u0430 \u0442\u043E\u0447\u043A\u0430"), endAtStart: localize("\u0421\u0442\u0430\u0440\u0442 = \u0444\u0456\u043D\u0456\u0448"), customPoint: localize("\u041F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F Google Maps \u0430\u0431\u043E \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u0438"), whatToTry: localize("\u0429\u043E \u0441\u043A\u0443\u0448\u0442\u0443\u0432\u0430\u0442\u0438"), departure: localize("\u0427\u0430\u0441 \u0432\u0438\u0457\u0437\u0434\u0443"), addStop: localize("\u0414\u043E\u0434\u0430\u0442\u0438 \u0442\u043E\u0447\u043A\u0443"), location: localize('Локація'), locationFilters: localize("\u0424\u0456\u043B\u044C\u0442\u0440 \u043B\u043E\u043A\u0430\u0446\u0456\u0439"), chooseLocation: localize("\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043B\u043E\u043A\u0430\u0446\u0456\u044E"), addLocation: localize("\u0414\u043E\u0434\u0430\u0442\u0438 \u043B\u043E\u043A\u0430\u0446\u0456\u044E"), addRestaurant: localize("\u0414\u043E\u0434\u0430\u0442\u0438 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D"), addVilla: localize("\u0414\u043E\u0434\u0430\u0442\u0438 \u043F\u043E\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F \u043D\u0430 \u0432\u0456\u043B\u043B\u0443"), selectedStops: localize("\u041C\u0430\u0440\u0448\u0440\u0443\u0442 \u0434\u043D\u044F"), noStops: localize("\u0414\u043E\u0434\u0430\u0439\u0442\u0435 \u043F\u0435\u0440\u0448\u0443 \u043B\u043E\u043A\u0430\u0446\u0456\u044E \u0430\u0431\u043E \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D, \u0449\u043E\u0431 \u0441\u0444\u043E\u0440\u043C\u0443\u0432\u0430\u0442\u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442."), arrival: localize('Прибуття'), duration: localize('Тривалість'), sunrise: localize("\u0421\u0445\u0456\u0434 \u0441\u043E\u043D\u0446\u044F"), bar: localize('Бар'), restaurantOption: localize('Ресторан'), meal: localize("\u041F\u0440\u0438\u0439\u043E\u043C \u0457\u0436\u0456"), breakfast: localize('Сніданок'), lunch: localize('Обід'), dinner: localize('Вечеря'), up: localize('Вище'), down: localize('Нижче'), remove: localize('Видалити'), restaurant: localize('Ресторан'), output: localize("\u0413\u043E\u0442\u043E\u0432\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0430"), share: localize('Поділитися'), copied: localize('Скопійовано'), clear: localize("\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442"), return: localize("\u041F\u043E\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F \u0434\u043E"), departureFrom: localize("\u0432\u0438\u0457\u0437\u0434 \u0437"), defaultProgram: localize("\u0414\u043E\u0434\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043A\u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0443 \u2014 \u0442\u0443\u0442 \u0437\u2019\u044F\u0432\u0438\u0442\u044C\u0441\u044F \u0433\u043E\u0442\u043E\u0432\u0430 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0430 \u0434\u043B\u044F \u043A\u043E\u043F\u0456\u044E\u0432\u0430\u043D\u043D\u044F."), endVillaRequired: localize("\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u043A\u043E\u0440\u0435\u043A\u0442\u043D\u0443 \u043A\u0456\u043D\u0446\u0435\u0432\u0443 \u0442\u043E\u0447\u043A\u0443, \u0449\u043E\u0431 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442."), recommendations: localize("\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0456\u0457 \u043D\u0430 \u0434\u0435\u043D\u044C"), weather: localize('Погода'), beach: localize('Пляж'), levada: localize('Левада'), trekking: localize('Трекінг'), weatherUnavailable: localize("\u0410\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u0438\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0434\u043B\u044F \u043E\u0431\u0440\u0430\u043D\u043E\u0457 \u0434\u0430\u0442\u0438 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0438\u0439. \u041F\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 \u043F\u043E\u0433\u043E\u0434\u0443 \u043F\u0435\u0440\u0435\u0434 \u0432\u0438\u0457\u0437\u0434\u043E\u043C."),
    } : {
        title: localize("Trip plan"), intro: localize("Create a simple day itinerary: choose a starting point, add locations, a restaurant stop and timing for each point."), dayDetails: localize("Day details"), date: localize('Date'), startVilla: localize("Starting point"), endPoint: localize("End point"), endAtStart: localize("Start equals finish"), customPoint: localize("Google Maps link or coordinates"), whatToTry: localize("What to try"), departure: localize("Departure time"), addStop: localize("Add a stop"), location: localize('Location'), locationFilters: localize("Location filters"), chooseLocation: localize("Choose a location"), addLocation: localize("Add location"), addRestaurant: localize("Add restaurant"), addVilla: localize("Add villa return"), selectedStops: localize("Day route"), noStops: localize("Add your first location or restaurant to build the route."), arrival: localize('Arrival'), duration: localize('Duration'), sunrise: localize('Sunrise'), bar: localize('Bar'), restaurantOption: localize('Restaurant'), meal: localize('Meal'), breakfast: localize('Breakfast'), lunch: localize('Lunch'), dinner: localize('Dinner'), up: localize("Move up"), down: localize("Move down"), remove: localize('Remove'), restaurant: localize('Restaurant'), output: localize("Ready programme"), share: localize('Share'), copied: localize('Copied'), clear: localize("Clear route"), return: localize("Return to"), departureFrom: localize("departure from"), defaultProgram: localize("Add route stops and a ready-to-copy programme will appear here."), endVillaRequired: localize("Choose a valid end point to complete the route."), recommendations: localize("Day recommendations"), weather: localize('Weather'), beach: localize('Beach'), levada: localize('Levada'), trekking: localize('Trekking'), weatherUnavailable: localize("A current forecast is unavailable for the selected date. Check the weather before departure."),
    };
    const locationFilters = [{ value: 'All', label: messages.exploreList.filters.all }, { value: 'Viewpoints', label: messages.exploreList.filters.viewpoints }, { value: 'Hiking', label: messages.exploreList.filters.hiking }, { value: 'Beaches', label: messages.exploreList.filters.beaches }, { value: 'City & culture', label: messages.exploreList.filters.cityCulture }, { value: 'Levada walks', label: messages.exploreList.filters.levadaWalks }, { value: 'Airport', label: locale === 'uk' ? 'Аеропорт' : 'Airport' }, { value: 'Restaurants', label: locale === 'uk' ? 'Ресторани' : 'Restaurants' }, { value: 'Lab Travel', label: 'Lab Travel' }, { value: 'Supermarkets', label: locale === 'uk' ? 'Супермаркети' : 'Supermarkets' }, ({ value: "Outdoor activities", label: locale === "uk" ? "\u0410\u043A\u0442\u0438\u0432\u043D\u0438\u0439 \u0432\u0456\u0434\u043F\u043E\u0447\u0438\u043D\u043E\u043A" : "Outdoor activities" })];
    const availableLocations = useMemo(() => locations.filter((location) => locationFilter === 'All' || location.tags.includes(locationFilter)).map((location) => getLocalizedLocation(location, locale)).sort((a, b) => a.name.localeCompare(b.name, locale)), [locale, locationFilter]);
    const locationBySlug = useMemo(() => new Map(locations.map((location) => [location.slug, getLocalizedLocation(location, locale)])), [locale]);
    const routeLocations = useMemo(() => stops.filter((stop) => stop.type === 'location' && stop.slug).map((stop) => locationBySlug.get(stop.slug as string)).filter(Boolean), [stops, locationBySlug]);
    const hasBeach = routeLocations.some((location) => location?.tags.includes('Beaches') || location?.slug === 'faja-dos-padres');
    const hasLevada = routeLocations.some((location) => location?.tags.includes('Levada walks'));
    const hasTrekking = routeLocations.some((location) => location?.tags.includes('Hiking') || location?.tags.includes('Outdoor activities'));
    const hasSunrise = stops.some((stop) => stop.slug === 'pico-do-arieiro' && stop.isSunrise);
    const hasFanal = stops.some((stop) => stop.slug === 'fanal-forest');
    const hasLastDay = stops.some((stop) => stop.slug === 'madeira-international-airport' && stop.isLastDay);
    const endsAtAirportStop = isAirportFinal && stops.length > 0 && stops[stops.length - 1].slug === airportStartPoint.slug && Boolean(stops[stops.length - 1].isLastDay);
    const hasRestaurant = routeLocations.some(location => location?.tags.includes("Restaurants")) || stops.some(stop => stop.hasCristovaoRestaurant);
    const needsEndPoint = !endAtStart && !finalCoordinates;
    const routeInitialized = useRef(false);
    const draftReady = usePlannerDraft({ date, villa, startPoint, endAtStart, endPoint, customPointInput, endCustomPointInput, customStartForRoute, customEndForRoute, departureTime, stops, recommendations }, saved => {
        if (saved.date !== undefined)
            setDate(saved.date);
        if (saved.villa !== undefined)
            setVilla(saved.villa);
        if (saved.startPoint !== undefined)
            setStartPoint(saved.startPoint);
        if (saved.endAtStart !== undefined)
            setEndAtStart(saved.endAtStart);
        if (saved.endPoint !== undefined)
            setEndPoint(saved.endPoint);
        if (saved.customPointInput !== undefined)
            setCustomPointInput(saved.customPointInput);
        if (saved.endCustomPointInput !== undefined)
            setEndCustomPointInput(saved.endCustomPointInput);
        if (saved.customStartForRoute !== undefined)
            setCustomStartForRoute(saved.customStartForRoute);
        if (saved.customEndForRoute !== undefined)
            setCustomEndForRoute(saved.customEndForRoute);
        if (saved.departureTime !== undefined)
            setDepartureTime(saved.departureTime);
        if (saved.recommendations !== undefined)
            setRecommendations(saved.recommendations);
        if (saved.stops !== undefined)
            setStops(saved.stops);
    });
    useEffect(() => {
        const slugs = stops
            .filter((stop) => stop.type === 'location' && stop.slug)
            .map((stop) => stop.slug as string)
            .filter((slug, index, allSlugs) => allSlugs.indexOf(slug) === index);
        if (slugs.length === 0) {
            setWeather(null);
            setWeatherStatus('idle');
            return;
        }
        let cancelled = false;
        const loadWeather = async () => {
            setWeatherStatus('loading');
            setWeather(null);
            try {
                const coordinates = slugs.map((slug) => locationCoordinates[slug] ?? [32.72, -16.97] as [
                    number,
                    number
                ]);
                const forecasts = await Promise.all(coordinates.map(async ([latitude, longitude]) => {
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,wind_gusts_10m&timezone=auto&start_date=${date}&end_date=${date}`);
                    if (!response.ok)
                        throw new Error('Weather request failed');
                    return response.json();
                }));
                const readings = forecasts.map((forecast) => ({ average: (forecast.daily.temperature_2m_max[0] + forecast.daily.temperature_2m_min[0]) / 2, rain: forecast.daily.precipitation_probability_max[0] ?? 0, wind: forecast.daily.wind_speed_10m_max[0] ?? 0, gusts: forecast.daily.wind_gusts_10m_max[0] ?? 0 }));
                const picoIndex = slugs.indexOf('pico-do-arieiro');
                const fanalIndex = slugs.indexOf('fanal-forest');
                const fanalForecast = fanalIndex >= 0 ? forecasts[fanalIndex] : null;
                const fanalStop = stops.find((stop) => stop.slug === 'fanal-forest');
                const fanalHour = fanalStop ? `${date}T${fanalStop.arrivalTime.slice(0, 2)}:00` : '';
                const fanalReadingIndex = fanalForecast?.hourly?.time?.indexOf(fanalHour) ?? -1;
                const fanal = fanalForecast && fanalReadingIndex >= 0 && Number.isFinite(fanalForecast.hourly.temperature_2m[fanalReadingIndex]) ? {
                    temperature: fanalForecast.hourly.temperature_2m[fanalReadingIndex] as number,
                    wind: fanalForecast.hourly.wind_speed_10m[fanalReadingIndex] as number,
                    gusts: fanalForecast.hourly.wind_gusts_10m[fanalReadingIndex] as number,
                    humidity: fanalForecast.hourly.relative_humidity_2m[fanalReadingIndex] as number | null,
                    rain: fanalForecast.hourly.precipitation_probability[fanalReadingIndex] as number | null,
                    elevation: Number.isFinite(fanalForecast.elevation) ? fanalForecast.elevation as number : null,
                    forecastTime: fanalHour, fetchedAt: new Date().toISOString(),
                } : undefined;
                let waterTemperature: number | null = null;
                if (hasBeach) {
                    const marine = await fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=32.70&longitude=-17.05&hourly=sea_surface_temperature&timezone=auto&start_date=${date}&end_date=${date}`);
                    if (marine.ok) {
                        const data = await marine.json();
                        const values = (data.hourly.sea_surface_temperature as Array<number | null>).filter((value): value is number => value !== null);
                        if (values.length)
                            waterTemperature = values.reduce((sum, value) => sum + value, 0) / values.length;
                    }
                }
                if (!cancelled) {
                    setWeather({ averageTemperature: readings.reduce((sum, reading) => sum + reading.average, 0) / readings.length, rainProbability: Math.max(...readings.map((reading) => reading.rain)), picoTemperature: picoIndex >= 0 ? readings[picoIndex].average : null, picoWindSpeed: picoIndex >= 0 ? readings[picoIndex].wind : null, picoWindGusts: picoIndex >= 0 ? readings[picoIndex].gusts : null, waterTemperature, fanal });
                    setWeatherStatus('idle');
                }
            }
            catch {
                if (!cancelled)
                    setWeatherStatus('unavailable');
            }
        };
        loadWeather();
        return () => { cancelled = true; };
    }, [date, stops, hasBeach]);
    const routeKey = JSON.stringify([startCoordinates, finalCoordinates, departureTime, stops.map(stop => [stop.id, stop.type, stop.slug, stop.latitude, stop.longitude, stop.durationMinutes, stop.boatDirection]), [selectedVilla.latitude, selectedVilla.longitude]]);
    const activeRouteKey = useRef(routeKey);
    activeRouteKey.current = routeKey;
    const resolvedPoints = useRef(new Map<string, [
        number,
        number
    ]>());
    const [calculatedKey, setCalculatedKey] = useState<string | null>(null);
    const [routeError, setRouteError] = useState("");
    const calculated = calculatedKey === routeKey;
    const hasRoute = stops.length > 0 || !endAtStart;
    const finalDeparture = stops.length ? addMinutes(stops[stops.length - 1].arrivalTime, stops[stops.length - 1].durationMinutes) : departureTime;
    const pointForStop = async (stop: PlanStop): Promise<[
        number,
        number
    ]> => {
        if (stop.type === "villa")
            return [selectedVilla.latitude, selectedVilla.longitude];
        if (stop.type === "custom" && validRoutePoint([stop.latitude!, stop.longitude!]))
            return [stop.latitude!, stop.longitude!];
        const location = locations.find(item => item.slug === stop.slug);
        if (stop.type === "location" && location)
            return resolvePlannerLocation(location, locationCoordinates, resolvedPoints.current);
        throw new Error("point");
    };
    useEffect(() => {
        setRouteError("");
        setCalculatedKey(null);
        setReturnTravelMinutes(30);
        if (!draftReady)
            return;
        if (!routeInitialized.current) {
            routeInitialized.current = true;
            return;
        }
        if (!stops.length) {
            return;
        }
        let cursor = departureTime;
        const nextArrivalTimes = stops.map((stop) => {
            const arrivalTime = addMinutes(cursor, 30);
            cursor = addMinutes(arrivalTime, stop.durationMinutes);
            return arrivalTime;
        });
        setStops((current) => current.map((stop, index) => ({
            ...stop,
            arrivalTime: nextArrivalTimes[index] ?? stop.arrivalTime,
        })));
        setReturnTravelMinutes(30);
    }, [routeKey, draftReady]);
    const calculateRoute = async () => {
        if (!hasRoute || !startCoordinates || !finalCoordinates || routeStatus === "loading" || !routeUsage || routeUsage.remaining <= 0)
            return;
        const requestedKey = routeKey;
        setRouteStatus("loading");
        setRouteError("");
        setCalculatedKey(null);
        try {
            const result = await calculatePlannerRoute({ start: startCoordinates, end: finalCoordinates, departure: departureTime, stops, pointForStop, onUsage: setRouteUsage });
            if (activeRouteKey.current !== requestedKey)
                return;
            setStops(result.stops);
            setReturnTravelMinutes(result.returnTravelMinutes);
            setCalculatedKey(requestedKey);
        }
        catch (error) {
            if (activeRouteKey.current !== requestedKey)
                return;
            const reason = error instanceof Error ? error.message : "";
            setRouteError(reason === "limit" ? (locale === "uk" ? "\u041B\u0456\u043C\u0456\u0442 \u0440\u043E\u0437\u0440\u0430\u0445\u0443\u043D\u043A\u0456\u0432 \u0432\u0438\u0447\u0435\u0440\u043F\u0430\u043D\u043E. \u041C\u0430\u0440\u0448\u0440\u0443\u0442 \u043D\u0435 \u0440\u043E\u0437\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u043E \u043F\u043E\u0432\u043D\u0456\u0441\u0442\u044E." : "The request limit was reached. The route has not been fully calculated.") : reason === "point" ? (locale === "uk" ? "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0432\u0438\u0437\u043D\u0430\u0447\u0438\u0442\u0438 \u043E\u0434\u043D\u0443 \u0437 \u0442\u043E\u0447\u043E\u043A. \u041F\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 \u043B\u043E\u043A\u0430\u0446\u0456\u0457 \u0430\u0431\u043E \u0434\u043E\u0434\u0430\u0439\u0442\u0435 \u0442\u043E\u0447\u043D\u0456 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u0438." : "A route point could not be located. Check the locations or enter exact coordinates.") : (locale === "uk" ? "\u041D\u0435 \u0432\u0434\u0430\u043B\u043E\u0441\u044F \u0440\u043E\u0437\u0440\u0430\u0445\u0443\u0432\u0430\u0442\u0438 \u0432\u0441\u0456 \u0432\u0456\u0434\u0440\u0456\u0437\u043A\u0438, \u0432\u043A\u043B\u044E\u0447\u043D\u043E \u0437 \u043A\u0456\u043D\u0446\u0435\u0432\u043E\u044E \u0442\u043E\u0447\u043A\u043E\u044E. \u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E \u043F\u043E\u043F\u0435\u0440\u0435\u0434\u043D\u0456\u0439 \u043F\u043B\u0430\u043D. \u0421\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0449\u0435 \u0440\u0430\u0437." : "Could not calculate all legs including the destination. The draft is shown. Please try again."));
        }
        finally {
            setRouteStatus("idle");
            await loadRouteUsage();
        }
    };
    const loadRouteUsage = async () => {
        setRouteUsageStatus('loading');
        try {
            const response = await fetch('/api/route-usage');
            if (!response.ok) {
                throw new Error('Usage request failed');
            }
            const data = (await response.json()) as RouteUsage;
            setRouteUsage(data);
            setRouteUsageStatus('ready');
        }
        catch {
            setRouteUsageStatus('unavailable');
        }
    };
    useEffect(() => {
        loadRouteUsage();
    }, []);
    const getNextArrivalTime = () => {
        const previousStop = stops[stops.length - 1];
        return !previousStop
            ? addMinutes(departureTime, 30)
            : addMinutes(previousStop.arrivalTime, previousStop.durationMinutes + 30);
    };
    const addLocation = () => {
        if (selectedSlug === customRoutePoint) {
            void addGoogleMapsPoint();
            return;
        }
        if (!selectedSlug)
            return;
        const selectedLocation = locations.find((location) => location.slug === selectedSlug);
        setStops((current) => [...current, { id: `${selectedSlug}-${Date.now()}`, type: 'location', slug: selectedSlug, arrivalTime: getNextArrivalTime(), durationMinutes: selectedLocation ? plannerStopDuration(selectedLocation) : 90, isSunrise: false }]);
        setSelectedSlug('');
    };
    const addGoogleMapsPoint = async () => {
        if (!googleMapsUrl || isResolvingGoogleMapsUrl)
            return;
        setIsResolvingGoogleMapsUrl(true);
        setGoogleMapsUrlError('');
        try {
            const response = await fetch('/api/resolve-route-point', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: googleMapsUrl }) });
            const data = (await response.json()) as {
                name?: string;
                latitude?: number;
                longitude?: number;
                error?: string;
            };
            if (!response.ok || !data.name || data.latitude === undefined || data.longitude === undefined)
                throw new Error(data.error || 'Unable to resolve the Google Maps link.');
            setStops((current) => [...current, { id: `custom-${Date.now()}`, type: 'custom', latitude: data.latitude, longitude: data.longitude, name: data.name, sourceUrl: googleMapsUrl, arrivalTime: getNextArrivalTime(), durationMinutes: 60 }]);
            setGoogleMapsUrl('');
            setSelectedSlug('');
        }
        catch (error) {
            setGoogleMapsUrlError(error instanceof Error ? error.message : 'Unable to resolve the Google Maps link.');
        }
        finally {
            setIsResolvingGoogleMapsUrl(false);
        }
    };
    const updateStop = (id: string, updates: Partial<PlanStop>) => setStops((current) => current.map((stop) => stop.id === id ? { ...stop, ...updates } : stop));
    const moveStop = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= stops.length)
            return;
        setStops((current) => { const next = [...current]; [next[index], next[targetIndex]] = [next[targetIndex], next[index]]; return next; });
    };
    const removeStop = (id: string) => {
        const remaining = stops.filter((stop) => stop.id !== id);
        setStops(remaining);
        if (remaining.length === 0)
            setRecommendations({ ...emptyRecommendations });
    };
    const mealLabelForTime = (time: string) => {
        const hour = Number(time.split(':')[0]);
        if (hour < 12)
            return text.breakfast;
        if (hour < 17)
            return text.lunch;
        return text.dinner;
    };
    const mealProgrammeText = (time: string) => {
        const meal = mealLabelForTime(time).toLowerCase();
        return locale === 'uk' ? `${meal} в ресторані` : localizeFormat("__VAR_0__ at a restaurant", meal);
    };
    const recommendationLines = useMemo(() => {
        const lines: string[] = [];
        const unavailable = weatherStatus === 'unavailable' ? text.weatherUnavailable : '';
        if (recommendations.weather) {
            lines.push(localizeFormat("\uD83C\uDF24\uFE0F __VAR_0__", text.weather));
            lines.push(weather ? (locale === 'uk' ? localizeFormat("\u0421\u0435\u0440\u0435\u0434\u043D\u044F \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0437\u0430 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u043E\u043C: \u0431\u043B\u0438\u0437\u044C\u043A\u043E __VAR_0__\u00B0C. \u0419\u043C\u043E\u0432\u0456\u0440\u043D\u0456\u0441\u0442\u044C \u0434\u043E\u0449\u0443: \u0434\u043E __VAR_1__%. __VAR_2__", Math.round(weather.averageTemperature), Math.round(weather.rainProbability), adviceForWeather(weather.averageTemperature, weather.rainProbability, locale)) : localizeFormat("Average temperature across the route: about __VAR_0__\u00B0C. Rain probability: up to __VAR_1__%. __VAR_2__", Math.round(weather.averageTemperature), Math.round(weather.rainProbability), adviceForWeather(weather.averageTemperature, weather.rainProbability, locale))) : unavailable, '');
        }
        if (recommendations.beach && hasBeach) {
            lines.push(localizeFormat("\uD83C\uDFD6\uFE0F __VAR_0__", text.beach));
            lines.push(weather?.waterTemperature !== null && weather?.waterTemperature !== undefined ? (locale === 'uk' ? localizeFormat("\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u0432\u043E\u0434\u0438 \u0431\u0456\u043B\u044F \u041C\u0430\u0434\u0435\u0439\u0440\u0438: \u0431\u043B\u0438\u0437\u044C\u043A\u043E __VAR_0__\u00B0C.", Math.round(weather.waterTemperature)) : localizeFormat("Sea temperature around Madeira: about __VAR_0__\u00B0C.", Math.round(weather.waterTemperature))) : unavailable);
            lines.push(locale === 'uk' ? localize("\u0412\u0456\u0437\u044C\u043C\u0456\u0442\u044C \u043F\u0456\u0434\u0441\u0442\u0438\u043B\u043A\u0438, \u043F\u043E\u0432\u043D\u0438\u0439 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u0434\u043B\u044F \u043A\u0443\u043F\u0430\u043D\u043D\u044F, \u0441\u043E\u043D\u044F\u0447\u043D\u0456 \u043E\u043A\u0443\u043B\u044F\u0440\u0438, \u0441\u043E\u043D\u0446\u0435\u0437\u0430\u0445\u0438\u0441\u043D\u0438\u0439 \u043A\u0440\u0435\u043C \u0456 \u0433\u043E\u043B\u043E\u0432\u043D\u0438\u0439 \u0443\u0431\u0456\u0440.") : localize("Bring beach mats, a full swim kit, sunglasses, sunscreen and a hat."), '');
        }
        if (recommendations.levada && hasLevada) {
            lines.push(localizeFormat("\uD83C\uDF3F __VAR_0__", text.levada));
            lines.push(locale === 'uk' ? localize("\u0412\u0456\u0437\u044C\u043C\u0456\u0442\u044C \u0437\u0440\u0443\u0447\u043D\u0435 \u0432\u0437\u0443\u0442\u0442\u044F \u0434\u043B\u044F \u043B\u0435\u0432\u0430\u0434\u0438 \u0437 \u0445\u043E\u0440\u043E\u0448\u0438\u043C \u0437\u0447\u0435\u043F\u043B\u0435\u043D\u043D\u044F\u043C. \u042F\u043A\u0449\u043E \u043B\u0435\u0432\u0430\u043B\u0430 \u0432\u0438\u0439\u0448\u043B\u0430 \u0437 \u0431\u0435\u0440\u0435\u0433\u0456\u0432 \u0430\u0431\u043E \u0441\u0442\u0435\u0436\u043A\u0430 \u043C\u043E\u043A\u0440\u0430, \u0432\u0456\u0437\u044C\u043C\u0456\u0442\u044C \u0432\u043E\u0434\u043E\u043D\u0435\u043F\u0440\u043E\u043D\u0438\u043A\u043D\u0456 \u0447\u043E\u0445\u043B\u0438, \u0449\u043E\u0431 \u043D\u0435 \u043F\u0440\u043E\u043C\u043E\u043A\u043B\u0438 \u043D\u043E\u0433\u0438. \u0412\u043E\u0434\u0430 \u043E\u0431\u043E\u0432\u2019\u044F\u0437\u043A\u043E\u0432\u0430. \u0423\u0441\u0456\u043C, \u0445\u0442\u043E \u0432\u0438\u0449\u0438\u0439 \u0437\u0430 175 \u0441\u043C, \u043F\u043E\u0442\u0440\u0456\u0431\u043D\u043E \u0443\u0432\u0430\u0436\u043D\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442\u0438 \u0442\u0443\u043D\u0435\u043B\u0456: \u0454 \u0440\u0438\u0437\u0438\u043A \u0432\u0434\u0430\u0440\u0438\u0442\u0438\u0441\u044F \u0433\u043E\u043B\u043E\u0432\u043E\u044E. \u042F\u043A\u0449\u043E \u0431\u043E\u0457\u0442\u0435\u0441\u044F \u0432\u0438\u0441\u043E\u0442\u0438, \u0439\u0434\u0456\u0442\u044C \u043F\u043E\u0440\u0443\u0447 \u0456\u0437 \u0433\u0456\u0434\u043E\u043C.") : localize("Wear comfortable levada shoes with good grip. If the levada has overflowed or the path is wet, take waterproof overshoes to keep your feet dry. Carry water. If you are taller than 175 cm, take care in tunnels because there is a risk of hitting your head. If you are afraid of heights, stay close to your guide."), '');
        }
        if (recommendations.trekking && hasTrekking) {
            lines.push(localizeFormat("\uD83E\uDD7E __VAR_0__", text.trekking));
            lines.push(locale === 'uk' ? localize("\u0426\u044C\u043E\u0433\u043E \u0434\u043D\u044F \u0437\u0430\u043F\u043B\u0430\u043D\u043E\u0432\u0430\u043D\u0438\u0439 \u0442\u0440\u0435\u043A\u0456\u043D\u0433. \u0412\u0434\u044F\u0433\u043D\u0456\u0442\u044C \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u043D\u0435 \u0432\u0437\u0443\u0442\u0442\u044F \u0442\u0430 \u0437\u0440\u0443\u0447\u043D\u0438\u0439 \u043E\u0434\u044F\u0433 \u0434\u043B\u044F \u043F\u0456\u0448\u043E\u0433\u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0443.") : localize("Today includes trekking. Wear suitable footwear and comfortable clothing for walking."), '');
        }
        if (recommendations.sunrise && hasSunrise) {
            lines.push(localizeFormat("\uD83C\uDF05 __VAR_0__", text.sunrise));
            lines.push(weather?.picoTemperature !== null && weather?.picoTemperature !== undefined ? (locale === 'uk' ? localizeFormat("\u041D\u0430 Pico do Areeiro: \u0431\u043B\u0438\u0437\u044C\u043A\u043E __VAR_0__\u00B0C, \u0432\u0456\u0442\u0435\u0440 \u0434\u043E __VAR_1__ \u043A\u043C/\u0433\u043E\u0434, \u043F\u043E\u0440\u0438\u0432\u0438 \u0434\u043E __VAR_2__ \u043A\u043C/\u0433\u043E\u0434.", Math.round(weather.picoTemperature), Math.round(weather.picoWindSpeed ?? 0), Math.round(weather.picoWindGusts ?? 0)) : localizeFormat("At Pico do Areeiro: about __VAR_0__\u00B0C, wind up to __VAR_1__ km/h and gusts up to __VAR_2__ km/h.", Math.round(weather.picoTemperature), Math.round(weather.picoWindSpeed ?? 0), Math.round(weather.picoWindGusts ?? 0))) : unavailable);
            lines.push(locale === 'uk' ? localize("\u041E\u0434\u044F\u0433\u043D\u0456\u0442\u044C \u0442\u0435\u043F\u043B\u0438\u0439 \u0448\u0430\u0440, \u0432\u0456\u0442\u0440\u043E\u0437\u0430\u0445\u0438\u0441\u043D\u0443 \u043A\u0443\u0440\u0442\u043A\u0443, \u0434\u043E\u0432\u0433\u0456 \u0448\u0442\u0430\u043D\u0438 \u0442\u0430 \u0437\u0430\u043A\u0440\u0438\u0442\u0435 \u0432\u0437\u0443\u0442\u0442\u044F. \u041F\u0435\u0440\u0435\u0434 \u0432\u0438\u0457\u0437\u0434\u043E\u043C \u0431\u0430\u0436\u0430\u043D\u043E \u0437\u2019\u0457\u0441\u0442\u0438 \u0449\u043E\u0441\u044C \u043B\u0435\u0433\u043A\u0435: \u043A\u0430\u0432\u0443 \u0437 \u0442\u0456\u0441\u0442\u0435\u0447\u043A\u043E\u043C \u0430\u0431\u043E \u0431\u0443\u0442\u0435\u0440\u0431\u0440\u043E\u0434\u0438. \u0421\u043A\u043E\u0440\u0438\u0441\u0442\u0430\u0439\u0442\u0435\u0441\u044F \u0442\u0443\u0430\u043B\u0435\u0442\u043E\u043C \u043F\u0435\u0440\u0435\u0434 \u0432\u0438\u0457\u0437\u0434\u043E\u043C.") : localize("Wear a warm layer, windproof jacket, long trousers and closed shoes. Before leaving, have something light such as coffee and a pastry or sandwiches. Use the toilet before departure."), '');
        }
        if (recommendations.fanal && hasFanal) {
            lines.push(localizeFormat("\uD83C\uDF33 __VAR_0__", locale === 'uk' ? localize("\u041B\u0456\u0441 \u0424\u0430\u043D\u0430\u043B") : localize("Fanal Forest")));
            lines.push(locale === 'uk' ? localize("\u041B\u0456\u0441 \u0440\u043E\u0437\u0442\u0430\u0448\u043E\u0432\u0430\u043D\u0438\u0439 \u043D\u0430 \u0432\u0438\u0441\u043E\u0442\u0456 \u0431\u043B\u0438\u0437\u044C\u043A\u043E 1 100 \u043C.") : localize("The forest is at approximately 1,100 m above sea level."));
            const fanal = weather?.fanal;
            if (fanal) {
                lines.push(locale === 'uk'
                    ? localizeFormat("\u041F\u0440\u043E\u0433\u043D\u043E\u0437 \u043D\u0430 __VAR_0__: __VAR_1__\u00B0C; \u0432\u0456\u0442\u0435\u0440 __VAR_2__ \u043A\u043C/\u0433\u043E\u0434, \u043F\u043E\u0440\u0438\u0432\u0438 __VAR_3__ \u043A\u043C/\u0433\u043E\u0434__VAR_4____VAR_5__.", fanal.forecastTime.slice(11), Math.round(fanal.temperature), Math.round(fanal.wind), Math.round(fanal.gusts), fanal.humidity !== null ? localizeFormat(", \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C __VAR_0__%", Math.round(fanal.humidity)) : '', fanal.rain !== null ? localizeFormat(", \u0439\u043C\u043E\u0432\u0456\u0440\u043D\u0456\u0441\u0442\u044C \u043E\u043F\u0430\u0434\u0456\u0432 __VAR_0__%", Math.round(fanal.rain)) : '') : localizeFormat("Forecast for __VAR_0__: __VAR_1__\u00B0C; wind __VAR_2__ km/h, gusts __VAR_3__ km/h__VAR_4____VAR_5__.", fanal.forecastTime.slice(11), Math.round(fanal.temperature), Math.round(fanal.wind), Math.round(fanal.gusts), fanal.humidity !== null ? localizeFormat(", humidity __VAR_0__%", Math.round(fanal.humidity)) : '', fanal.rain !== null ? localizeFormat(", precipitation chance __VAR_0__%", Math.round(fanal.rain)) : ''));
            }
            else if (unavailable) {
                lines.push(unavailable);
            }
            lines.push(locale === 'uk' ? localize("\u042F\u043A\u0449\u043E \u043D\u0430 \u043B\u0456\u0441 \u043D\u0430\u0441\u0443\u043D\u0435\u0442\u044C\u0441\u044F \u0445\u043C\u0430\u0440\u0430 \u0430\u0431\u043E \u0442\u0443\u043C\u0430\u043D, \u0432\u043E\u043B\u043E\u0433\u0456\u0441\u0442\u044C \u0437\u0440\u043E\u0441\u0442\u0435 \u0456 \u043C\u043E\u0436\u0435 \u0432\u0456\u0434\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u0437\u043D\u0430\u0447\u043D\u043E \u043F\u0440\u043E\u0445\u043E\u043B\u043E\u0434\u043D\u0456\u0448\u0435 \u0437\u0430 \u043F\u0440\u043E\u0433\u043D\u043E\u0437. \u0412\u0456\u0437\u044C\u043C\u0456\u0442\u044C \u0442\u0435\u043F\u043B\u0438\u0439 \u0448\u0430\u0440 \u0456 \u043A\u0443\u0440\u0442\u043A\u0443.") : localize("If cloud or fog moves into the forest, humidity rises and it may feel much colder than the forecast. Bring a warm layer and jacket."), '');
        }
        if (recommendations.lastDay && hasLastDay) {
            lines.push(localizeFormat("\uD83E\uDDF3 __VAR_0__", locale === 'uk' ? localize("\u041E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0434\u0435\u043D\u044C") : localize("Final day")));
            lines.push(locale === 'uk' ? localize("\u0426\u0435 \u043E\u0441\u0442\u0430\u043D\u043D\u0456\u0439 \u0434\u0435\u043D\u044C \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u0438. \u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u044E \u0441\u043F\u0430\u043A\u0443\u0432\u0430\u0442\u0438 \u0440\u0435\u0447\u0456 \u0437\u0432\u0435\u0447\u043E\u0440\u0430, \u0449\u043E\u0431 \u0443\u0440\u0430\u043D\u0446\u0456 \u0431\u0443\u0442\u0438 \u0433\u043E\u0442\u043E\u0432\u0438\u043C\u0438 \u0434\u043E \u0432\u0438\u0441\u0435\u043B\u0435\u043D\u043D\u044F. \u0427\u0435\u0440\u0435\u0437 \u043E\u0431\u043C\u0435\u0436\u0435\u043D\u0438\u0439 \u0447\u0430\u0441 \u043E\u0440\u0433\u0430\u043D\u0456\u0437\u043E\u0432\u0430\u043D\u043E\u0433\u043E \u043E\u0431\u0456\u0434\u0443 \u0446\u044C\u043E\u0433\u043E \u0434\u043D\u044F \u043D\u0435 \u0431\u0443\u0434\u0435. \u0417\u0430 \u0431\u0430\u0436\u0430\u043D\u043D\u044F\u043C \u043C\u043E\u0436\u043D\u0430 \u0441\u0430\u043C\u043E\u0441\u0442\u0456\u0439\u043D\u043E \u043F\u043E\u043E\u0431\u0456\u0434\u0430\u0442\u0438 \u0432 Loft Brunch e Cocktails [na.zona velha] \u0431\u0456\u043B\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438.") : localize("This is the final day of the programme. I recommend packing your bags the evening before so you are ready to check out in the morning. Time is limited, so there is no organised lunch today. For an optional independent lunch, consider Loft Brunch e Cocktails [na.zona velha] by the car park."));
            lines.push('https://maps.app.goo.gl/QW9bqQU3QPrirTej8', '');
        }
        if (recommendations.food && hasRestaurant)
            lines.push(localizeFormat("\uD83C\uDF7D\uFE0F __VAR_0__", text.whatToTry), madeiraFoodRecommendations, '');
        return lines;
    }, [hasBeach, hasLevada, hasRestaurant, hasFanal, hasLastDay, hasSunrise, hasTrekking, locale, recommendations, text, weather, weatherStatus]);
    const programme = useMemo(() => {
        if (!hasRoute || !startCoordinates || !finalCoordinates)
            return "";
        const selectedDate = new Date(localizeFormat("__VAR_0__T12:00:00", date));
        const formattedDate = new Intl.DateTimeFormat(translationLanguage, { day: 'numeric', month: 'long' }).format(selectedDate);
        const ukrainianWeekdays = ['неділю', 'понеділок', 'вівторок', 'середу', 'четвер', 'п’ятницю', 'суботу'];
        const englishWeekday = new Intl.DateTimeFormat(translationLanguage, { weekday: 'long' }).format(selectedDate);
        const heading = locale === 'uk' ? localizeFormat("\u041F\u0440\u043E\u0433\u0440\u0430\u043C\u0430 \u043D\u0430 __VAR_0__, __VAR_1__", ukrainianWeekdays[selectedDate.getDay()], formattedDate) : localizeFormat("Programme for __VAR_0__, __VAR_1__", englishWeekday, formattedDate);
        const firstStop = stops[0];
        const firstTravelMinutes = firstStop ? minutesBetween(departureTime, firstStop.arrivalTime) : returnTravelMinutes;
        const travelLine = (departureAt: string, departureFrom: string, travelMinutes: number, checkout = false) => locale === 'uk'
            ? '\u{1F68C} ' + departureAt + ' \u2014 ' + (checkout ? localize("\u0432\u0438\u0441\u0435\u043B\u0435\u043D\u043D\u044F \u0442\u0430 \u0432\u0438\u0457\u0437\u0434 \u0437 ") + departureFrom : departureFrom ? localize("\u0432\u0438\u0457\u0437\u0434 \u0437 ") + departureFrom : '\u0432\u0438\u0457\u0437\u0434') + localize(", \u0447\u0430\u0441 \u0443 \u0434\u043E\u0440\u043E\u0437\u0456 ~") + travelDurationLabel(travelMinutes, translationLanguage) + '.'
            : '\u{1F68C} ' + departureAt + ' \u2014 ' + (checkout ? localize("check-out and departure from ") + departureFrom : departureFrom ? localize("departure from ") + departureFrom : 'departure') + localize(", travel time ~") + travelDurationLabel(travelMinutes, translationLanguage) + '.';
        const stopName = (stop: PlanStop) => {
            if (stop.type === 'custom') {
                return stop.name ?? (locale === 'uk' ? localize("\u0406\u043D\u0448\u0430 \u043B\u043E\u043A\u0430\u0446\u0456\u044F") : localize("Other location"));
            }
            if (stop.type === 'villa') {
                return localize(selectedVilla.name);
            }
            return stop.slug
                ? localize(locationBySlug.get(stop.slug)?.name) ?? ''
                : '';
        };
        const lines = [
            heading,
            '',
            travelLine(departureTime, startPointName, firstTravelMinutes, hasLastDay),
            '',
        ];
        const finalStay = endAtStart
            ? (!isAirportStart && !isCustomStart ? selectedVilla : null)
            : selectedEndVilla;
        stops.forEach((stop, index) => {
            const endTime = addMinutes(stop.arrivalTime, stop.durationMinutes);
            if (index > 0) {
                const previousStop = stops[index - 1];
                const previousEndTime = addMinutes(previousStop.arrivalTime, previousStop.durationMinutes);
                const travelMinutes = minutesBetween(previousEndTime, stop.arrivalTime);
                lines.push(travelLine(previousEndTime, stopName(previousStop), travelMinutes), '');
            }
            if (stop.type === 'custom') {
                const wazeUrl = stop.latitude !== undefined && stop.longitude !== undefined ? `https://www.waze.com/ul?ll=${encodeURIComponent(localizeFormat("__VAR_0__,__VAR_1__", stop.latitude, stop.longitude))}&navigate=yes` : '';
                lines.push(localizeFormat("\uD83D\uDCCD __VAR_0__\u2013__VAR_1__ \u2014 __VAR_2__.", stop.arrivalTime, endTime, stop.name ?? (locale === 'uk' ? localize("\u0406\u043D\u0448\u0430 \u043B\u043E\u043A\u0430\u0446\u0456\u044F") : localize("Other location"))), ...(wazeUrl ? [localizeFormat("Waze: __VAR_0__", wazeUrl)] : []), '');
                return;
            }
            if (stop.type === 'villa') {
                lines.push(localizeFormat("\uD83C\uDFE1 __VAR_0__\u2013__VAR_1__ \u2014 __VAR_2__.", stop.arrivalTime, endTime, localize(selectedVilla.name)), `https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/stays/${selectedVilla.slug}`, '');
                return;
            }
            if (stop.type === 'location' && stop.slug === 'madeira-international-airport') {
                const airport = locationBySlug.get(stop.slug);
                if (airport)
                    lines.push(stop.isLastDay ? localizeFormat("\u2708\uFE0F __VAR_0__ \u2014 __VAR_1__", stop.arrivalTime, locale === 'uk' ? localize("\u041F\u0440\u0438\u0431\u0443\u0442\u0442\u044F \u0434\u043E \u041C\u0456\u0436\u043D\u0430\u0440\u043E\u0434\u043D\u043E\u0433\u043E \u0430\u0435\u0440\u043E\u043F\u043E\u0440\u0442\u0443 \u041C\u0430\u0434\u0435\u0439\u0440\u0438 \u0434\u043B\u044F \u0432\u0438\u043B\u044C\u043E\u0442\u0443.") : localize("Arrival at Madeira International Airport for departure.")) : localizeFormat("\u2708\uFE0F __VAR_0__\u2013__VAR_1__ \u2014 __VAR_2__.", stop.arrivalTime, endTime, localize(airport.name)), `https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/explore/${airport.slug}`, '');
                return;
            }
            const location = stop.slug ? locationBySlug.get(stop.slug) : undefined;
            if (!location)
                return;
            const icon = getRouteStopIcon(location);
            const sunriseSuffix = stop.slug === 'pico-do-arieiro' && stop.isSunrise ? locale === 'uk' ? localize(" \u0417\u0443\u0441\u0442\u0440\u0456\u0447\u0430\u0454\u043C\u043E \u0441\u0445\u0456\u0434 \u0441\u043E\u043D\u0446\u044F + \u043F\u0440\u043E\u0433\u0443\u043B\u044F\u043D\u043A\u0430 \u043F\u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0443 PR1 \u2013 Vereda do Areeiro \u0434\u043E Miradouro da Pedra Rija.") : localize(" Sunrise viewing plus a walk on PR1 \u2013 Vereda do Areeiro to Miradouro da Pedra Rija.") : '';
            const cristovaoSuffix = stop.slug === 'miradouro-sao-cristovao' && (stop.hasCristovaoBar || stop.hasCristovaoRestaurant)
                ? locale === 'uk'
                    ? localizeFormat(" + __VAR_0____VAR_1__", stop.hasCristovaoRestaurant ? localizeFormat("__VAR_0__, ", mealProgrammeText(stop.arrivalTime)) : '', stop.hasCristovaoBar ? localize("\u043D\u0430\u043F\u043E\u0457 \u0442\u0430 \u043F\u0435\u0440\u0435\u043A\u0443\u0441 \u0443 \u0431\u0430\u0440\u0456") : '') : localizeFormat(" + __VAR_0____VAR_1__", stop.hasCristovaoRestaurant ? localizeFormat("__VAR_0__, ", mealProgrammeText(stop.arrivalTime)) : '', stop.hasCristovaoBar ? localize("drinks and snacks at the bar") : '')
                : '';
            const sunsetSuffix = stop.slug === 'pico-ruivo' && stop.isSunset ? locale === 'uk' ? localize(" \u041F\u0456\u0434\u0439\u043E\u043C \u0432\u0456\u0434 \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438 Achada do Teixeira \u0434\u043E Pico Ruivo (1 862 \u043C) \u0441\u0442\u0435\u0436\u043A\u043E\u044E PR1.2, \u0437\u0443\u0441\u0442\u0440\u0456\u0447 \u0437\u0430\u0445\u043E\u0434\u0443 \u0441\u043E\u043D\u0446\u044F (~20 \u0445\u0432) \u0442\u0430 \u043F\u043E\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F \u0442\u0456\u0454\u044E \u0441\u0430\u043C\u043E\u044E \u0441\u0442\u0435\u0436\u043A\u043E\u044E \u0434\u043E \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438.") : localize(" Hike PR1.2 from Achada do Teixeira car park to Pico Ruivo (1,862 m), watch the sunset (~20 min), then return along the same trail to the car park.") : '';
            const boatSuffix = stop.slug === 'madeira-sea-emotions' && stop.boatDirection === 'officeToCafe'
                ? (locale === 'uk' ? localize(" PR8 \u2013 Vereda da Ponta de S\u00E3o Louren\u00E7o + \u0435\u043A\u0441\u043A\u0443\u0440\u0441\u0456\u0439\u043D\u0438\u0439 \u0447\u043E\u0432\u0435\u043D \u0434\u043E \u043C\u0430\u044F\u043A\u0430: \u043E\u0444\u0456\u0441 Madeira Sea Emotions \u2192 Casa de Sardinha, \u043F\u043E\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F \u043F\u0456\u0448\u043A\u0438 \u0434\u043E \u043E\u0444\u0456\u0441\u0443. \u0412\u0430\u0440\u0442\u0456\u0441\u0442\u044C \u0435\u043A\u0441\u043A\u0443\u0440\u0441\u0456\u0457 \u2014 30 \u20AC.") : localize(" PR8 \u2013 Vereda da Ponta de S\u00E3o Louren\u00E7o + lighthouse boat excursion: Madeira Sea Emotions office \u2192 Casa de Sardinha, walk back to the office. Tour price: \u20AC30."))
                : stop.slug === 'ponta-de-sao-lourenco' && stop.boatDirection === 'cafeToOffice'
                    ? (locale === 'uk' ? localize(" + \u0435\u043A\u0441\u043A\u0443\u0440\u0441\u0456\u0439\u043D\u0438\u0439 \u0447\u043E\u0432\u0435\u043D \u0434\u043E \u043C\u0430\u044F\u043A\u0430: \u0441\u043F\u0435\u0440\u0448\u0443 \u043F\u0456\u0448\u043A\u0438 \u0432\u0456\u0434 \u0441\u0442\u0430\u0440\u0442\u0443 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0443 \u0434\u043E Casa de Sardinha, \u043F\u043E\u0442\u0456\u043C \u0447\u043E\u0432\u043D\u043E\u043C \u0447\u0435\u0440\u0435\u0437 \u043C\u0430\u044F\u043A \u0434\u043E \u043E\u0444\u0456\u0441\u0443. \u0412\u0430\u0440\u0442\u0456\u0441\u0442\u044C \u0435\u043A\u0441\u043A\u0443\u0440\u0441\u0456\u0457 \u2014 30 \u20AC.") : localize(" + lighthouse boat excursion: first walk from the trail start to Casa de Sardinha, then take the boat via the lighthouse to the office. Tour price: \u20AC30."))
                    : '';
            const whaleSuffix = stop.slug === 'h2o-madeira' && stop.isWhaleTour ? locale === 'uk' ? localize(" \u041C\u043E\u0440\u0441\u044C\u043A\u0430 \u0435\u043A\u0441\u043A\u0443\u0440\u0441\u0456\u044F \u0434\u043B\u044F \u0441\u043F\u043E\u0441\u0442\u0435\u0440\u0435\u0436\u0435\u043D\u043D\u044F \u0437\u0430 \u0434\u0435\u043B\u044C\u0444\u0456\u043D\u0430\u043C\u0438 \u0442\u0430 \u043A\u0438\u0442\u0430\u043C\u0438 (\u0431\u043B\u0438\u0437\u044C\u043A\u043E 2 \u0433\u043E\u0434\u0438\u043D); \u0412\u0430\u0440\u0442\u0456\u0441\u0442\u044C \u2014 60\u20AC (\u043E\u043F\u043B\u0430\u0442\u0430 \u043B\u0438\u0448\u0435 \u0433\u043E\u0442\u0456\u0432\u043A\u043E\u044E).") : localize(" Whale and dolphin watching boat tour (about 2 hours), Tour price: \u20AC60 (cash only).") : '';
            const routeInstruction = stop.slug === 'levada-nova-levada-do-moinho' && stop.showRouteInstructions
                ? (locale === 'uk' ? localize("\u041E\u0431\u043E\u0432\u2019\u044F\u0437\u043A\u043E\u0432\u043E \u043F\u0440\u043E\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u0456\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0456\u044E, \u044F\u043A \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442\u0438 \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u2193") : localize("Please read the instructions for this route before setting out \u2193"))
                : '';
            lines.push(localizeFormat("__VAR_0__ __VAR_1__\u2013__VAR_2__ \u2014 __VAR_3____VAR_4____VAR_5____VAR_6____VAR_7____VAR_8____VAR_9__", icon, stop.arrivalTime, endTime, location.tags.includes("Restaurants") ? restaurantStopTitle(localize(location.name), stop.arrivalTime, translationLanguage) : localize(location.name), boatSuffix.startsWith(' +') ? '' : '.', sunriseSuffix, sunsetSuffix, boatSuffix, whaleSuffix, cristovaoSuffix), ...(routeInstruction ? [routeInstruction] : []), `https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/explore/${location.slug}`, '');
        });
        const lastStop = stops[stops.length - 1];
        const lastStopEndTime = lastStop ? addMinutes(lastStop.arrivalTime, lastStop.durationMinutes) : departureTime;
        const returnArrivalTime = addMinutes(lastStopEndTime, returnTravelMinutes);
        const finalAirportStop = isAirportFinal && lastStop?.slug === airportStartPoint.slug && lastStop.isLastDay;
        if (lastStop && !finalAirportStop)
            lines.push(travelLine(lastStopEndTime, stopName(lastStop), returnTravelMinutes), "");
        if (isAirportFinal && !finalAirportStop) {
            lines.push(localizeFormat("\u2708\uFE0F __VAR_0__ \u2014 __VAR_1__", returnArrivalTime, locale === 'uk' ? localize("\u041F\u0440\u0438\u0431\u0443\u0442\u0442\u044F \u0434\u043E \u041C\u0456\u0436\u043D\u0430\u0440\u043E\u0434\u043D\u043E\u0433\u043E \u0430\u0435\u0440\u043E\u043F\u043E\u0440\u0442\u0443 \u041C\u0430\u0434\u0435\u0439\u0440\u0438.") : localize("Arrival at Madeira International Airport.")), `https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/explore/${airportStartPoint.slug}`);
        }
        else if (!finalAirportStop) {
            lines.push(localizeFormat("\uD83C\uDFE1 __VAR_0__ \u2014 __VAR_1__ __VAR_2__.", returnArrivalTime, text.return, finalPointName));
        }
        if (finalStay)
            lines.push(`https://madeiralivecams.com${translationLanguage === "en" ? "" : "/" + translationLanguage}/stays/${finalStay.slug}`);
        if (recommendationLines.length > 0)
            lines.push('', locale === 'uk' ? localize("\u0420\u0415\u041A\u041E\u041C\u0415\u041D\u0414\u0410\u0426\u0406\u0407 \u041D\u0410 \u0414\u0415\u041D\u042C") : localize("DAY RECOMMENDATIONS"), '', ...recommendationLines);
        return (calculated ? "" : (locale === "uk" ? localize("\u041F\u041E\u041F\u0415\u0420\u0415\u0414\u041D\u0406\u0419 \u041F\u041B\u0410\u041D \u2014 \u0447\u0430\u0441 \u0443 \u0434\u043E\u0440\u043E\u0437\u0456 \u0449\u0435 \u043D\u0435 \u0440\u043E\u0437\u0440\u0430\u0445\u043E\u0432\u0430\u043D\u043E.\n\n") : localize("DRAFT \u2014 travel times have not been calculated.\n\n"))) + lines.join("\n");
    }, [date, departureTime, endAtStart, finalPointName, isAirportFinal, isCustomStart, locale, locationBySlug, recommendationLines, returnTravelMinutes, selectedEndVilla, selectedVilla, stops, text.return, calculated, hasRoute, startCoordinates, finalCoordinates, startPointName, isAirportStart]);
    const shareProgramme = async () => {
        if (!programme)
            return;
        const shareNavigator = navigator as Navigator & {
            share?: (data: {
                title: string;
                text: string;
            }) => Promise<void>;
        };
        if (shareNavigator.share) {
            try {
                await shareNavigator.share({
                    title: text.title,
                    text: localize(programme),
                });
                return;
            }
            catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError')
                    return;
            }
        }
        await navigator.clipboard.writeText(localize(programme));
        setCopyStatus('copied');
        window.setTimeout(() => setCopyStatus('idle'), 2000);
    };
    return <Layout><Head><title>{[localize(text.title), localize(" | Madeira Live Cams")].join("")}</title><meta name="description" content={localize(text.intro)}/><meta property="og:title" content={[localize(text.title), localize(" | Madeira Live Cams")].join("")}/><meta property="og:description" content={localize(text.intro)}/><meta property="og:type" content="website"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content={[localize(text.title), localize(" | Madeira Live Cams")].join("")}/><meta name="twitter:description" content={localize(text.intro)}/></Head><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8"><section className="min-w-0"><TripPlanHero><p className="text-sm font-semibold uppercase tracking-wider text-ocean">{localize("Madeira Live Cams")}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">{localize(text.title)}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-600">{localize(text.intro)}</p></TripPlanHero>
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-lg font-bold text-navy">{localize(text.dayDetails)}</h2><div className="mt-4 grid gap-4 sm:grid-cols-4"><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{localize(text.date)}<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"/></label><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{localize(text.startVilla)}<select value={startPoint} onChange={(event) => {
            const value = event.target.value;
            setStartPoint(value);
            if (value === airportStartPoint.slug)
                setDepartureTime('17:00');
            else {
                setDepartureTime('09:00');
                if (value !== customStartPoint)
                    setVilla(value);
            }
        }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"><option value={airportStartPoint.slug}>{localize(locale === 'uk' ? 'Аеропорт Мадейри' : 'Madeira Airport')}</option>{localize(villas.map((item) => <option key={item.slug} value={item.slug}>{localize(item.name)}</option>))}<option value={customStartPoint}>{localize(locale === 'uk' ? 'Довільна точка' : 'Custom point')}</option></select></label><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{localize(text.departure)}<input type="time" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"/></label><label className="flex min-h-11 cursor-pointer items-center gap-2 self-end rounded-lg border border-ocean/30 bg-white px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={endAtStart} onChange={(event) => setEndAtStart(event.target.checked)} className="h-4 w-4 shrink-0 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize(text.endAtStart)}</label></div>{localize(isCustomStart && <CustomDayPoint id="custom-start" value={customPointInput} onChange={setCustomPointInput} onAdd={() => {
                if (customCoordinates.point)
                    setCustomStartForRoute(customCoordinates.point);
            }} isAdded={customCoordinates.point?.latitude === customStartForRoute?.latitude && customCoordinates.point?.longitude === customStartForRoute?.longitude} locale={locale} resolution={customCoordinates}/>)}{localize(!endAtStart && <div className="mt-4"><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{localize(text.endPoint)}<select value={endPoint} onChange={(event) => setEndPoint(event.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"><option value={airportStartPoint.slug}>{localize(locale === 'uk' ? 'Аеропорт Мадейри' : 'Madeira Airport')}</option>{localize(villas.map((item) => <option key={item.slug} value={item.slug}>{localize(item.name)}</option>))}<option value={customStartPoint}>{localize(locale === 'uk' ? 'Довільна точка' : 'Custom point')}</option></select></label>{localize(isCustomEnd && <CustomDayPoint id="custom-end" value={endCustomPointInput} onChange={setEndCustomPointInput} onAdd={() => {
                    if (endCustomCoordinates.point)
                        setCustomEndForRoute(endCustomCoordinates.point);
                }} isAdded={endCustomCoordinates.point?.latitude === customEndForRoute?.latitude && endCustomCoordinates.point?.longitude === customEndForRoute?.longitude} locale={locale} resolution={endCustomCoordinates}/>)}</div>)}</div>
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-lg font-bold text-navy">{localize(text.addStop)}</h2><div className="mt-4"><p className="text-sm font-semibold text-navy">{localize(text.locationFilters)}</p><div className="mt-2 flex gap-2 overflow-x-auto pb-2">{localize(locationFilters.map((filter) => <button key={filter.value} type="button" onClick={() => { setLocationFilter(filter.value); setSelectedSlug(''); }} className={`shrink-0 rounded-full border px-3 py-2 text-sm font-medium transition ${locationFilter === filter.value ? 'border-ocean bg-ocean text-white' : 'border-slate-200 bg-white text-navy hover:border-ocean hover:text-ocean'}`}>{localize(filter.label)}</button>))}</div></div><div className="mt-3">
  <><label className="flex min-w-[150px] flex-1 flex-col gap-1.5 text-sm font-semibold text-navy">{localize(text.location)}<select value={selectedSlug} onChange={(event) => { setSelectedSlug(event.target.value); setGoogleMapsUrlError(''); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"><option value="">{localize(text.chooseLocation)}</option><option value={customRoutePoint}>{localize(locale === 'uk' ? 'Інша локація' : 'Other location')}</option>{localize(availableLocations.map((location) => <option key={location.slug} value={location.slug}>{localize(location.name)}</option>))}</select></label><RestaurantPlannerDetails slug={selectedSlug} locale={locale} preview/></>
      <button type="button" onClick={addLocation} disabled={!selectedSlug} aria-label={localize(text.addLocation)} title={localize(text.addLocation)} className="mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-ocean text-lg font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40 sm:self-end">{localize("+")}{localize('\u{1F4CD}')}
    </button>
    </div>
  </div>{localize(selectedSlug === customRoutePoint && <div className="mt-4 rounded-xl border border-ocean/30 bg-ocean/5 p-3"><label className="flex flex-col gap-1.5 text-sm font-semibold text-navy">{localize(locale === 'uk' ? 'Посилання Google Maps' : 'Google Maps link')}<input value={googleMapsUrl} onChange={(event) => setGoogleMapsUrl(event.target.value)} placeholder={localize("https://maps.app.goo.gl/...")} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-navy"/></label>{localize(googleMapsUrlError && <p className="mt-2 text-xs font-medium text-red-600">{localize(googleMapsUrlError)}</p>)}<p className="mt-2 text-xs text-slate-500">{localize(locale === 'uk' ? 'Вставте коротке або повне посилання Google Maps, потім натисніть «Додати локацію».' : 'Paste a short or full Google Maps link, then press Add location.')}</p></div>)}<section className="mt-6"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-navy">{localize(text.selectedStops)}</h2>{localize(routeStatus === 'loading' && <span className="text-xs font-semibold text-slate-500">{localize(locale === 'uk' ? 'Оновлюємо час у дорозі…' : 'Updating travel times…')}</span>)}{localize(stops.length > 0 && <button type="button" onClick={() => { setStops([]); setRecommendations({ ...emptyRecommendations }); }} className="text-sm font-semibold text-slate-500 hover:text-ocean">{localize(text.clear)}</button>)}</div>{localize(stops.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm leading-6 text-slate-500">{localize(text.noStops)}</p> : <div className="mt-3 space-y-3">{localize(stops.map((stop, index) => {
                const location = stop.slug ? locationBySlug.get(stop.slug) : undefined;
                const name = location?.tags.includes("Restaurants") ? restaurantStopTitle(location.name, stop.arrivalTime, translationLanguage) : stop.type === 'custom' ? (stop.name ?? (locale === 'uk' ? 'Інша локація' : 'Other location')) : stop.type === 'villa' ? selectedVilla.name : location?.name ?? '';
                const icon = stop.type === 'custom' ? '📍' : stop.type === 'villa' ? '🏡' : location ? getRouteStopIcon(location) : '📍';
                const canSelectSunrise = stop.type === 'location' && stop.slug === 'pico-do-arieiro';
                return <article key={stop.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">{localize(index + 1)}</span><div className="min-w-0 flex-1"><><p className="font-bold text-navy">{localize(icon)} {localize(name)}</p><RestaurantPlannerDetails slug={stop.slug} locale={locale}/></><p className="mt-1 text-xs text-slate-500">{localize(durationLabel(stop.durationMinutes, translationLanguage))}</p></div><button type="button" onClick={() => removeStop(stop.id)} aria-label={localize(text.remove)} className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">{localize("\u00D7")}</button></div><div className="mt-4 grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">{localize(text.arrival)}<input type="time" value={stop.arrivalTime} readOnly className="min-h-10 rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-navy"/></label><label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">{localize(text.duration)}<select value={stop.durationMinutes} onChange={(event) => updateStop(stop.id, { durationMinutes: Number(event.target.value) })} className="min-h-10 rounded-lg border border-slate-300 px-2 text-sm text-navy focus:border-ocean focus:outline-none">{localize(durationOptions.map((minutes) => <option key={minutes} value={minutes}>{localize(durationLabel(minutes, translationLanguage))}</option>))}</select></label></div>{localize(canSelectSunrise && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.isSunrise)} onChange={(event) => updateStop(stop.id, { isSunrise: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/><span>{localize("\uD83C\uDF05 ")}{localize(text.sunrise)}</span></label>)}
                    {localize(stop.slug === 'pico-ruivo' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.isSunset)} onChange={(event) => updateStop(stop.id, { isSunset: event.target.checked, durationMinutes: event.target.checked ? 120 : 90 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF07 ")}{localize(locale === 'uk' ? 'Захід сонця' : 'Sunset')}</label>)}
                    {localize(stop.slug === 'levada-nova-levada-do-moinho' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.showRouteInstructions)} onChange={(event) => updateStop(stop.id, { showRouteInstructions: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83D\uDCD6 ")}{localize(locale === 'uk' ? 'Інструкція по маршруту' : 'Route instructions')}</label>)}
                    {localize(stop.slug === 'madeira-sea-emotions' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={stop.boatDirection === 'officeToCafe'} onChange={(event) => updateStop(stop.id, { boatDirection: event.target.checked ? 'officeToCafe' : undefined, durationMinutes: event.target.checked ? 150 : 180 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83D\uDEA4 ")}{localize(locale === 'uk' ? 'Офіс → кафе' : 'Office → café')}</label>)}
                    {localize(stop.slug === 'ponta-de-sao-lourenco' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={stop.boatDirection === 'cafeToOffice'} onChange={(event) => updateStop(stop.id, { boatDirection: event.target.checked ? 'cafeToOffice' : undefined, durationMinutes: event.target.checked ? 150 : 180 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83D\uDEA4 ")}{localize(locale === 'uk' ? 'Кафе → офіс' : 'Café → office')}</label>)}
                    {localize(stop.slug === 'h2o-madeira' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.isWhaleTour)} onChange={(event) => updateStop(stop.id, { isWhaleTour: event.target.checked, durationMinutes: event.target.checked ? 120 : 150 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83D\uDC2C ")}{localize(locale === 'uk' ? 'Морська екскурсія до дельфінів і китів' : 'Whale and dolphin watching tour')}</label>)}
                    {localize(stop.slug === 'madeira-international-airport' && <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.isLastDay)} onChange={(event) => {
                            updateStop(stop.id, { isLastDay: event.target.checked });
                            if (event.target.checked) {
                                setEndAtStart(false);
                                setEndPoint(airportStartPoint.slug);
                            }
                        }} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83E\uDDF3 ")}{localize(locale === 'uk' ? 'Останній день · виліт групи' : 'Final day · group departure')}</label>)}
                    {localize(stop.type === 'location' && stop.slug === 'miradouro-sao-cristovao' && <div className="mt-4 grid grid-cols-2 gap-2"><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.hasCristovaoBar)} onChange={(event) => updateStop(stop.id, { hasCristovaoBar: event.target.checked, durationMinutes: event.target.checked || stop.hasCristovaoRestaurant ? 90 : 30 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83E\uDD64 ")}{localize(text.bar)}</label><label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(stop.hasCristovaoRestaurant)} onChange={(event) => updateStop(stop.id, { hasCristovaoRestaurant: event.target.checked, durationMinutes: event.target.checked || stop.hasCristovaoBar ? 90 : 30 })} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF7D\uFE0F ")}{localize(text.restaurantOption)}</label></div>)}<div className="mt-3 flex gap-2"><button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">{localize("\u2191 ")}{localize(text.up)}</button><button type="button" onClick={() => moveStop(index, 1)} disabled={index === stops.length - 1} className="min-h-10 flex-1 rounded-lg border border-slate-200 text-xs font-bold text-navy transition hover:border-ocean hover:text-ocean disabled:opacity-35">{localize("\u2193 ")}{localize(text.down)}</button></div></article>;
            }))}</div>)}{localize(hasRoute && <PlannerRouteFinish locale={locale} name={finalPointName} airport={isAirportFinal} arrival={endsAtAirportStop ? stops[stops.length - 1].arrivalTime : addMinutes(finalDeparture, returnTravelMinutes)} travel={durationLabel(endsAtAirportStop ? 0 : returnTravelMinutes, translationLanguage)} calculated={calculated} error={routeError}/>)}</section>
    {localize(stops.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="text-xl font-bold text-navy">{localize(text.recommendations)}</h2><p className="mt-1 text-sm text-slate-500">{localize(locale === 'uk' ? 'Оберіть рекомендації, які потрібно додати до готової програми.' : 'Choose recommendations to add to the ready programme.')}</p><div className="mt-4 grid gap-2 sm:grid-cols-2"><label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.weather} onChange={(event) => setRecommendations((current) => ({ ...current, weather: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF24\uFE0F ")}{localize(text.weather)}</label>{localize(hasBeach && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.beach} onChange={(event) => setRecommendations((current) => ({ ...current, beach: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDFD6\uFE0F ")}{localize(text.beach)}</label>)}{localize(hasLevada && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.levada} onChange={(event) => setRecommendations((current) => ({ ...current, levada: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF3F ")}{localize(text.levada)}</label>)}{localize(hasTrekking && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(recommendations.trekking)} onChange={(event) => setRecommendations((current) => ({ ...current, trekking: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83E\uDD7E ")}{localize(text.trekking)}</label>)}{localize(hasRestaurant && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.food} onChange={(event) => setRecommendations((current) => ({ ...current, food: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF7D\uFE0F ")}{localize(text.whatToTry)}</label>)}{localize(hasSunrise && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={recommendations.sunrise} onChange={(event) => setRecommendations((current) => ({ ...current, sunrise: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF05 ")}{localize(text.sunrise)}</label>)}{localize(hasFanal && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(recommendations.fanal)} onChange={(event) => setRecommendations((current) => ({ ...current, fanal: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83C\uDF33 ")}{localize(locale === 'uk' ? 'Ліс Фанал' : 'Fanal Forest')}</label>)}{localize(hasLastDay && <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-navy"><input type="checkbox" checked={Boolean(recommendations.lastDay)} onChange={(event) => setRecommendations((current) => ({ ...current, lastDay: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-ocean focus:ring-ocean"/>{localize("\uD83E\uDDF3 ")}{localize(locale === 'uk' ? 'Останній день' : 'Final day')}</label>)}</div></section>)}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div>
  <h2 className="text-xl font-bold text-navy">{localize(text.output)}</h2>
  <div className="mt-3 flex items-center gap-2">
    <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={calculateRoute} disabled={!hasRoute || !startCoordinates || needsEndPoint || routeStatus === "loading" || routeUsageStatus !== "ready" || !routeUsage || routeUsage.remaining <= 0} className="min-h-10 rounded-lg border border-ocean bg-white px-4 text-sm font-bold text-ocean transition hover:bg-ocean hover:text-white disabled:cursor-not-allowed disabled:opacity-50">{localize(routeStatus === 'loading' ? (locale === 'uk' ? '\u0420\u043e\u0437\u0440\u0430\u0445\u043e\u0432\u0443\u0454\u043c\u043e...' : 'Calculating...') : (locale === 'uk' ? '\u0420\u043e\u0437\u0440\u0430\u0445\u0443\u0432\u0430\u0442\u0438 \u043c\u0430\u0440\u0448\u0440\u0443\u0442' : 'Calculate route'))}</button><button type="button" onClick={shareProgramme} disabled={!programme} aria-label={localize(text.share)} title={localize(text.share)} className="flex min-h-10 w-11 shrink-0 items-center justify-center rounded-lg bg-ocean text-lg font-bold text-white transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40">
  {localize(copyStatus === 'copied' ? '\u2713' : '\u{1F5FA}\uFE0F')}
    </button></div>
  </div>
    </div><textarea readOnly value={localize(programme || text.defaultProgram)} className="mt-4 min-h-[260px] w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm leading-6 text-slate-700 focus:outline-none"/>
    <div className="mt-3 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-400">
  {localize(routeUsageStatus === 'loading' && (<span>
      {localize(locale === 'uk'
                ? '\u0417\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0443\u0454\u043c\u043e \u043b\u0456\u043c\u0456\u0442 Google Routes...'
                : 'Loading Google Routes limit...')}
    </span>))}

  {localize(routeUsageStatus === 'unavailable' && (<span>
      {localize(locale === 'uk'
                ? '\u041b\u0456\u0447\u0438\u043b\u044c\u043d\u0438\u043a Google Routes \u0442\u0438\u043c\u0447\u0430\u0441\u043e\u0432\u043e \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0438\u0439.'
                : 'Google Routes usage counter is temporarily unavailable.')}
    </span>))}

  {localize(routeUsageStatus === 'ready' && routeUsage && routeUsage.remaining > 0 && (<span>
      {localize(locale === 'uk'
                ? `Google Routes: \u0437\u0430\u043b\u0438\u0448\u0438\u043b\u043e\u0441\u044c ${routeUsage.remaining.toLocaleString()} \u0437 ${routeUsage.limit.toLocaleString()} \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0445 \u0437\u0432\u0435\u0440\u043d\u0435\u043d\u044c \u0446\u044c\u043e\u0433\u043e \u043c\u0456\u0441\u044f\u0446\u044f.`
                : localizeFormat("Google Routes: __VAR_0__ of __VAR_1__ free requests remain this month.", routeUsage.remaining.toLocaleString(), routeUsage.limit.toLocaleString()))}
    </span>))}

  {localize(routeUsageStatus === 'ready' && routeUsage && routeUsage.remaining <= 0 && (<span className="font-semibold text-red-600">
      {localize(locale === 'uk'
                ? '\u0411\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0438\u0439 \u043c\u0456\u0441\u044f\u0447\u043d\u0438\u0439 \u043b\u0456\u043c\u0456\u0442 Google Routes \u0432\u0438\u0447\u0435\u0440\u043f\u0430\u043d\u043e. \u041a\u043d\u043e\u043f\u043a\u0430 \u0440\u043e\u0437\u0440\u0430\u0445\u0443\u043d\u043a\u0443 \u0431\u0443\u0434\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043d\u0430 \u043f\u043e\u0447\u0430\u0442\u043a\u0443 \u043d\u0430\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u043c\u0456\u0441\u044f\u0446\u044f.'
                : 'The monthly Google Routes limit has been reached. Route calculation will be available again next month.')}
    </span>))}
    </div></section>
  </section></main></Layout>;
}
export const getStaticProps = translatedStaticProps("/trip-plan");
