import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
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
import AdminJobs from "@/pages/AdminJobs"; // Import the new page

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
      <Route path="/admin/jobs" component={AdminJobs} /> {/* Add the new route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <Router />
        <Toaster />
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;
