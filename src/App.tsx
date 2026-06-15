import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import NotificationSystem from "./components/NotificationSystem";
import Home from "./pages/Home";
import Exams from "./pages/Exams";
import Lessons from "./pages/Lessons";
import Certificate from "./pages/Certificate";
import Dashboard from "./pages/Dashboard";
import Review from "./pages/Review";
import Login from "./pages/Login";
import Result from "./pages/Result";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageLessons from "./pages/admin/ManageLessons";
import ManageQuestions from "./pages/admin/ManageQuestions";
import ManageResults from "./pages/admin/ManageResults";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";


function Router() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
      <Navbar />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/?">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>
        <Route path="/exams">
          <ProtectedRoute>
            <Exams />
          </ProtectedRoute>
        </Route>
        <Route path="/lessons">
          <ProtectedRoute>
            <Lessons />
          </ProtectedRoute>
        </Route>
        <Route path="/certificate">
          <ProtectedRoute>
            <Certificate />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/review">
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        </Route>
        <Route path="/results/:id">
          {(params) => (
            <ProtectedRoute>
              <Result resultId={params.id} />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/admin">
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </Route>
        <Route path="/admin/lessons">
          <AdminRoute>
            <ManageLessons />
          </AdminRoute>
        </Route>
        <Route path="/admin/questions">
          <AdminRoute>
            <ManageQuestions />
          </AdminRoute>
        </Route>
        <Route path="/admin/results">
          <AdminRoute>
            <ManageResults />
          </AdminRoute>
        </Route>
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <NotificationSystem />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
