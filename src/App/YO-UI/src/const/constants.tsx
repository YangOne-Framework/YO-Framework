import React from 'react';
import { NavLink, Service, Destination, Tour, Trek, GalleryImage, Testimonial, BlogPost, TourDetail, FAQ, UserProfile, UserBooking, RewardActivity, Invoice, DestinationDetail, Flight, Hotel, HotelDetail, CarRental, CarRentalDetail, SightseeingSpot, UserReview } from '../types/types';
import { slugify } from '../utils/helpers';

const MountainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.28-1.25-1.43-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.28-1.25 1.43-1.857M12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>;
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const MANASLU_TREK_ID = 'manaslu-circuit-trek';
const EBC_TREK_ID = 'everest-base-camp';
const PARIS_ID = 'romantic-paris-getaway';
const KYOTO_ID = 'ancient-temples-of-kyoto';
const ROME_ID = 'historical-wonders-of-rome';
const PHUKET_BEACHES_ID = 'phuket-beaches-and-islands';
const BANGKOK_TEMPLES_ID = 'bangkok-temples-and-river-cruise';
const CHIANG_MAI_ELEPHANTS_ID = 'chiang-mai-elephant-sanctuary';
const THAI_COOKING_CLASS_ID = 'thai-cooking-class-bangkok';
const KRABI_ISLAND_HOPPING_ID = 'krabi-four-island-hopping';
const AYUTTHAYA_DAY_TRIP_ID = 'ayutthaya-ancient-capital-day-trip';
const PAI_CANYON_ADVENTURE_ID = 'pai-canyon-and-waterfalls-adventure';
const RAILAY_BEACH_CLIMBING_ID = 'railay-beach-rock-climbing';
const FLOATING_MARKETS_ID = 'damnoen-saduak-floating-markets';
const KHAO_SOK_JUNGLE_ID = 'khao-sok-national-park-jungle-safari';
const HOTEL_PARIS_ID = 'grand-hotel-du-palais-royal';
const HOTEL_TOKYO_ID = 'park-hyatt-tokyo';
const CAR_TOYOTA_CAMRY_ID = 'toyota-camry-2023';


export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Treks & Tours',
    href: '#',
    megaMenu: [
      {
        title: 'Popular Treks',
        links: [
          { label: 'Manaslu Circuit Trek', href: `/trek/${MANASLU_TREK_ID}` },
          { label: 'Everest Base Camp', href: `/trek/${EBC_TREK_ID}` },
          { label: 'Annapurna Circuit', href: '/trek/annapurna-circuit' },
        ],
      },
       {
        title: 'Popular Tours',
        links: [
          { label: 'Romantic Paris Getaway', href: `/tour/${PARIS_ID}` },
          { label: 'Temples of Kyoto', href: `/tour/${KYOTO_ID}` },
          { label: 'Wonders of Rome', href: `/tour/${ROME_ID}` },
        ],
      },
      {
        title: 'Destinations',
        links: [
          { label: 'Nepal', href: '/destinations/nepal' },
          { label: 'Thailand', href: '/destinations/thailand' },
          { label: 'Peru', href: '/destinations/peru' },
          { label: 'France', href: '/destinations/france' },
          { label: 'All Destinations', href: '/destinations' },
        ],
      },
    ],
  },
  { label: 'Trip Planner', href: '/trip-planner' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const SERVICES_DATA: Service[] = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: 'Wide Range of Tours',
        description: 'We offer a wide range of tours to suit every traveler\'s needs, from relaxing beach vacations to adventurous mountain treks.'
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>,
        title: 'Best Price Guarantee',
        description: 'We guarantee the best prices for our tours. If you find a lower price elsewhere, we will match it.'
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        title: '24/7 Customer Support',
        description: 'Our customer support team is available 24/7 to assist you with any questions or concerns you may have.'
    }
];

export const DESTINATIONS_DATA: Destination[] = [
    { name: 'Thailand', tours: 10, image: 'https://picsum.photos/seed/thailand/400/600' },
    { name: 'Italy', tours: 8, image: 'https://picsum.photos/seed/italy/400/600' },
    { name: 'Peru', tours: 12, image: 'https://picsum.photos/seed/peru/400/600' },
    { name: 'Japan', tours: 7, image: 'https://picsum.photos/seed/japan/400/600' },
    { name: 'Switzerland', tours: 15, image: 'https://picsum.photos/seed/switzerland/400/600' },
    { name: 'Australia', tours: 9, image: 'https://picsum.photos/seed/australia/400/600' },
    { name: 'Brazil', tours: 6, image: 'https://picsum.photos/seed/brazil/400/600' },
    { name: 'Egypt', tours: 8, image: 'https://picsum.photos/seed/egypt/400/600' },
    { name: 'Canada', tours: 11, image: 'https://picsum.photos/seed/canada/400/600' },
];

