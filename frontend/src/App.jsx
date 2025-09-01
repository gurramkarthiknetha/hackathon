import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/ui/FloatingShape";
import SignUpPage from "./pages/auth/SignUpPage";
import LoginPage from "./pages/auth/LoginPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Dashboard Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import HomePage from "./pages/dashboard/HomePage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ContactPage from "./pages/dashboard/ContactPage";
import AboutPage from "./pages/dashboard/AboutPage";

// Operator Pages
import LiveVideoFeedPage from "./pages/operator/LiveVideoFeedPage";
import RealTimeAlertsPage from "./pages/operator/RealTimeAlertsPage";
import ZoneMapPage from "./pages/operator/ZoneMapPage";
import AICommandCenterPage from "./pages/operator/AICommandCenterPage";
import IncidentTimelinePage from "./pages/operator/IncidentTimelinePage";

// Admin Pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import NotificationManagementPage from "./pages/admin/NotificationManagementPage";
import AnalyticsReportsPage from "./pages/admin/AnalyticsReportsPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import SecurityAuditPage from "./pages/admin/SecurityAuditPage";
import ZoneManagementPage from "./pages/admin/ZoneManagementPage";

// Responder Pages
import AssignedTasksPage from "./pages/responder/AssignedTasksPage";
import ResponderMapPage from "./pages/responder/ResponderMapPage";
import QuickActionsPage from "./pages/responder/QuickActionsPage";
import StatusCommunicationPage from "./pages/responder/StatusCommunicationPage";
import IncidentReportsPage from "./pages/responder/IncidentReportsPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/dashboard' replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div
			className='min-h-screen bg-gradient-to-br
    from-gray-900 via-blue-900 to-cyan-900 relative overflow-hidden'
		>
			<FloatingShape color='bg-blue-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-cyan-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-blue-400' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				{/* Dashboard Routes */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<HomePage />} />
					<Route path='profile' element={<ProfilePage />} />
					<Route path='contact' element={<ContactPage />} />
					<Route path='about' element={<AboutPage />} />
					
					{/* Operator Routes */}
					<Route path='operator/video-feed' element={<LiveVideoFeedPage />} />
					<Route path='operator/alerts' element={<RealTimeAlertsPage />} />
					<Route path='operator/zone-map' element={<ZoneMapPage />} />
					<Route path='operator/command-center' element={<AICommandCenterPage />} />
					<Route path='operator/timeline' element={<IncidentTimelinePage />} />
					
					{/* Admin Routes */}
					<Route path='admin/users' element={<UserManagementPage />} />
					<Route path='admin/notifications' element={<NotificationManagementPage />} />
					<Route path='admin/analytics' element={<AnalyticsReportsPage />} />
					<Route path='admin/settings' element={<SystemSettingsPage />} />
					<Route path='admin/security' element={<SecurityAuditPage />} />
					<Route path='admin/zones' element={<ZoneManagementPage />} />
					
					{/* Responder Routes */}
					<Route path='responder/tasks' element={<AssignedTasksPage />} />
					<Route path='responder/map' element={<ResponderMapPage />} />
					<Route path='responder/actions' element={<QuickActionsPage />} />
					<Route path='responder/communication' element={<StatusCommunicationPage />} />
					<Route path='responder/reports' element={<IncidentReportsPage />} />
				</Route>

				{/* Legacy Dashboard Route - redirect to new dashboard */}
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<Navigate to='/dashboard' replace />
						</ProtectedRoute>
					}
				/>

				{/* Auth Routes */}
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
