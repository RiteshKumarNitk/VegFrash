import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/festival_config.dart';

class ThemeController extends GetxController {
  final _supabase = Supabase.instance.client;
  
  Rx<ThemeData> currentTheme = ThemeData.light().obs;
  Rx<FestivalConfig?> festivalConfig = Rx(null);
  RxBool isLoading = true.obs;
  ThemeData _buildBlinkitTheme({Color? primary}) {
    return ThemeData(
      primaryColor: primary ?? const Color(0xFF0C831F),
      scaffoldBackgroundColor: Colors.white,
      useMaterial3: true,
      textTheme: GoogleFonts.outfitTextTheme(),
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary ?? const Color(0xFF0C831F),
        primary: primary ?? const Color(0xFF0C831F),
        secondary: const Color(0xFFF7CB45), // Blinkit Yellow
        surface: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: IconThemeData(color: Color(0xFF1E293B)),
        titleTextStyle: TextStyle(
          color: Color(0xFF1E293B),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.grey.shade100),
        ),
      ),
    );
  }

  Future<void> _fetchActiveTheme() async {
    try {
      final response = await _supabase
          .from('active_themes')
          .select('*, festival_calendar(*)')
          .eq('is_active', true)
          .maybeSingle();

      if (response != null) {
        final configData = response['festival_calendar']['config_json'];
        if (configData != null) {
          final config = FestivalConfig.fromJson(configData);
          applyFestivalTheme(config);
          return;
        }
      }
      // Set Default Blinkit Theme if no active festival
      currentTheme.value = _buildBlinkitTheme();
    } catch (e) {
      print('Error fetching theme: $e');
      currentTheme.value = _buildBlinkitTheme();
    } finally {
      isLoading.value = false;
    }
  }

  void _subscribeToThemeChanges() {
    _supabase
        .from('active_themes')
        .stream(primaryKey: ['id'])
        .listen((data) {
           _fetchActiveTheme(); 
        });
  }

  void applyFestivalTheme(FestivalConfig config) {
    festivalConfig.value = config;
    
    currentTheme.value = _buildBlinkitTheme(
      primary: _hexToColor(config.colors.primary),
    ).copyWith(
      scaffoldBackgroundColor: _hexToColor(config.colors.background),
    );
    update();
  }

  Color _hexToColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF' + hex;
    }
    return Color(int.parse(hex, radix: 16));
  }
}
