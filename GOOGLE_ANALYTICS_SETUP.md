# Google Analytics Setup Instructions

Your car website now has Google Analytics 4 integrated with custom event tracking! 🎉

## Setup Steps:

### 1. Create Google Analytics 4 Account
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring" or "Admin" → "Create Property"
3. Follow the setup wizard:
   - Enter your property name (e.g., "Car Product Website")
   - Select your timezone and currency
   - Click "Next"
4. Fill in business information
5. Accept the Terms of Service

### 2. Create a Data Stream
1. After creating the property, click "Web" as your platform
2. Enter your website URL (e.g., `https://your-domain.com`)
3. Enter a stream name (e.g., "Car Product Website")
4. Click "Create stream"
5. **Copy your Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Add Measurement ID to Your Project

Create a `.env.local` file in your project root (or add to existing one):

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID from step 2.

### 4. Restart Your Development Server

```bash
npm run dev
```

### 5. Test the Integration

1. Visit your website
2. Go to Google Analytics → Reports → Realtime
3. You should see yourself as an active user!
4. Click around your site and watch events appear in real-time

## What's Being Tracked

### Automatic Tracking:
- **Page Views**: Every page visit is tracked automatically
- **Session Duration**: How long users stay on your site
- **User Demographics**: Location, device, browser info

### Custom Events Tracked:

1. **car_viewed** - When someone views a car detail page
   - Properties: car_id, car_name, price, currency

2. **contact_clicked** - When someone clicks contact buttons
   - Properties: contact_method (telegram/phone), car_id, car_name

3. **image_gallery_opened** - When the lightbox gallery is opened
   - Properties: car_id, image_count, has_video

4. **video_played** - When a video plays in the lightbox
   - Properties: car_id

5. **image_zoomed** - When user zooms an image
   - Properties: car_id

6. **tiktok_clicked** - When TikTok link is clicked
   - Properties: car_id

7. **car_added** - When admin adds a new car (optional)
   - Properties: car_id

8. **car_edited** - When admin edits a car (optional)
   - Properties: car_id

9. **car_deleted** - When admin deletes a car (optional)
   - Properties: car_id

## View Your Analytics

### 1. Real-time Reports
- Go to **Reports → Realtime** to see current activity

### 2. Events Report
- Go to **Reports → Engagement → Events** to see all custom events

### 3. Popular Cars Report
To see which cars get the most views:
1. Go to **Explore** in the left sidebar
2. Create a new exploration
3. Add **car_viewed** event
4. Group by **car_name** dimension
5. You'll see which cars are most popular!

### 4. Conversion Tracking
Track how many people contact you:
1. Go to **Admin → Events**
2. Click "Create event" or "Mark as conversion"
3. Mark **contact_clicked** as a conversion
4. Now you can track conversion rate in reports!

## Recommended Custom Reports

### Most Viewed Cars:
- Event: `car_viewed`
- Dimension: `car_name`
- Metric: Event count

### Contact Conversion Rate:
- Events: `car_viewed` vs `contact_clicked`
- Calculate: (contacts / views) * 100

### Popular Contact Method:
- Event: `contact_clicked`
- Dimension: `contact_method`
- See if users prefer Telegram or Phone

## Debugging

If events aren't showing up:

1. Check that `.env.local` has your Measurement ID
2. Restart your dev server after adding the env variable
3. Open browser console and look for GA-related errors
4. Check that you're not using an ad blocker
5. Wait a few minutes - GA can have slight delays
6. Use **DebugView** in GA4:
   - Go to Admin → DebugView
   - Install the [Google Analytics Debugger extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
   - Enable it and test your site

## Next Steps

1. Set up **Google Search Console** to track organic search traffic
2. Create **custom audiences** for remarketing
3. Set up **conversion goals** for contact clicks
4. Link with **Google Ads** if you plan to run ads
5. Create a **dashboard** to monitor key metrics daily

## Files Modified

- ✅ `lib/analytics.ts` - Analytics utility functions
- ✅ `components/GoogleAnalytics.tsx` - GA4 component
- ✅ `app/layout.tsx` - Added GA to all pages
- ✅ `app/cars/[id]/page.tsx` - Track car views, contacts, TikTok
- ✅ `components/CarImageGallery.tsx` - Track gallery, zoom, video events

## Environment Variables

Remember to add this to your production environment too!

For Vercel:
1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` with your Measurement ID
3. Redeploy

For Docker/VPS:
1. Add to your `.env` file or docker-compose environment
2. Restart your containers

---

**Important**: Never commit your `.env.local` file to git! It's already in `.gitignore`.

Happy tracking! 📊🚗