export const TOURS_DATA: Tour[] = [
    {
        id: PARIS_ID,
        image: 'https://picsum.photos/seed/tour1/400/300',
        price: 1200,
        location: 'Paris, France',
        duration: '7 Days',
        title: 'Romantic Paris Getaway',
        rating: 5,
        reviews: 150,
        tags: ['culture', 'history', 'food', 'relaxation'],
    },
    {
        id: KYOTO_ID,
        image: 'https://picsum.photos/seed/tour2/400/300',
        price: 2500,
        location: 'Kyoto, Japan',
        duration: '10 Days',
        title: 'Ancient Temples of Kyoto',
        rating: 4,
        reviews: 120,
        tags: ['culture', 'history'],
    },
    {
        id: ROME_ID,
        image: 'https://picsum.photos/seed/tour3/400/300',
        price: 1800,
        location: 'Rome, Italy',
        duration: '5 Days',
        title: 'Historical Wonders of Rome',
        rating: 5,
        reviews: 200,
        tags: ['history', 'culture', 'food'],
    },
    { id: PHUKET_BEACHES_ID, image: 'https://picsum.photos/seed/phuket/400/300', price: 850, location: 'Phuket, Thailand', duration: '5 Days', title: 'Phuket Beaches & Islands Hopping', rating: 5, reviews: 210, tags: ['beach', 'relaxation', 'adventure'] },
    { id: BANGKOK_TEMPLES_ID, image: 'https://picsum.photos/seed/bangkok/400/300', price: 450, location: 'Bangkok, Thailand', duration: '3 Days', title: 'Bangkok Temples & River Cruise', rating: 4, reviews: 180, tags: ['culture', 'history'] },
    { id: CHIANG_MAI_ELEPHANTS_ID, image: 'https://picsum.photos/seed/chiangmai/400/300', price: 600, location: 'Chiang Mai, Thailand', duration: '4 Days', title: 'Chiang Mai Elephant Sanctuary & Culture', rating: 5, reviews: 300, tags: ['nature', 'culture', 'adventure'] },
    { id: THAI_COOKING_CLASS_ID, image: 'https://picsum.photos/seed/cooking/400/300', price: 120, location: 'Bangkok, Thailand', duration: '1 Day', title: 'Authentic Thai Cooking Class', rating: 5, reviews: 95, tags: ['food', 'culture'] },
    { id: KRABI_ISLAND_HOPPING_ID, image: 'https://picsum.photos/seed/krabi/400/300', price: 950, location: 'Krabi, Thailand', duration: '6 Days', title: 'Krabi Four Islands Hopping Adventure', rating: 4, reviews: 155, tags: ['beach', 'adventure', 'nature'] },
    { id: AYUTTHAYA_DAY_TRIP_ID, image: 'https://picsum.photos/seed/ayutthaya/400/300', price: 150, location: 'Bangkok, Thailand', duration: '1 Day', title: 'Ayutthaya Ancient Capital Day Trip', rating: 4, reviews: 110, tags: ['history', 'culture'] },
    { id: PAI_CANYON_ADVENTURE_ID, image: 'https://picsum.photos/seed/pai/400/300', price: 550, location: 'Pai, Thailand', duration: '3 Days', title: 'Pai Canyon & Waterfalls Adventure', rating: 5, reviews: 130, tags: ['nature', 'adventure', 'hiking'] },
    { id: RAILAY_BEACH_CLIMBING_ID, image: 'https://picsum.photos/seed/railay/400/300', price: 200, location: 'Krabi, Thailand', duration: '1 Day', title: 'Railay Beach Rock Climbing Experience', rating: 5, reviews: 88, tags: ['adventure', 'beach'] },
    { id: FLOATING_MARKETS_ID, image: 'https://picsum.photos/seed/floatingmarket/400/300', price: 90, location: 'Bangkok, Thailand', duration: '1 Day', title: 'Damnoen Saduak Floating Markets Tour', rating: 4, reviews: 250, tags: ['culture', 'food'] },
    { id: KHAO_SOK_JUNGLE_ID, image: 'https://picsum.photos/seed/khaosok/400/300', price: 780, location: 'Surat Thani, Thailand', duration: '3 Days', title: 'Khao Sok National Park Jungle Safari', rating: 5, reviews: 190, tags: ['nature', 'adventure'] },
];

