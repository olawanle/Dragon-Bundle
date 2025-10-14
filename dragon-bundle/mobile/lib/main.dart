import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'providers/bundle_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/products_screen.dart';
import 'screens/bundle_builder_screen.dart';
import 'screens/my_bundles_screen.dart';
import 'screens/bundle_preview_screen.dart';
import 'screens/settings_screen.dart';

void main() {
  runApp(const DragonBundleApp());
}

class DragonBundleApp extends StatelessWidget {
  const DragonBundleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => BundleProvider()),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return MaterialApp.router(
            title: 'Dragon Bundle',
            theme: ThemeData(
              primarySwatch: Colors.green,
              primaryColor: const Color(0xFF38E07B),
              scaffoldBackgroundColor: const Color(0xFFF6F8F7),
              fontFamily: 'Manrope',
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFFF6F8F7),
                foregroundColor: Colors.black,
                elevation: 0,
                centerTitle: true,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF38E07B),
                  foregroundColor: const Color(0xFF122017),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
              cardTheme: CardTheme(
                color: Colors.white,
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            darkTheme: ThemeData(
              primarySwatch: Colors.green,
              primaryColor: const Color(0xFF38E07B),
              scaffoldBackgroundColor: const Color(0xFF122017),
              fontFamily: 'Manrope',
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFF122017),
                foregroundColor: Colors.white,
                elevation: 0,
                centerTitle: true,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF38E07B),
                  foregroundColor: const Color(0xFF122017),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
              ),
              cardTheme: CardTheme(
                color: const Color(0xFF1A2B1F),
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            routerConfig: _router,
          );
        },
      ),
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/products',
      builder: (context, state) => const ProductsScreen(),
    ),
    GoRoute(
      path: '/bundle-builder',
      builder: (context, state) => const BundleBuilderScreen(),
    ),
    GoRoute(
      path: '/my-bundles',
      builder: (context, state) => const MyBundlesScreen(),
    ),
    GoRoute(
      path: '/bundle-preview/:bundleId',
      builder: (context, state) {
        final bundleId = int.parse(state.pathParameters['bundleId']!);
        return BundlePreviewScreen(bundleId: bundleId);
      },
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
  ],
);

