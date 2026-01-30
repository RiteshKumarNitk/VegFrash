import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/theme_controller.dart';

class FestivalBanner extends StatelessWidget {
  const FestivalBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final themeCtrl = Get.find<ThemeController>();

    return Obx(() {
      final config = themeCtrl.festivalConfig.value;
      
      // Default State (No active festival)
      if (config == null || !config.isActive) {
        return Container(
          margin: const EdgeInsets.all(16),
          height: 160,
          decoration: BoxDecoration(
            color: Colors.green.shade800,
            borderRadius: BorderRadius.circular(16),
            image: const DecorationImage(
               image: NetworkImage('https://via.placeholder.com/800x400'), // Replace with real asset
               fit: BoxFit.cover,
               opacity: 0.6
            )
          ),
          alignment: Alignment.center,
          child: const Text(
            "Fresh Veggies\nIn 10 Mins",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
        );
      }

      // Festival State
      return Container(
        margin: const EdgeInsets.all(16),
        height: 180,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          // Fallback gradient if image fails or loading
          gradient: LinearGradient(
             colors: [
                themeCtrl.currentTheme.value.primaryColor, 
                themeCtrl.currentTheme.value.colorScheme.secondary
             ],
             begin: Alignment.topLeft,
             end: Alignment.bottomRight,
          ),
          boxShadow: [
             BoxShadow(
                color: themeCtrl.currentTheme.value.primaryColor.withOpacity(0.4),
                blurRadius: 10,
                offset: const Offset(0, 4),
             )
          ]
        ),
        child: Stack(
          children: [
             // Background Image (if available in config)
             if (config.assets.homeBanner.isNotEmpty)
                ClipRRect(
                   borderRadius: BorderRadius.circular(16),
                   child: Image.network(
                      config.assets.homeBanner,
                      width: double.infinity,
                      height: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_,__,___) => const SizedBox(), // Hide on error
                   ),
                ),
                
             // Overlay Content
             Padding(
               padding: const EdgeInsets.all(20.0),
               child: Column(
                 mainAxisAlignment: MainAxisAlignment.center,
                 crossAxisAlignment: CrossAxisAlignment.start,
                 children: [
                   Text(
                     config.headline.isNotEmpty ? config.headline : "Festival Special",
                     style: const TextStyle(
                       color: Colors.white,
                       fontSize: 22,
                       fontWeight: FontWeight.bold,
                       shadows: [Shadow(color: Colors.black26, blurRadius: 4)]
                     ),
                   ),
                   const SizedBox(height: 8),
                   ElevatedButton(
                     onPressed: () {},
                     style: ElevatedButton.styleFrom(
                       backgroundColor: Colors.white,
                       foregroundColor: themeCtrl.currentTheme.value.primaryColor,
                       shape: const StadiumBorder(),
                     ),
                     child: const Text("Shop Now"),
                   )
                 ],
               ),
             ),
             
             // Simple Particle Mock (Corner Decoration)
             Positioned(
                top: -10,
                right: -10,
                child: Icon(Icons.star, color: Colors.white.withOpacity(0.3), size: 100),
             )
          ],
        ),
      );
    });
  }
}
