import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'theme.dart';

class AppShell extends StatelessWidget {
  final Widget child;
  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final currentIndex = _locationToIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surface2,
          border: Border(top: BorderSide(color: AppTheme.border, width: 1)),
        ),
        child: NavigationBar(
          backgroundColor: AppTheme.surface2,
          selectedIndex: currentIndex,
          indicatorColor: AppTheme.purple.withOpacity(0.15),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          onDestinationSelected: (i) => context.go(_indexToLocation(i)),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.shield_outlined), selectedIcon: Icon(Icons.shield), label: 'Rules'),
            NavigationDestination(icon: Icon(Icons.timer_outlined), selectedIcon: Icon(Icons.timer), label: 'Sessions'),
            NavigationDestination(icon: Icon(Icons.bar_chart_outlined), selectedIcon: Icon(Icons.bar_chart), label: 'Analytics'),
            NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: 'Settings'),
          ],
        ),
      ),
    );
  }

  int _locationToIndex(String loc) {
    if (loc.startsWith('/dashboard'))  return 0;
    if (loc.startsWith('/rules'))      return 1;
    if (loc.startsWith('/sessions'))   return 2;
    if (loc.startsWith('/analytics'))  return 3;
    if (loc.startsWith('/settings'))   return 4;
    return 0;
  }

  String _indexToLocation(int i) => [
    '/dashboard', '/rules', '/sessions', '/analytics', '/settings'
  ][i];
}
