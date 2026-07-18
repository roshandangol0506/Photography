import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import Home from "@/pages/public/Home";
import Gallery from "@/pages/public/Gallery";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthGuard } from "@/components/admin/AuthGuard";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import AddPhoto from "@/pages/admin/AddPhoto";
import EditPhoto from "@/pages/admin/EditPhoto";
import Photos from "@/pages/admin/Photos";
import Collections from "@/pages/admin/Collections";
import Categories from "@/pages/admin/Categories";
import Awards from "@/pages/admin/Awards";
import Visitors from "@/pages/admin/Visitors";
import Comments from "@/pages/admin/Comments";
import Testimonials from "@/pages/admin/Testimonials";
import Messages from "@/pages/admin/Messages";
import Profile from "@/pages/admin/Profile";
import Settings from "@/pages/admin/Settings";
import Analytics from "@/pages/admin/Analytics";
import Appearance from "@/pages/admin/Appearance";

function App() {
  return (
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
  );
}

export default App;
