import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'controllers/theme_controller.dart';
import 'ui/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase (Use placeholder or real keys)
  // For now we use placeholders, User needs to fill these in .env or here
  await Supabase.initialize(
    url: 'https://xyzcompany.supabase.co',
    anonKey: 'public-anon-key',
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Inject Controller
    final themeCtrl = Get.put(ThemeController());

    return Obx(() {
      return GetMaterialApp(
        title: 'VegFrash',
        debugShowCheckedModeBanner: false,
        theme: themeCtrl.currentTheme.value,
        home: LoginScreen(),
      );
    });
  }
}
