# Testing Data Flow Between BookQuotePage and SharedQuotePage

## Changes Made

1. **BookQuotePage.tsx**
   - Added `useQueryClient` from React Query
   - Modified quote creation to store data directly in React Query cache instead of making API calls
   - Using cache key `['shared-quote', shareableLink]` to store the booking data
   - Removed the API mutation call and instead create a mock booking object with all form data
   - Navigate to SharedQuotePage with the shareableLink

2. **SharedQuotePage.tsx**
   - Replaced API calls with React Query `useQuery` hook
   - Uses the same cache key `['shared-quote', shareId]` to read data from cache
   - Set `enabled: !!shareId` to only run when shareId exists
   - Added `staleTime` and `retry: false` for optimal cache reading
   - Removed dependencies on location.state and bookingService

## How It Works

1. User fills out quote form in BookQuotePage
2. On submission, instead of API call:
   - Generate unique shareableLink (timestamp + random string)
   - Create mock booking object with all form data
   - Store in React Query cache with key `['shared-quote', shareableLink]`
   - Navigate to `/quotes/share/${shareableLink}`

3. SharedQuotePage loads with shareId from URL:
   - Uses React Query to read from cache with key `['shared-quote', shareId]`
   - If data exists in cache, displays quote information
   - If no data in cache, shows "Quote Preview" message

## Testing Instructions

1. Go to `/quotes` page
2. Fill out customer information and add at least one tour
3. Click "Save Quotation"
4. Should redirect to `/quotes/share/{unique-id}`
5. SharedQuotePage should display all the entered information
6. Check browser console for debug logs confirming data flow

## Benefits

- ✅ No backend API calls required
- ✅ Immediate data transfer between pages
- ✅ Uses React Query caching mechanism
- ✅ Maintains existing UI and functionality
- ✅ Data persists for 10 minutes (staleTime)
- ✅ Works with existing routing structure