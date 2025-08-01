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
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OperatorDashboard from "./pages/dashboard/OperatorDashboard";
import ResponderDashboard from "./pages/dashboard/ResponderDashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ContactPage from "./pages/dashboard/ContactPage";
import AboutPage from "./pages/dashboard/AboutPage";

// Operator-specific pages
import LiveVideoFeedPage from "./pages/operator/LiveVideoFeedPage";
import RealTimeAlertsPage from "./pages/operator/RealTimeAlertsPage";
import ZoneMapPage from "./pages/operator/ZoneMapPage";
import AICommandCenterPage from "./pages/operator/AICommandCenterPage";
import IncidentTimelinePage from "./pages/operator/IncidentTimelinePage";

// Responder-specific pages
import AssignedTasksPage from "./pages/responder/AssignedTasksPage";
import ResponderMapPage from "./pages/responder/ResponderMapPage";
import QuickActionsPage from "./pages/responder/QuickActionsPage";
import StatusCommunicationPage from "./pages/responder/StatusCommunicationPage";
import IncidentReportsPage from "./pages/responder/IncidentReportsPage";

// Admin-specific pages
import UserManagementPage from "./pages/admin/UserManagementPage";
import AnalyticsReportsPage from "./pages/admin/AnalyticsReportsPage";
import SystemSettingsPage from "./pages/admin/SystemSettingsPage";
import SecurityAuditPage from "./pages/admin/SecurityAuditPage";
import ZoneManagementPage from "./pages/admin/ZoneManagementPage";
import NotificationManagementPage from "./pages/admin/NotificationManagementPage";

// Test pages
import MapTestPage from "./pages/MapTestPage";
import NotificationTestPage from "./pages/NotificationTestPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import NotificationModalProvider from "./components/notifications/NotificationModalProvider";
import ModalTestButton from "./components/debug/ModalTestButton";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user?.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the appropriate dashboard
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user, getRoleBasedRoute } = useAuthStore();

	if (isAuthenticated && user?.isVerified) {
		const dashboardRoute = getRoleBasedRoute();
		return <Navigate to={dashboardRoute} replace />;
	}

	return children;
};

// Component to redirect to role-based dashboard
const RoleBasedRedirect = () => {
	const { getRoleBasedRoute } = useAuthStore();
	const dashboardRoute = getRoleBasedRoute();
	return <Navigate to={dashboardRoute} replace />;
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
    from-gray-900 via-green-900 to-emerald-900 relative overflow-hidden'
		>
			<FloatingShape color='bg-green-500' size='w-64 h-64' top='-5%' left='10%' delay={0} />
			<FloatingShape color='bg-emerald-500' size='w-48 h-48' top='70%' left='80%' delay={5} />
			<FloatingShape color='bg-lime-500' size='w-32 h-32' top='40%' left='-10%' delay={2} />

			<Routes>
				{/* Role-based Dashboard Routes */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					{/* Default dashboard - redirects to role-based dashboard */}
					<Route
						index
						element={<RoleBasedRedirect />}
					/>

					{/* Role-specific dashboard routes */}
					<Route
						path='admin'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<AdminDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<OperatorDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<ResponderDashboard />
							</RoleProtectedRoute>
						}
					/>

					{/* Operator-specific routes */}
					<Route
						path='operator/video-feed'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<LiveVideoFeedPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator/alerts'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<RealTimeAlertsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator/zone-map'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<ZoneMapPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator/command-center'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<AICommandCenterPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator/timeline'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<IncidentTimelinePage />
							</RoleProtectedRoute>
						}
					/>

					{/* Responder-specific routes */}
					<Route
						path='responder/tasks'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<AssignedTasksPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder/map'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<ResponderMapPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder/actions'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<QuickActionsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder/communication'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<StatusCommunicationPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder/reports'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<IncidentReportsPage />
							</RoleProtectedRoute>
						}
					/>

					{/* Admin-specific routes */}
					<Route
						path='admin/users'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<UserManagementPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/analytics'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<AnalyticsReportsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/settings'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<SystemSettingsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/security'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<SecurityAuditPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/zones'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ZoneManagementPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/notifications'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<NotificationManagementPage />
							</RoleProtectedRoute>
						}
					/>

					{/* Common dashboard routes accessible to all authenticated users */}
					<Route path='profile' element={<ProfilePage />} />
					<Route path='contact' element={<ContactPage />} />
					<Route path='about' element={<AboutPage />} />
				</Route>

				{/* Root route - redirect to role-based dashboard */}
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<RoleBasedRedirect />
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

				{/* Test routes */}
				<Route path='/map-test' element={<MapTestPage />} />
				<Route path='/notification-test' element={<NotificationTestPage />} />

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
			<Toaster />
			<NotificationModalProvider />
			<ModalTestButton />
		</div>
	);
}

export default App;
