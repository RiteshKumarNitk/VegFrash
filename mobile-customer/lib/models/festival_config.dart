class FestivalConfig {
  final String id;
  final bool isActive;
  final DateTime startDate;
  final DateTime endDate;
  final FestivalColors colors;
  final FestivalAssets assets;
  final String? particleEffect;
  final String headline;

  FestivalConfig({
    required this.id,
    required this.isActive,
    required this.startDate,
    required this.endDate,
    required this.colors,
    required this.assets,
    this.particleEffect,
    required this.headline,
  });

  factory FestivalConfig.fromJson(Map<String, dynamic> json) {
    return FestivalConfig(
      id: json['id'] ?? 'default',
      isActive: json['is_active'] ?? false,
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      colors: FestivalColors.fromJson(json['colors']),
      assets: FestivalAssets.fromJson(json['assets']),
      particleEffect: json['particle_effect'],
      headline: json['headline'] ?? '',
    );
  }
}

class FestivalColors {
  final String primary;
  final String secondary;
  final String accent;
  final String background;
  final String cardBackground;

  FestivalColors({
    required this.primary,
    required this.secondary,
    required this.accent,
    required this.background,
    required this.cardBackground,
  });

  factory FestivalColors.fromJson(Map<String, dynamic> json) {
    return FestivalColors(
      primary: json['primary'] ?? '#00BFA5',
      secondary: json['secondary'] ?? '#FFD700',
      accent: json['accent'] ?? '#E65100',
      background: json['background'] ?? '#FFFFFF',
      cardBackground: json['cardBackground'] ?? '#F5F5F5',
    );
  }
}

class FestivalAssets {
  final String homeBanner;
  final String loadingAnimation;

  FestivalAssets({
    required this.homeBanner,
    required this.loadingAnimation,
  });

  factory FestivalAssets.fromJson(Map<String, dynamic> json) {
    return FestivalAssets(
      homeBanner: json['home_banner'] ?? '',
      loadingAnimation: json['loading_animation'] ?? '',
    );
  }
}