export const TOURS_DETAIL_DATA: TourDetail[] = [
    {
        id: PARIS_ID,
        title: 'Romantic Paris Getaway',
        image: 'https://picsum.photos/seed/paris-main/1920/1080',
        price: 1200,
        location: 'Paris, France',
        duration: '7 Days',
        rating: 5,
        reviews: 150,
        overview: 'Experience the magic of Paris on this romantic 7-day tour. From the iconic Eiffel Tower to the charming streets of Montmartre, you\'ll fall in love with the City of Light. Enjoy gourmet dining, Seine river cruises, and visits to world-class museums like the Louvre. This curated experience is perfect for couples and art lovers alike.',
        included: ['4-star hotel accommodation', 'Daily breakfast', 'Airport transfers', 'Seine river cruise dinner', 'Louvre Museum entry ticket', 'Guided city tour'],
        excluded: ['International airfare', 'Lunches and dinners (except where specified)', 'Personal expenses', 'Travel insurance'],
        gallery: [
            'https://picsum.photos/seed/paris-gal1/800/600',
            'https://picsum.photos/seed/paris-gal2/800/600',
            'https://picsum.photos/seed/paris-gal3/800/600',
            'https://picsum.photos/seed/paris-gal4/800/600',
        ],
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83998.75769370212!2d2.277019658257088!3d48.8589506813295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e1f06e2b70f%3A0x40b82c3688c9460!2sParis%2C%20France!5e0!3m2!1sen!2snp!4v1678886455124!5m2!1sen!2snp',
        faqs: [
            { question: 'What is the best time to visit Paris?', answer: 'Spring (April-June) and Fall (September-October) are the best times to visit Paris, with pleasant weather and fewer crowds than the summer peak.' },
            { question: 'Is the Louvre ticket a skip-the-line ticket?', answer: 'Yes, the included ticket allows you to bypass the main ticket queue, saving you valuable time.' }
        ],
        tags: ['culture', 'history', 'food', 'relaxation'],
    },
    {
        id: PHUKET_BEACHES_ID,
        title: 'Phuket Beaches & Islands Hopping',
        image: 'https://picsum.photos/seed/phuket-main/1920/1080',
        price: 850,
        location: 'Phuket, Thailand',
        duration: '5 Days',
        rating: 5,
        reviews: 210,
        overview: 'Discover the tropical paradise of Phuket with our 5-day beach and island hopping tour. Explore famous spots like Maya Bay and the Phi Phi Islands, snorkel in crystal-clear waters, and relax on pristine white-sand beaches. This tour is perfect for sun-seekers and adventure lovers.',
        included: ['Airport transfers', '4-star resort accommodation', 'Daily breakfast', 'Speedboat island hopping tour to Phi Phi Islands', 'Snorkeling equipment', 'National Park fees'],
        excluded: ['International airfare', 'Lunches and dinners', 'Personal expenses', 'Travel insurance'],
        gallery: [
            'https://picsum.photos/seed/phuket-gal1/800/600',
            'https://picsum.photos/seed/phuket-gal2/800/600',
            'https://picsum.photos/seed/phuket-gal3/800/600',
            'https://picsum.photos/seed/phuket-gal4/800/600',
        ],
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d505703.9772986423!2d98.0577732296875!3d7.970222899999992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x305031e17a43586d%3A0x102202358358480!2sPhuket%2C%20Thailand!5e0!3m2!1sen!2snp!4v1680512948639!5m2!1sen!2snp',
        faqs: [
            { question: 'What is the best time to visit Phuket?', answer: 'The best time to visit Phuket is during the dry season, from November to April, when the weather is sunny and the seas are calm.' },
            { question: 'Is this tour suitable for families with children?', answer: 'Yes, this tour is family-friendly. However, the speedboat ride can be bumpy, so it may not be suitable for very young infants.'}
        ],
        tags: ['beach', 'relaxation', 'adventure', 'nature'],
    },
];


