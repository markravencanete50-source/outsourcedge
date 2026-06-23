import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "./contexts/AdminContext";
import { useAdmin } from "./contexts/AdminContext";
import ScrollToTop from "@/components/ScrollToTop";

// ── Code splitting — each page loads only when visited ────────────────────────
const NotFound                   = lazy(() => import("@/pages/NotFound"));
const Home                       = lazy(() => import("@/pages/Home"));
const Services                   = lazy(() => import("@/pages/Services"));
const Careers                    = lazy(() => import("@/pages/Careers"));
const About                      = lazy(() => import("@/pages/About"));
const Contact                    = lazy(() => import("@/pages/Contact"));
const ProjectManagement          = lazy(() => import("@/pages/ProjectManagement"));
const JobDetail                  = lazy(() => import("@/pages/JobDetail"));
const AdminLogin                 = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard             = lazy(() => import("@/pages/AdminDashboard"));
const AdminContacts              = lazy(() => import("@/pages/AdminContacts"));
const AdminApplications          = lazy(() => import("@/pages/AdminApplications"));
const AdminAnalytics             = lazy(() => import("@/pages/AdminAnalytics"));
const AdminJobs                  = lazy(() => import("@/pages/AdminJobs"));
const AdminClients               = lazy(() => import("@/pages/AdminClients"));
const AdminActivityLogs          = lazy(() => import("@/pages/AdminActivityLogs"));
const AdminPageEditor            = lazy(() => import("@/pages/AdminPageEditor"));
const AdminServices              = lazy(() => import("@/pages/AdminServices"));
const AdminTestimonials          = lazy(() => import("@/pages/AdminTestimonials"));
const AdminServiceQuestionnaires = lazy(() => import("@/pages/AdminServiceQuestionnaires"));

// ── Page loading spinner ──────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-[#1B3A4B] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Protected route — same logic as before ────────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return <Component />;
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Switch>
          {/* Public routes */}
          <Route path="/"                   component={Home} />
          <Route path="/services"           component={Services} />
          <Route path="/careers"            component={Careers} />
          <Route path="/job/:id"            component={JobDetail} />
          <Route path="/about"              component={About} />
          <Route path="/contact"            component={Contact} />
          <Route path="/project-management" component={ProjectManagement} />

          {/* Auth */}
          <Route path="/admin/login" component={AdminLogin} />

          {/* Protected admin routes */}
          <Route path="/admin/dashboard">
            {() => <ProtectedRoute component={AdminDashboard} />}
          </Route>
          <Route path="/admin/contacts">
            {() => <ProtectedRoute component={AdminContacts} />}
          </Route>
          <Route path="/admin/applications">
            {() => <ProtectedRoute component={AdminApplications} />}
          </Route>
          <Route path="/admin/analytics">
            {() => <ProtectedRoute component={AdminAnalytics} />}
          </Route>
          <Route path="/admin/jobs">
            {() => <ProtectedRoute component={AdminJobs} />}
          </Route>
          <Route path="/admin/clients">
            {() => <ProtectedRoute component={AdminClients} />}
          </Route>
          <Route path="/admin/activity-logs">
            {() => <ProtectedRoute component={AdminActivityLogs} />}
          </Route>
          <Route path="/admin/editor">
            {() => <ProtectedRoute component={AdminPageEditor} />}
          </Route>
          <Route path="/admin/services">
            {() => <ProtectedRoute component={AdminServices} />}
          </Route>
          <Route path="/admin/testimonials">
            {() => <ProtectedRoute component={AdminTestimonials} />}
          </Route>
          <Route path="/admin/service-questionnaires">
            {() => <ProtectedRoute component={AdminServiceQuestionnaires} />}
          </Route>

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AdminProvider>
      <Router />
      <Toaster />
    </AdminProvider>
  );
}

export default App;
