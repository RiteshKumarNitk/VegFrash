import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'controllers/theme_controller.dart';
import 'controllers/cart_controller.dart';
import 'controllers/auth_controller.dart';
import 'ui/screens/home_screen.dart';
import 'ui/screens/main_screen.dart';
import 'controllers/navigation_controller.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Load environment variables
  await dotenv.load(fileName: "assets/.env");
  
  // Initialize Supabase
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Inject Controllers
    final themeCtrl = Get.put(ThemeController());
    Get.put(AuthController());
    Get.put(CartController());
    Get.put(NavigationController());

    return Obx(() {
      return GetMaterialApp(
        title: 'VegFrash',
        debugShowCheckedModeBanner: false,
        theme: themeCtrl.currentTheme.value,
        home: const MainScreen(),
      );
    });
  }
}