export const TREKS_DATA: Trek[] = [
    {
        id: MANASLU_TREK_ID,
        title: 'Manaslu Circuit Trek',
        image: 'https://picsum.photos/seed/manaslu-main/1920/1080',
        price: 1550,
        duration: '17 Days',
        difficulty: 'Strenuous',
        rating: 5,
        reviews: 189,
        overview: 'The Manaslu Circuit Trek is a stunning 17-day journey through the remote and restricted region of Nepal. It offers a unique opportunity to experience pristine Himalayan nature and rich Tibetan-influenced culture. The trek circumnavigates the majestic Mount Manaslu, the eighth highest peak in the world, and culminates in crossing the challenging Larkya La Pass. This less-crowded alternative to the Annapurna Circuit provides an authentic and adventurous trekking experience.',
        tripFacts: [
            { icon: <MountainIcon />, label: 'Max Altitude', value: '5,106m (Larkya La Pass)'},
            { icon: <CalendarIcon />, label: 'Trip Duration', value: '17 Days'},
            { icon: <UserGroupIcon />, label: 'Group Size', value: '2-12 People'},
            { icon: <SunIcon />, label: 'Best Seasons', value: 'Mar-May, Sep-Nov'},
            { icon: <HomeIcon />, label: 'Accommodation', value: 'Teahouse / Lodge'},
        ],
        itinerary: [
             { day: 1, title: 'Arrival in Kathmandu', altitude: '1,400m', duration: 'N/A', meals: 'Dinner', description: 'Upon arrival at Tribhuvan International Airport, our representative will greet you and transfer you to your hotel. In the evening, there will be a welcome dinner and a briefing about the trek.', image: 'https://picsum.photos/seed/day1/800/400' },
            { day: 2, title: 'Drive to Machha Khola', altitude: '930m', duration: '8-9 hours drive', meals: 'Breakfast, Lunch, Dinner', description: 'An early morning scenic drive from Kathmandu takes us towards the western mountains. We drive through winding roads along the Trishuli River, eventually reaching the starting point of our trek, Machha Khola.', image: 'https://picsum.photos/seed/day2/800/400' },
            { day: 3, title: 'Trek to Jagat', altitude: '1,340m', duration: '6-7 hours', meals: 'Breakfast, Lunch, Dinner', description: 'The trail today follows the Budi Gandaki River, passing through small villages, terraced fields, and waterfalls. We cross several suspension bridges before reaching the village of Jagat, the entry point to the restricted Manaslu region.', image: 'https://picsum.photos/seed/day3/800/400' },
            { day: 4, title: 'Trek to Deng', altitude: '1,860m', duration: '6-7 hours', meals: 'Breakfast, Lunch, Dinner', description: 'We continue our trek, entering a region of Tibetan-influenced culture. The trail involves some steep sections and offers beautiful views of the Sringi Himal. We pass through forests of bamboo and rhododendron before reaching Deng.', image: 'https://picsum.photos/seed/day4/800/400' },
            { day: 5, title: 'Trek to Namrung', altitude: '2,630m', duration: '6-7 hours', meals: 'Breakfast, Lunch, Dinner', description: 'Today\'s trek involves crossing the Budi Gandaki river multiple times. We pass through several Mani walls and chortens, indicative of the strong Buddhist culture. The trail climbs steadily, and we are rewarded with views of Ganesh Himal as we reach Namrung.', image: 'https://picsum.photos/seed/day5/800/400' },
            { day: 6, title: 'Trek to Samagaon', altitude: '3,530m', duration: '6-7 hours', meals: 'Breakfast, Lunch, Dinner', description: 'The landscape starts to change as we gain altitude. We trek through alpine forests and are treated to the first spectacular views of Mount Manaslu. We pass through the villages of Lho and Shyala before arriving at Samagaon, a large village with a monastery.', image: 'https://picsum.photos/seed/day6/800/400' },
            { day: 7, title: 'Acclimatization Day in Samagaon', altitude: '3,530m', duration: '4-5 hours hike', meals: 'Breakfast, Lunch, Dinner', description: 'To acclimatize properly, we spend a day in Samagaon. We can take a side trip to Pungyen Gompa or hike up to Manaslu Base Camp for breathtaking views of the surrounding peaks and glaciers. This helps our bodies adjust to the high altitude.', image: 'https://picsum.photos/seed/day7/800/400' },
            { day: 8, title: 'Trek to Samdo', altitude: '3,860m', duration: '3-4 hours', meals: 'Breakfast, Lunch, Dinner', description: 'A shorter trek today allows for further acclimatization. The trail passes through juniper and birch forests. Samdo is a Tibetan refugee village, and we have the afternoon to explore and interact with the locals.', image: 'https://picsum.photos/seed/day8/800/400' },
            { day: 9, title: 'Trek to Dharamsala (Larkya Phedi)', altitude: '4,460m', duration: '4-5 hours', meals: 'Breakfast, Lunch, Dinner', description: 'We continue our ascent towards the Larkya La Pass. The trail is rugged, and the landscape becomes more barren. Dharamsala, also known as Larkya Phedi, is a basic seasonal settlement that serves as the base for the pass crossing.', image: 'https://picsum.photos/seed/day9/800/400' },
            { day: 10, title: 'Cross Larkya La Pass, Trek to Bimthang', altitude: '5,106m (pass), 3,720m (Bimthang)', duration: '8-10 hours', meals: 'Breakfast, Lunch, Dinner', description: 'The most challenging day of the trek. We start early in the morning to cross the Larkya La Pass (5,106m). The ascent is gradual but long and demanding. From the top, we are rewarded with panoramic views of Himlung Himal, Cheo Himal, Kang Guru, and Annapurna II. The descent to Bimthang is steep and long.', image: 'https://picsum.photos/seed/day10/800/400' },
            { day: 11, title: 'Trek to Tilije', altitude: '2,300m', duration: '5-6 hours', meals: 'Breakfast, Lunch, Dinner', description: 'We descend through pine and rhododendron forests, enjoying beautiful views of the mountains behind us. The trail is much easier today as we lose significant altitude. Tilije is a large Gurung village.', image: 'https://picsum.photos/seed/day11/800/400' },
            { day: 12, title: 'Trek to Dharapani & Drive to Besisahar', altitude: '760m', duration: '4 hours trek, 3 hours drive', meals: 'Breakfast, Lunch, Dinner', description: 'A final short trek takes us to Dharapani, where we join the main Annapurna Circuit trail. From here, we take a jeep or bus along a bumpy road to Besisahar, the district headquarters of Lamjung.', image: 'https://picsum.photos/seed/day12/800/400' },
            { day: 13, title: 'Drive back to Kathmandu', altitude: '1,400m', duration: '6-7 hours drive', meals: 'Breakfast, Farewell Dinner', description: 'We take a scenic drive back to Kathmandu, following the Marshyangdi and Trishuli rivers. Upon arrival, you will be transferred to your hotel. In the evening, we will have a farewell dinner to celebrate the successful completion of our trek.', image: 'https://picsum.photos/seed/day13/800/400' },
            { day: 14, title: 'Departure', altitude: '1,400m', duration: 'N/A', meals: 'Breakfast', description: 'Our adventure in Nepal comes to an end today. A representative will transfer you to the Tribhuvan International Airport for your flight back home.', image: 'https://picsum.photos/seed/day14/800/400' }
        ],
        included: ['Airport transfers', 'Accommodation in Kathmandu (3 nights)', 'All ground transportation as per itinerary', 'Trekking permits (ACAP, MCAP, Restricted Area)', 'Full board meals (Breakfast, Lunch, Dinner) during trek', 'Experienced, government-licensed guide and porters', 'All necessary government and local taxes', 'Farewell dinner in Kathmandu'],
        excluded: ['International airfare and Nepal visa fee', 'Lunch and dinner in Kathmandu', 'Travel and rescue insurance', 'Personal expenses (e.g., alcoholic drinks, hot showers, Wi-Fi)', 'Tips for guide and porters'],
        equipment: [
            { category: 'Head', items: ['Sun hat or scarf', 'Winter hat or insulating hat', 'Headlight with extra batteries'] },
            { category: 'Upper Body', items: ['T-shirts (moisture-wicking)', 'Thermal tops', 'Fleece jacket', 'Waterproof/windproof jacket', 'Down jacket'] },
            { category: 'Lower Body', items: ['Hiking shorts', 'Lightweight hiking pants', 'Fleece or woolen trousers', 'Waterproof shell pants'] },
            { category: 'Footwear', items: ['Hiking boots with ankle support', 'Camp shoes or sandals', 'Hiking socks (wool or synthetic)', 'Gaiters (for winter treks)'] },
            { category: 'Hands', items: ['Lightweight gloves', 'Heavyweight winter gloves'] },
            { category: 'Accessories', items: ['Sleeping bag (-15°C rated)', 'Trekking poles', 'Water bottles or hydration bladder', 'Sunglasses and sunscreen', 'First aid kit', 'Towel', 'Daypack (30-35L)'] }
        ],
        faqs: [
            { question: 'Is trekking permit required for Manaslu Circuit?', answer: 'Yes, you need three permits: Manaslu Restricted Area Permit, Manaslu Conservation Area Permit (MCAP), and Annapurna Conservation Area Permit (ACAP).' },
            { question: 'How difficult is the Manaslu Circuit Trek?', answer: 'The trek is considered strenuous due to its long duration, high altitude, and the challenging Larkya La Pass crossing. Good physical fitness and some prior trekking experience are recommended.' },
            { question: 'What is the accommodation like on the trek?', answer: 'Accommodation is in basic teahouses or lodges. Rooms are typically twin-sharing with basic bedding. Toilets are mostly shared and can be basic.' },
            { question: 'Is there internet access on the trek?', answer: 'Internet access (Wi-Fi) is available in some villages up to Samagaon, but it can be slow and unreliable. It\'s usually available for a small fee.' }
        ],
        gallery: [
            'https://picsum.photos/seed/manaslu-gal1/800/600',
            'https://picsum.photos/seed/manaslu-gal2/800/600',
            'https://picsum.photos/seed/manaslu-gal3/800/600',
            'https://picsum.photos/seed/manaslu-gal4/800/600',
            'https://picsum.photos/seed/manaslu-gal5/800/600',
            'https://picsum.photos/seed/manaslu-gal6/800/600',
        ],
        videoEmbedUrl: "https://www.youtube.com/embed/Sc6zD5F9bB8",
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224343.3444641364!2d84.45339247167993!3d28.53075904005898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995a5369c5e3f49%3A0x9543e1b4b8969fdf!2sManaslu!5e0!3m2!1sen!2snp!4v1678886455123!5m2!1sen!2snp",
        tags: ['adventure', 'hiking', 'nature', 'culture'],
    },
    {
        id: EBC_TREK_ID,
        title: 'Everest Base Camp Trek',
        image: 'https://picsum.photos/seed/trek1/400/300',
        price: 1800,
        duration: '14 Days',
        difficulty: 'Strenuous',
        rating: 5,
        reviews: 250,
        overview: 'The Everest Base Camp trek is one of the most famous trekking routes in the world. It offers a unique and unforgettable experience, with stunning views of the world\'s highest peaks.',
        tripFacts: [],
        itinerary: [
            { day: 1, title: 'Arrival in Kathmandu', description: 'Arrive at Tribhuvan International Airport, Kathmandu. Transfer to your hotel.' },
            { day: 2, title: 'Fly to Lukla, Trek to Phakding', description: 'An early morning scenic flight to Lukla (2,800m/9,186ft) and then trek to Phakding (2,652m/8,700ft).' },
        ],
        included: ['Airport transfers', 'Accommodation in Kathmandu', 'Domestic flights', 'Meals during the trek'],
        excluded: ['International airfare', 'Nepal visa fee', 'Travel insurance', 'Personal expenses'],
        equipment: [],
        faqs: [],
        gallery: [
            'https://picsum.photos/seed/trek-gallery1/800/600',
            'https://picsum.photos/seed/trek-gallery2/800/600',
            'https://picsum.photos/seed/trek-gallery3/800/600',
            'https://picsum.photos/seed/trek-gallery4/800/600',
        ],
        tags: ['adventure', 'hiking', 'nature'],
    },
];

