import marketplaceService from './marketplace.service';
import lostFoundService from './lostandfound.service';
import ridesService from './rides.service';
import eventsService from './events.service';

export interface RecentActivity {
  id: string;
  type: 'marketplace' | 'lost_found' | 'ride' | 'event' | 'resource' | 'hostel';
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  time: string;
  createdAt: string;
  data?: any; // Original data object
}

const activityService = {
  // Aggregate recent activities from all services
  async getRecentActivities(limit: number = 10): Promise<{ success: boolean; data: RecentActivity[] }> {
    try {
      const activities: RecentActivity[] = [];

      // Fetch recent data from all services in parallel
      const [
        marketplaceRes,
        lostFoundRes,
        ridesRes,
        eventsRes,
      ] = await Promise.allSettled([
        marketplaceService.getAll(),
        lostFoundService.getAll({ status: 'lost' }),
        ridesService.getAll(),
        eventsService.getAll({ status: 'upcoming' }),
      ]);

      // Process Marketplace items
      if (marketplaceRes.status === 'fulfilled' && marketplaceRes.value.success) {
        const items = marketplaceRes.value.data.slice(0, 3); // Latest 3
        items.forEach(item => {
          activities.push({
            id: `marketplace-${item.id}`,
            type: 'marketplace',
            icon: 'cart-outline',
            iconColor: '#f5576c',
            iconBg: '#f5576c20',
            title: 'New Item in Marketplace',
            description: `${item.title} - ₹${item.price}`,
            time: this.formatTimeAgo(item.createdAt),
            createdAt: item.createdAt,
            data: item,
          });
        });
      }

      // Process Lost & Found items
      if (lostFoundRes.status === 'fulfilled' && lostFoundRes.value.success) {
        const items = lostFoundRes.value.data.slice(0, 2); // Latest 2
        items.forEach(item => {
          activities.push({
            id: `lostfound-${item.id}`,
            type: 'lost_found',
            icon: 'search-outline',
            iconColor: '#764ba2',
            iconBg: '#764ba220',
            title: item.status === 'lost' ? 'Item Lost' : 'Item Found',
            description: `${item.itemName} - ${item.location}`,
            time: this.formatTimeAgo(item.createdAt),
            createdAt: item.createdAt,
            data: item,
          });
        });
      }

      // Process Rides
      if (ridesRes.status === 'fulfilled' && ridesRes.value.success) {
        const rides = ridesRes.value.data.slice(0, 2); // Latest 2
        rides.forEach(ride => {
          activities.push({
            id: `ride-${ride.id}`,
            type: 'ride',
            icon: 'car-outline',
            iconColor: '#330867',
            iconBg: '#30cfd020',
            title: 'New Ride Available',
            description: `${ride.from} to ${ride.to} - ${ride.availableSeats} seats`,
            time: this.formatTimeAgo(ride.createdAt),
            createdAt: ride.createdAt,
            data: ride,
          });
        });
      }

      // Process Events
      if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
        const events = eventsRes.value.data.slice(0, 2); // Latest 2
        events.forEach(event => {
          activities.push({
            id: `event-${event.id}`,
            type: 'event',
            icon: 'calendar-outline',
            iconColor: '#43e97b',
            iconBg: '#43e97b20',
            title: 'New Event',
            description: `${event.title} - ${event.location}`,
            time: this.formatTimeAgo(event.createdAt),
            createdAt: event.createdAt,
            data: event,
          });
        });
      }

      // Note: Resources don't have a simple getAll endpoint
      // Resources are organized by branch > year > subject > materials
      // Skipping resources from recent activities for now

      // Sort by most recent and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      return {
        success: true,
        data: sortedActivities,
      };
    } catch (error: any) {
      console.error('Failed to fetch recent activities:', error);
      return {
        success: false,
        data: [],
      };
    }
  },

  // Helper to format time ago
  formatTimeAgo(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  },
};

export default activityService;
