import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";

// ── Page-level code splitting ─────────────────────────────────────────────────
// Each lazy import creates a separate chunk.
// The bundle no longer loads all 20+ pages on first visit.
const Home            = lazy(() => import("./pages/Home"));
const About           = lazy(() => import("./pages/About"));
const Services        = lazy(() => import("./pages/Services"));
const Contact         = lazy(() => import("./pages/Contact"));
const Careers         = lazy(() => import("./pages/Careers"));
const Blog            = lazy(() => import("./pages/Blog"));
const BlogPost        = lazy(() => import("./pages/BlogPost"));
const Privacy         = lazy(() => import("./pages/Privacy"));
const Terms           = lazy(() => import("./pages/Terms"));
const NotFound        = lazy(() => import("./pages/not-found"));

// Admin pages — split into their own chunk group
const AdminLogin      = lazy(() => import("./pages/admin/Login"));
const AdminDashboard  = lazy(() => import("./pages/admin/Dashboard"));
const AdminBlog       = lazy(() => import("./pages/admin/Blog"));
const AdminBlogEdit   = lazy(() => import("./pages/admin/BlogEdit"));
const AdminTestimonials = lazy(() => import("./pages/admin/Testimonials"));
const AdminCareers    = lazy(() => import("./pages/admin/Careers"));
const AdminContacts   = lazy(() => import("./pages/admin/Contacts"));

// ── Page-level loading skeleton ───────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm tracking-wide">Loading…</p>
      </div>
    </div>
  );
}

// ── Protected route (preserves Phase 1 guard) ─────────────────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <PageSkeleton />;
  if (!user) return <Redirect to="/admin/login" />;
  return <Component />;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {/* Suspense wraps the entire router — each lazy page shows the skeleton */}
        <Suspense fallback={<PageSkeleton />}>
          <Switch>
            {/* Public routes */}
            <Route path="/"            component={Home} />
            <Route path="/about"       component={About} />
            <Route path="/services"    component={Services} />
            <Route path="/contact"     component={Contact} />
            <Route path="/careers"     component={Careers} />
            <Route path="/blog"        component={Blog} />
            <Route path="/blog/:slug"  component={BlogPost} />
            <Route path="/privacy"     component={Privacy} />
            <Route path="/terms"       component={Terms} />

            {/* Admin routes */}
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin/dashboard">
              {() => <ProtectedRoute component={AdminDashboard} />}
            </Route>
            <Route path="/admin/blog">
              {() => <ProtectedRoute component={AdminBlog} />}
            </Route>
            <Route path="/admin/blog/edit/:id">
              {() => <ProtectedRoute component={AdminBlogEdit} />}
            </Route>
            <Route path="/admin/blog/new">
              {() => <ProtectedRoute component={AdminBlogEdit} />}
            </Route>
            <Route path="/admin/testimonials">
              {() => <ProtectedRoute component={AdminTestimonials} />}
            </Route>
            <Route path="/admin/careers">
              {() => <ProtectedRoute component={AdminCareers} />}
            </Route>
            <Route path="/admin/contacts">
              {() => <ProtectedRoute component={AdminContacts} />}
            </Route>

            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
