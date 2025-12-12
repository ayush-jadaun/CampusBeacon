import { Ionicons } from '@expo/vector-icons';

export interface Service {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: string[];
  route: string;
  badge?: number;
}

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Lost & Found',
    icon: 'search-outline',
    gradientColors: ['#667eea', '#764ba2'],
    route: '/lost-found',
  },
  {
    id: '2',
    title: 'Marketplace',
    icon: 'cart-outline',
    gradientColors: ['#f093fb', '#f5576c'],
    route: '/marketplace',
    badge: 5,
  },
  {
    id: '3',
    title: 'Attendance',
    icon: 'calendar-outline',
    gradientColors: ['#4facfe', '#00f2fe'],
    route: '/attendance',
  },
  {
    id: '4',
    title: 'Mess Menu',
    icon: 'restaurant-outline',
    gradientColors: ['#43e97b', '#38f9d7'],
    route: '/mess-menu',
  },
  {
    id: '5',
    title: 'Resources',
    icon: 'book-outline',
    gradientColors: ['#fa709a', '#fee140'],
    route: '/resources',
  },
  {
    id: '6',
    title: 'Ride Share',
    icon: 'car-outline',
    gradientColors: ['#30cfd0', '#330867'],
    route: '/ride-share',
  },
  {
    id: '7',
    title: 'Events',
    icon: 'ticket-outline',
    gradientColors: ['#a8edea', '#fed6e3'],
    route: '/events',
    badge: 3,
  },
  {
    id: '8',
    title: 'Clubs',
    icon: 'people-outline',
    gradientColors: ['#ff9a9e', '#fecfef'],
    route: '/clubs',
  },
  {
    id: '9',
    title: 'Eateries',
    icon: 'fast-food-outline',
    gradientColors: ['#ffecd2', '#fcb69f'],
    route: '/eateries',
  },
  {
    id: '10',
    title: 'Hostel',
    icon: 'bed-outline',
    gradientColors: ['#a1c4fd', '#c2e9fb'],
    route: '/hostel',
  },
];
