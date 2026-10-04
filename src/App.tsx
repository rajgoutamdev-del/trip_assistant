import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { AppShell } from '@/layouts/AppShell';
import { TripLayout } from '@/layouts/TripLayout';
import { LandingPage } from '@/pages/LandingPage';

/**
 * Everything past the landing page is lazy, so the first paint only ships the
 * marketing route. Trip modules are small enough to chunk individually.
 */
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const DestinationPage = lazy(() => import('@/pages/DestinationPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const TripOverview = lazy(() => import('@/pages/trip/TripOverview'));
const ItineraryPage = lazy(() => import('@/pages/trip/ItineraryPage'));
const BudgetPage = lazy(() => import('@/pages/trip/BudgetPage'));
const WeatherPage = lazy(() => import('@/pages/trip/WeatherPage'));
const FoodPage = lazy(() => import('@/pages/trip/FoodPage'));
const SafetyPage = lazy(() => import('@/pages/trip/SafetyPage'));
const PackingPage = lazy(() => import('@/pages/trip/PackingPage'));
const PhotosPage = lazy(() => import('@/pages/trip/PhotosPage'));
const LanguagePage = lazy(() => import('@/pages/trip/LanguagePage'));
const StaysPage = lazy(() => import('@/pages/trip/StaysPage'));
const EmergencyPage = lazy(() => import('@/pages/trip/EmergencyPage'));
const NightModePage = lazy(() => import('@/pages/trip/NightModePage'));

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      <Route element={<AppShell />}>
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="destination/:destinationId" element={<DestinationPage />} />
        <Route path="settings" element={<SettingsPage />} />

        <Route path="trip/:tripId" element={<TripLayout />}>
          <Route index element={<TripOverview />} />
          <Route path="itinerary" element={<ItineraryPage />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="food" element={<FoodPage />} />
          <Route path="safety" element={<SafetyPage />} />
          <Route path="packing" element={<PackingPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="language" element={<LanguagePage />} />
          <Route path="stays" element={<StaysPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="night" element={<NightModePage />} />
        </Route>

        <Route path="trip" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