export const DESTINATIONS_DETAIL_DATA: DestinationDetail[] = [
    {
        slug: 'thailand',
        name: 'Thailand',
        description: 'Known as the "Land of Smiles," Thailand is a jewel of Southeast Asia. It offers a rich tapestry of experiences, from the bustling street markets and opulent temples of Bangkok to the serene, ancient ruins of Ayutthaya. In the north, Chiang Mai provides a gateway to lush jungles and ethical elephant encounters. The south is famed for its stunning coastline, with world-class beaches in Phuket and Krabi, dramatic limestone karsts rising from turquoise waters, and idyllic islands perfect for relaxation or adventure. Thai cuisine, famous worldwide, is a delightful journey for the senses, with its perfect balance of sweet, sour, spicy, and salty flavors. Whether you seek cultural immersion, natural beauty, or culinary delights, Thailand captivates every traveler.',
        heroImage: 'https://picsum.photos/seed/thailand-hero/1920/1080',
        tours: TOURS_DATA.filter(tour => tour.location.includes('Thailand'))
    }
];

export const FLIGHTS_DATA: Flight[] = [
    { id: 'fl001', airline: 'Qatar Airways', airlineLogo: 'https://picsum.photos/seed/qatar-logo/100/100', from: { code: 'JFK', city: 'New York', time: '08:30' }, to: { code: 'LHR', city: 'London', time: '20:45' }, duration: '7h 15m', stops: 0, price: 675 },
    { id: 'fl002', airline: 'Emirates', airlineLogo: 'https://picsum.photos/seed/emirates-logo/100/100', from: { code: 'LAX', city: 'Los Angeles', time: '15:00' }, to: { code: 'DXB', city: 'Dubai', time: '19:45' }, duration: '15h 45m', stops: 0, price: 1250 },
    { id: 'fl003', airline: 'British Airways', airlineLogo: 'https://picsum.photos/seed/ba-logo/100/100', from: { code: 'JFK', city: 'New York', time: '10:00' }, to: { code: 'LHR', city: 'London', time: '23:30' }, duration: '8h 30m', stops: 1, price: 550 },
    { id: 'fl004', airline: 'Singapore Airlines', airlineLogo: 'https://picsum.photos/seed/singapore-logo/100/100', from: { code: 'SFO', city: 'San Francisco', time: '22:00' }, to: { code: 'SIN', city: 'Singapore', time: '06:00' }, duration: '17h 00m', stops: 0, price: 1100 },
];

