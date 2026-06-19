import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "./contexts/AdminContext";
import { useAdmin } from "./contexts/AdminContext";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Careers from "@/pages/Careers";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import ProjectManagement from "@/pages/ProjectManagement";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminContacts from "@/pages/AdminContacts";
import AdminApplications from "@/pages/AdminApplications";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminJobs from "@/pages/AdminJobs";
import AdminClients from "@/pages/AdminClients";
import AdminActivityLogs from "@/pages/AdminActivityLogs";
import AdminPageEditor from "@/pages/AdminPageEditor";
import AdminServices from "@/pages/AdminServices";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminServiceQuestionnaires from "@/pages/AdminServiceQuestionnaires";
import JobDetail from "@/pages/JobDetail";
import ScrollToTop from "@/components/ScrollToTop";

// Protects all /admin/* routes — redirects to login if not authenticated.
// isLoading check prevents a flash-redirect while Firebase resolves the session.
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/careers" component={Careers} />
        <Route path="/job/:id" component={JobDetail} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
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
    </>
  );
}

function App() {
  return (
    <AdminProvider>
      <Router />
      <Toaster />
    </AdminProvider>
  );
}

export default App;
