import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "./contexts/AdminContext";
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
import AdminActivityLogs from "@/pages/AdminActivityLogs"; // Added this
import AdminPageEditor from "@/pages/AdminPageEditor";
import AdminServices from "@/pages/AdminServices";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminServiceQuestionnaires from "@/pages/AdminServiceQuestionnaires";
import JobDetail from "@/pages/JobDetail";
import ScrollToTop from "@/components/ScrollToTop";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={Services} />
        <Route path="/careers" component={Careers} />
        <Route path="/job/:id" component={JobDetail} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/project-management" component={ProjectManagement} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/contacts" component={AdminContacts} />
        <Route path="/admin/applications" component={AdminApplications} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/jobs" component={AdminJobs} />
        <Route path="/admin/clients" component={AdminClients} />
        <Route path="/admin/activity-logs" component={AdminActivityLogs} /> {/* Added this */}
        <Route path="/admin/editor" component={AdminPageEditor} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/service-questionnaires" component={AdminServiceQuestionnaires} />
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