export const HOTELS_DATA: Hotel[] = [
    { id: HOTEL_PARIS_ID, name: 'Grand Hôtel du Palais Royal', image: 'https://picsum.photos/seed/hotel1/400/300', location: 'Paris, France', rating: 5, reviews: 345, price: 450 },
    { id: HOTEL_TOKYO_ID, name: 'Park Hyatt Tokyo', image: 'https://picsum.photos/seed/hotel2/400/300', location: 'Tokyo, Japan', rating: 5, reviews: 480, price: 780 },
    { id: 'ritz-carlton-bali', name: 'The Ritz-Carlton, Bali', image: 'https://picsum.photos/seed/hotel3/400/300', location: 'Bali, Indonesia', rating: 5, reviews: 512, price: 520 },
    { id: 'four-seasons-maui', name: 'Four Seasons Resort Maui', image: 'https://picsum.photos/seed/hotel4/400/300', location: 'Maui, USA', rating: 5, reviews: 620, price: 950 },
];

export const HOTELS_DETAIL_DATA: HotelDetail[] = [
    {
        id: HOTEL_PARIS_ID,
        name: 'Grand Hôtel du Palais Royal',
        image: 'https://picsum.photos/seed/hotel1-main/800/600',
        location: 'Paris, France',
        rating: 5,
        reviews: 345,
        price: 450,
        overview: 'Nestled in the heart of Paris, this luxurious 5-star hotel offers an unparalleled experience of elegance and comfort. Overlooking the Palais Royal Garden, it is just a stone\'s throw away from the Louvre Museum and Tuileries Garden. The hotel features a spa, a fitness center, and a fine dining restaurant.',
        amenities: ['Free WiFi', 'Spa & Wellness Center', 'Fitness Center', 'Restaurant', 'Room Service', 'Pet Friendly', 'Airport Shuttle'],
        gallery: [
            'https://picsum.photos/seed/hotel1-gal1/800/600',
            'https://picsum.photos/seed/hotel1-gal2/800/600',
            'https://picsum.photos/seed/hotel1-gal3/800/600',
            'https://picsum.photos/seed/hotel1-gal4/800/600',
        ],
        rooms: [
            { name: 'Superior Room', price: 450, beds: '1 King Bed', guests: 2, image: 'https://picsum.photos/seed/hotel1-room1/400/300' },
            { name: 'Deluxe Room', price: 580, beds: '1 King Bed or 2 Twin Beds', guests: 2, image: 'https://picsum.photos/seed/hotel1-room2/400/300' },
            { name: 'Palais Royal Suite', price: 950, beds: '1 King Bed', guests: 3, image: 'https://picsum.photos/seed/hotel1-room3/400/300' },
        ],
        reviewsData: [
            { author: 'John S.', avatar: 'https://picsum.photos/seed/rev1/100/100', rating: 5, title: 'Exceptional!', comment: 'The location is perfect, and the service was impeccable. Our room had a stunning view. We will definitely be back!' },
            { author: 'Maria G.', avatar: 'https://picsum.photos/seed/rev2/100/100', rating: 5, title: 'A Parisian Dream', comment: 'From the moment we arrived, we were treated like royalty. The spa is a must-visit. Highly recommend this hotel for a romantic getaway.' },
        ],
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.512683515053!2d2.33471011567468!3d48.8673322792884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2e98d8c36d%3A0x28963ae37d928225!2sGrand%20H%C3%B4tel%20du%20Palais%20Royal!5e0!3m2!1sen!2snp!4v1680512948640!5m2!1sen!2snp',
    }
];

export const CARS_DATA: CarRental[] = [
    { id: CAR_TOYOTA_CAMRY_ID, name: 'Toyota Camry', image: 'https://picsum.photos/seed/car1/400/300', company: 'Hertz', companyLogo: 'https://picsum.photos/seed/hertz-logo/100/50', pricePerDay: 75, rating: 4.5, type: 'Compact' },
    { id: 'ford-explorer-2023', name: 'Ford Explorer', image: 'https://picsum.photos/seed/car2/400/300', company: 'Avis', companyLogo: 'https://picsum.photos/seed/avis-logo/100/50', pricePerDay: 120, rating: 4.8, type: 'SUV' },
    { id: 'bmw-5-series-2023', name: 'BMW 5 Series', image: 'https://picsum.photos/seed/car3/400/300', company: 'Enterprise', companyLogo: 'https://picsum.photos/seed/enterprise-logo/100/50', pricePerDay: 150, rating: 4.9, type: 'Luxury' },
    { id: 'honda-civic-2023', name: 'Honda Civic', image: 'https://picsum.photos/seed/car4/400/300', company: 'Budget', companyLogo: 'https://picsum.photos/seed/budget-logo/100/50', pricePerDay: 60, rating: 4.3, type: 'Economy' },
];

