import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/signup_screen.dart';
import '../features/onboarding/screens/onboarding_screen.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/rules/screens/rules_screen.dart';
import '../features/rules/screens/rule_editor_screen.dart';
import '../features/sessions/screens/sessions_screen.dart';
import '../features/analytics/screens/analytics_screen.dart';
import '../features/partner/screens/partner_screen.dart';
import '../features/settings/screens/settings_screen.dart';
import '../features/settings/screens/hard_mode_screen.dart';
import '../features/auth/providers/auth_provider.dart';
import 'shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isOnboarding = state.matchedLocation == '/onboarding';

      if (!isLoggedIn && !isAuthRoute) return '/auth/login';
      if (isLoggedIn && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      // Auth routes
      GoRoute(path: '/auth/login',  builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/auth/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(path: '/onboarding',  builder: (_, __) => const OnboardingScreen()),

      // App shell (bottom nav)
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(path: '/dashboard',  builder: (_, __) => const DashboardScreen()),
          GoRoute(path: '/rules',      builder: (_, __) => const RulesScreen(),
            routes: [
              GoRoute(path: 'edit/:id', builder: (_, s) => RuleEditorScreen(ruleId: s.pathParameters['id'])),
              GoRoute(path: 'new',      builder: (_, __) => const RuleEditorScreen()),
            ],
          ),
          GoRoute(path: '/sessions',   builder: (_, __) => const SessionsScreen()),
          GoRoute(path: '/analytics',  builder: (_, __) => const AnalyticsScreen()),
          GoRoute(path: '/partner',    builder: (_, __) => const PartnerScreen()),
          GoRoute(path: '/settings',   builder: (_, __) => const SettingsScreen(),
            routes: [
              GoRoute(path: 'hard-mode', builder: (_, __) => const HardModeScreen()),
            ],
          ),
        ],
      ),
    ],
  );
});
