import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/festival_config.dart';

class ThemeController extends GetxController {
  final _supabase = Supabase.instance.client;
  
  Rx<ThemeData> currentTheme = ThemeData.light().obs;
  Rx<FestivalConfig?> festivalConfig = Rx(null);
  RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    _fetchActiveTheme();
    _subscribeToThemeChanges();
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
        }
      }
    } catch (e) {
      print('Error fetching theme: $e');
    } finally {
      isLoading.value = false;
    }
  }

  void _subscribeToThemeChanges() {
    _supabase
        .from('active_themes')
        .stream(primaryKey: ['id'])
        .listen((data) {
          if (data.isNotEmpty) {
             _fetchActiveTheme(); // Reload logic to get full config
          }
        });
  }

  void applyFestivalTheme(FestivalConfig config) {
    festivalConfig.value = config;
    
    currentTheme.value = ThemeData(
      primaryColor: _hexToColor(config.colors.primary),
      scaffoldBackgroundColor: _hexToColor(config.colors.background),
      cardTheme: CardThemeData(
        color: _hexToColor(config.colors.cardBackground),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: _hexToColor(config.colors.primary),
        secondary: _hexToColor(config.colors.secondary),
      ),
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
