import React from 'react';

export interface NavLink {
  label: string;
  href: string;
  megaMenu?: MegaMenuItem[];
}

export interface MegaMenuItem {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface Service {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export interface Destination {
    name: string;
    tours: number;
    image: string;
}

export interface Tour {
    id: string;
    image: string;
    price: number;
    location: string;
    duration: string;
    title: string;
    rating: number;
    reviews: number;
    tags?: string[];
}

export interface ItineraryItem {
    day: number;
    title: string;
    description: string;
    altitude?: string;
    duration?: string;
    meals?: string;
    image?: string;
}

export interface EquipmentCategory {
    category: string;
    items: string[];
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface TripFact {
    icon: React.ReactNode;
    label: string;
    value: string;
}

export interface Trek {
    id: string;
    title: string;
    image: string;
    price: number;
    duration: string;
    difficulty: 'Easy' | 'Moderate' | 'Strenuous';
    rating: number;
    reviews: number;
    overview: string;
    tripFacts: TripFact[];
    itinerary: ItineraryItem[];
    included: string[];
    excluded: string[];
    equipment: EquipmentCategory[];
    faqs: FAQ[];
    gallery: string[];
    videoEmbedUrl?: string;
    mapEmbedUrl?: string;
    tags?: string[];
}

export interface TourDetail {
    id: string;
    title: string;
    image: string;
    price: number;
    location: string;
    duration: string;
    rating: number;
    reviews: number;
    overview: string;
    included: string[];
    excluded: string[];
    gallery: string[];
    mapEmbedUrl?: string;
    faqs: FAQ[];
    tags?: string[];
}

export interface SightseeingSpot {
    name: string;
    location: string;
    description: string;
    estimatedCost: number;
    tags: string[];
}

export interface CustomTrip {
    id: string;
    title: string;
    image: string;
    price: number;
    overview: string;
}

export interface DestinationDetail {
    slug: string;
    name: string;
    description: string;
    heroImage: string;
    tours: Tour[];
}

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  from: { code: string; city: string; time: string };
  to: { code: string; city: string; time: string };
  duration: string;
  stops: number;
  price: number;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
}

export interface RoomType {
  name: string;
  price: number;
  beds: string;
  guests: number;
  image: string;
}

export interface HotelReview {
    author: string;
    avatar: string;
    rating: number;
    title: string;
    comment: string;
}


export interface HotelDetail extends Hotel {
  overview: string;
  amenities: string[];
  gallery: string[];
  rooms: RoomType[];
  reviewsData: HotelReview[];
  mapEmbedUrl: string;
}

export interface CarRental {
  id: string;
  name: string;
  image: string;
  company: string;
  companyLogo: string;
  pricePerDay: number;
  rating: number;
  type: 'Economy' | 'Compact' | 'SUV' | 'Luxury';
}

export interface CarRentalDetail extends CarRental {
    seats: number;
    doors: number;
    transmission: 'Automatic' | 'Manual';
    fuel: 'Gasoline' | 'Diesel' | 'Electric';
    description: string;
    features: string[];
    rentalTerms: string[];
    gallery: string[];
}

export interface GalleryImage {
    id: number;
    src: string;
    alt: string;
}

export interface Testimonial {
    quote: string;
    image: string;
    name: string;
    role: string;
}

export interface BlogPost {
    id: string;
    title: string;
    image: string;
    date: string;
    author: string;
    excerpt: string;
    content: string;
}

export interface UserProfile {
    name: string;
    email: string;
    phone: string;
    address: string;
    memberSince: string;
    profilePicture: string;
}

export interface UserBooking {
    id: string;
    tripName: string;
    tripId: string;
    tripImage: string;
    bookingDate: string;
    travelDate: string;
    status: 'Confirmed' | 'Completed' | 'Cancelled';
    totalCost: number;
    travelers: number;
    pendingAmount?: number;
}

export interface UserReview {
    id: string;
    tripId: string;
    tripName: string;
    tripImage: string;
    rating: number;
    comment: string;
    date: string;
}

export interface RewardActivity {
    date: string;
    description: string;
    points: number;
}

export interface Invoice {
    id: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Due' | 'Overdue';
    tripName: string;
}