export const CARS_DETAIL_DATA: CarRentalDetail[] = [
    {
        id: CAR_TOYOTA_CAMRY_ID,
        name: 'Toyota Camry',
        image: 'https://picsum.photos/seed/car1-main/800/600',
        company: 'Hertz',
        companyLogo: 'https://picsum.photos/seed/hertz-logo/100/50',
        pricePerDay: 75,
        rating: 4.5,
        type: 'Compact',
        seats: 5,
        doors: 4,
        transmission: 'Automatic',
        fuel: 'Gasoline',
        description: 'The Toyota Camry is a reliable and fuel-efficient sedan, perfect for city driving and long road trips. It offers a comfortable ride, a spacious interior, and the latest safety features, making it a popular choice for families and business travelers alike.',
        features: ['Air Conditioning', 'Bluetooth', 'Backup Camera', 'Cruise Control', 'Apple CarPlay/Android Auto'],
        rentalTerms: [
            'Minimum driver age: 21',
            'Valid driver\'s license required',
            'Full-to-full fuel policy',
            'Unlimited mileage included',
        ],
        gallery: [
            'https://picsum.photos/seed/car1-gal1/800/600',
            'https://picsum.photos/seed/car1-gal2/800/600',
            'https://picsum.photos/seed/car1-gal3/800/600',
        ]
    }
];

export const SIGHTSEEING_SPOTS_DATA: SightseeingSpot[] = [
    { name: 'Swayambhunath Stupa', location: 'Kathmandu', description: 'Visit the famous "Monkey Temple" for panoramic views of Kathmandu city.', estimatedCost: 15, tags: ['culture', 'history'] },
    { name: 'Boudhanath Stupa', location: 'Kathmandu', description: 'One of the largest stupas in the world, a center of Tibetan Buddhism in Nepal.', estimatedCost: 10, tags: ['culture', 'history'] },
    { name: 'Pashupatinath Temple', location: 'Kathmandu', description: 'A sacred Hindu temple complex on the banks of the Bagmati River.', estimatedCost: 20, tags: ['culture', 'history'] },
    { name: 'Eiffel Tower Visit', location: 'Paris, France', description: 'Ascend the iconic Eiffel Tower for breathtaking views of Paris.', estimatedCost: 30, tags: ['sightseeing', 'history'] },
    { name: 'Louvre Museum', location: 'Paris, France', description: 'Explore one of the world\'s largest art museums and a historic monument.', estimatedCost: 25, tags: ['culture', 'history'] },
    { name: 'Phi Phi Islands Tour', location: 'Phuket, Thailand', description: 'A full-day boat trip to the stunning Phi Phi Islands for snorkeling and beach hopping.', estimatedCost: 80, tags: ['beach', 'nature', 'adventure'] },
    { name: 'Old Town Phuket', location: 'Phuket, Thailand', description: 'Wander through the colorful streets of Old Town, known for its Sino-Portuguese architecture.', estimatedCost: 0, tags: ['culture', 'history'] },
];

export const GALLERY_IMAGES: GalleryImage[] = [
    { id: 1, src: 'https://picsum.photos/seed/gallery1/500/800', alt: 'Mountain landscape' },
    { id: 2, src: 'https://picsum.photos/seed/gallery2/500/300', alt: 'City skyline' },
    { id: 3, src: 'https://picsum.photos/seed/gallery3/500/500', alt: 'Beach view' },
    { id: 4, src: 'https://picsum.photos/seed/gallery4/500/400', alt: 'Forest path' },
    { id: 5, src: 'https://picsum.photos/seed/gallery5/500/700', alt: 'Desert dunes' },
    { id: 6, src: 'https://picsum.photos/seed/gallery6/500/600', alt: 'Ancient ruins' },
];

export const TESTIMONIALS_DATA: Testimonial[] = [
    {
        quote: 'An absolutely unforgettable experience! The guides were knowledgeable and friendly, and the scenery was breathtaking. I can\'t wait to book my next trip with Heavenly Pathways.',
        image: 'https://picsum.photos/seed/person1/100/100',
        name: 'Sarah Johnson',
        role: 'Travel Enthusiast'
    },
    {
        quote: 'The whole trip was perfectly organized from start to finish. Heavenly Pathways took care of everything, allowing us to just relax and enjoy the journey. Highly recommended!',
        image: 'https://picsum.photos/seed/person2/100/100',
        name: 'Michael Chen',
        role: 'Adventurer'
    },
    {
        quote: 'I\'ve traveled with many companies, but Heavenly Pathways stands out for their attention to detail and commitment to customer satisfaction. The Everest Base Camp trek was a dream come true.',
        image: 'https://picsum.photos/seed/person3/100/100',
        name: 'Emily Davis',
        role: 'Seasoned Traveler'
    }
];

