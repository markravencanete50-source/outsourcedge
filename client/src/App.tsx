import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { AdminProvider } from "./contexts/AdminContext";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Careers from "@/pages/Careers";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminContacts from "@/pages/AdminContacts";
import AdminApplications from "@/pages/AdminApplications";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminJobs from "@/pages/AdminJobs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/careers" component={Careers} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/contacts" component={AdminContacts} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/jobs" component={AdminJobs} />
      <Route component={NotFound} />
    </Switch>
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
