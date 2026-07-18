import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { PageLoader } from "@/components/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/public/Home";
import Gallery from "@/pages/public/Gallery";

// Admin pages - split into their own chunks so public visitors never
// download the dashboard (recharts, react-hook-form, etc.)
const Login = lazy(() => import("@/pages/admin/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AddPhoto = lazy(() => import("@/pages/admin/AddPhoto"));
const EditPhoto = lazy(() => import("@/pages/admin/EditPhoto"));
const Photos = lazy(() => import("@/pages/admin/Photos"));
const Collections = lazy(() => import("@/pages/admin/Collections"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Awards = lazy(() => import("@/pages/admin/Awards"));
const Visitors = lazy(() => import("@/pages/admin/Visitors"));
const Comments = lazy(() => import("@/pages/admin/Comments"));
const Testimonials = lazy(() => import("@/pages/admin/Testimonials"));
const Messages = lazy(() => import("@/pages/admin/Messages"));
const Profile = lazy(() => import("@/pages/admin/Profile"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const Appearance = lazy(() => import("@/pages/admin/Appearance"));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
          </Route>
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="photos/new" element={<AddPhoto />} />
            <Route path="photos/:id/edit" element={<EditPhoto />} />
            <Route path="photos" element={<Photos />} />
            <Route path="collections" element={<Collections />} />
            <Route path="categories" element={<Categories />} />
            <Route path="awards" element={<Awards />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="comments" element={<Comments />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="appearance" element={<Appearance />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