export const BLOG_POSTS_DATA: BlogPost[] = [
    {
        id: 'top-10-travel-destinations-for-2024',
        title: 'Top 10 Travel Destinations for 2024',
        image: 'https://picsum.photos/seed/blog1/400/300',
        date: 'October 26, 2023',
        author: 'Admin',
        excerpt: 'Discover the most exciting places to visit in the upcoming year. From bustling cities to serene natural wonders, our list has something for everyone.',
        content: '<p>The world is full of incredible places to explore. As we look ahead to 2024, here are our top picks for your next adventure.</p><h3>1. Kyoto, Japan</h3><p>Experience the perfect blend of ancient tradition and modern life. Visit serene temples, stroll through bamboo forests, and indulge in world-class cuisine.</p><h3>2. The Azores, Portugal</h3><p>An archipelago of nine volcanic islands in the mid-Atlantic, the Azores are a paradise for nature lovers. Think lush landscapes, stunning crater lakes, and whale watching opportunities.</p>'
    },
    {
        id: 'a-beginners-guide-to-trekking-in-nepal',
        title: 'A Beginner\'s Guide to Trekking in Nepal',
        image: 'https://picsum.photos/seed/blog2/400/300',
        date: 'October 20, 2023',
        author: 'Admin',
        excerpt: 'Dreaming of hiking in the Himalayas? Our guide covers everything you need to know to plan your first trekking adventure in Nepal.',
        content: '<p>Nepal is a trekker\'s paradise, home to eight of the world\'s ten highest peaks. Here\'s how to get started...</p>'
    },
    {
        id: 'how-to-pack-light-for-any-trip',
        title: 'How to Pack Light for Any Trip',
        image: 'https://picsum.photos/seed/blog3/400/300',
        date: 'October 15, 2023',
        author: 'Admin',
        excerpt: 'Traveling with less can be liberating. Learn our expert tips and tricks for packing efficiently without sacrificing the essentials.',
        content: '<p>Packing light is an art form. It saves you money on baggage fees and makes navigating new places much easier. Here are our secrets...</p>'
    },
];


export const USER_PROFILE_DATA: UserProfile = {
    name: 'Jessica Alba',
    email: 'jessica@example.com',
    phone: '+1 (234) 567-890',
    address: '123 Adventure Lane, Wanderlust City, 98765',
    memberSince: 'October 2022',
    profilePicture: 'https://picsum.photos/seed/user-profile/200/200',
};

export const USER_BOOKINGS_DATA: UserBooking[] = [
    {
        id: 'B001',
        tripId: MANASLU_TREK_ID,
        tripName: 'Manaslu Circuit Trek',
        tripImage: TREKS_DATA.find(t => t.id === MANASLU_TREK_ID)?.image || '',
        bookingDate: '2024-05-15',
        travelDate: '2024-09-10',
        status: 'Confirmed',
        totalCost: 1550,
        pendingAmount: 1000,
        travelers: 1,
    },
    {
        id: 'B002',
        tripId: PARIS_ID,
        tripName: 'Romantic Paris Getaway',
        tripImage: TOURS_DATA.find(t => t.id === PARIS_ID)?.image || '',
        bookingDate: '2024-03-20',
        travelDate: '2024-06-05',
        status: 'Completed',
        totalCost: 2400,
        travelers: 2,
    },
    {
        id: 'B003',
        tripId: EBC_TREK_ID,
        tripName: 'Everest Base Camp Trek',
        tripImage: TREKS_DATA.find(t => t.id === EBC_TREK_ID)?.image || '',
        bookingDate: '2023-11-01',
        travelDate: '2024-04-12',
        status: 'Completed',
        totalCost: 1800,
        travelers: 1,
    },
    {
        id: 'B004',
        tripId: KYOTO_ID,
        tripName: 'Ancient Temples of Kyoto',
        tripImage: TOURS_DATA.find(t => t.id === KYOTO_ID)?.image || '',
        bookingDate: '2023-09-10',
        travelDate: '2023-10-25',
        status: 'Cancelled',
        totalCost: 2500,
        travelers: 1,
    }
];

export const USER_REVIEWS_DATA: UserReview[] = [
    {
        id: 'rev-001',
        tripId: EBC_TREK_ID,
        tripName: 'Everest Base Camp Trek',
        tripImage: TREKS_DATA.find(t => t.id === EBC_TREK_ID)?.image || '',
        rating: 5,
        comment: 'An absolutely unforgettable experience! The views of Everest were breathtaking, and the guides were incredibly supportive throughout the challenging trek. Highly recommend!',
        date: '2024-04-15'
    },
    {
        id: 'rev-002',
        tripId: PARIS_ID,
        tripName: 'Romantic Paris Getaway',
        tripImage: TOURS_DATA.find(t => t.id === PARIS_ID)?.image || '',
        rating: 4,
        comment: 'Paris was lovely, and the hotel location was perfect. The itinerary was well-balanced, though a bit rushed on the second day. Overall, a wonderful trip.',
        date: '2024-06-10'
    }
];

export const REWARD_POINTS_TOTAL = 1250;

export const REWARD_ACTIVITY_DATA: RewardActivity[] = [
    { date: '2024-05-15', description: 'Booked: Manaslu Circuit Trek', points: 310 },
    { date: '2024-03-20', description: 'Booked: Romantic Paris Getaway', points: 480 },
    { date: '2023-11-01', description: 'Booked: Everest Base Camp Trek', points: 360 },
    { date: '2023-10-15', description: 'Welcome Bonus', points: 100 },
];

export const USER_INVOICES_DATA: Invoice[] = [
    { id: 'INV-001-2024', date: '2024-05-15', amount: 1550, status: 'Due', tripName: 'Manaslu Circuit Trek' },
    { id: 'INV-002-2024', date: '2024-03-20', amount: 2400, status: 'Paid', tripName: 'Romantic Paris Getaway' },
    { id: 'INV-003-2023', date: '2023-11-01', amount: 1800, status: 'Paid', tripName: 'Everest Base Camp Trek' },
];