# TravelBook

**TravelBook** is a comprehensive tour operations platform designed to help travel agencies and tour operators manage their entire booking lifecycle—from initial customer inquiries to completed tours. Whether you're running day trips, multi-day adventures, or complex tour packages, TravelBook provides the tools you need to stay organized and deliver exceptional customer experiences.

![TravelBook](./public/omg.png)

## Our Mission

We built TravelBook to solve a common challenge in the travel industry: managing reservations, customer relationships, tour logistics, and finances often requires juggling multiple disconnected systems. TravelBook brings everything together in one intuitive platform, allowing tour operators to focus on what matters most—creating memorable travel experiences for their customers.

## What TravelBook Does

### Quote-to-Booking Workflow

TravelBook streamlines the entire sales process with a flexible quote system. When a potential customer inquires about a tour, your sales team can quickly create a detailed quote that includes:

- Multiple tours with individual dates and pricing
- Passenger breakdown (adults, children, infants) with automatic price calculations
- Custom discounts and payment terms
- Personalized comments and special requests

Once a quote is ready, you can share it with your customer via a unique link. They can review the itinerary, see all the details, and accept the terms directly from their phone or computer. When they're ready to proceed, converting a quote into a confirmed booking takes just one click.

### Reservation Calendar

The heart of TravelBook is its visual reservation calendar. At a glance, you can see:

- **Daily occupancy levels** — Color-coded indicators show you how full each day is, from light blue (few bookings) to red (near capacity)
- **Tour-by-tour breakdown** — See exactly how many passengers are booked on each tour for any given day
- **Capacity tracking** — Each tour has a defined capacity, and the calendar shows occupancy percentages to help you manage availability

The calendar isn't just for viewing—click on any day to see a detailed sidebar with all reservations, passenger counts per tour, and quick access to booking details. This makes it easy to answer customer questions, check availability, and plan your operations.

### How Reservations Work

Making a reservation in TravelBook follows a natural, conversational flow:

1. **Start with the customer** — Enter or select the customer's information. TravelBook remembers returning customers, so repeat bookings are even faster.

2. **Build the itinerary** — Add one or more tours to the booking. For each tour, you'll select:
   - The destination and specific tour
   - The date they want to travel
   - Pickup location and time
   - Number of passengers by type (adults, children, infants)

3. **Review pricing** — Prices are automatically calculated based on your tour configurations, but you can apply discounts or adjust as needed.

4. **Choose payment options** — Set up how and when payment will be collected. TravelBook tracks payment status so you always know what's outstanding.

5. **Save and share** — Save the quote and share it with your customer. They can review everything online and accept the terms when ready.

6. **Confirm the booking** — Once your customer approves, convert the quote to a confirmed reservation with a single action.

### Tour Scheduling

Each tour in TravelBook can be configured with:

- **Available days** — Specify which days of the week a tour operates (e.g., Monday through Friday only, or weekends only)
- **Departure time** — Set the standard departure time for the tour
- **Capacity** — Define how many passengers each tour can accommodate
- **Starting point** — The default pickup or meeting location

When creating reservations, the system uses these settings to help ensure tours aren't overbooked. The calendar's occupancy indicators give you an immediate visual sense of availability.

### Logistics & Operations

Once reservations are confirmed, the operations side of TravelBook takes over:

- **Assign resources** — For each tour on each day, assign a driver, guide (and assistant guide if needed), and vehicle
- **Passenger manifests** — Generate passenger lists with names, contact information, pickup locations, and special requirements
- **Status tracking** — Track each tour through its lifecycle: pending → confirmed → checked-in → completed
- **Locking mechanism** — Once logistics are confirmed, bookings are automatically locked to prevent accidental changes

### Customer Management

TravelBook maintains a complete customer database where you can:

- Store contact information, hotel details, and preferences
- Track booking history and total spend
- Add notes and special requirements
- View all past and upcoming reservations for any customer

### Financial Overview

Keep track of your business health with TravelBook's financial tools:

- Revenue tracking across bookings and payment status
- Commission calculations for sales staff
- Expense management and categorization
- Bank account tracking with multi-currency support
- Exchange rate management for international operations

## Multi-Language Support

TravelBook supports English, Spanish, and Portuguese, making it accessible for tour operators across the Americas and beyond.

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/travelbook.git
cd travelbook/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open your browser and navigate to `http://localhost:8080`

### Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000
```

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run build:dev` — Build for development
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint for code quality

## Built With

TravelBook is built with modern, reliable technologies:

- **React 18** with TypeScript for a robust, type-safe frontend
- **Tailwind CSS** and **shadcn/ui** for a clean, responsive interface
- **React Query** for efficient data synchronization
- **Django REST Framework** backend with PostgreSQL database

## License

This project is licensed under the MIT License.

---

Built with care for tour operators everywhere.
