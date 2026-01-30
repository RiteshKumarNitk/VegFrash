import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/theme_controller.dart';
import '../../controllers/order_controller.dart';
import 'widgets/festival_banner.dart';
import '../../controllers/cart_controller.dart';
import '../screens/cart_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    Get.put(OrderController());
    final themeCtrl = Get.find<ThemeController>();
    
    // Mock Categories
    final categories = [
      {'name': 'Vegetables', 'icon': '🥦'},
      {'name': 'Fruits', 'icon': '🍎'},
      {'name': 'Greens', 'icon': '🥬'},
      {'name': 'Exotic', 'icon': '🥑'},
      {'name': 'Seasonal', 'icon': '🥭'},
      {'name': 'Pooja', 'icon': '🥥'},
    ];

    return Obx(() {
      final theme = themeCtrl.currentTheme.value;
      
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        appBar: AppBar(
          backgroundColor: theme.scaffoldBackgroundColor,
          elevation: 0,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "VegFrash", 
                style: TextStyle(
                  color: theme.primaryColor, 
                  fontWeight: FontWeight.bold,
                  fontSize: 24
                )
              ),
              const Text(
                "Koramangala • 10 mins", 
                style: TextStyle(color: Colors.grey, fontSize: 12)
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.notifications_outlined, color: theme.primaryColor),
              onPressed: () {},
            ),
             IconButton(
              icon: Icon(Icons.shopping_cart_outlined, color: theme.primaryColor),
              onPressed: () => Get.to(() => const CartScreen()),
            ),
          ],
        ),
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Dynamic Banner
              const FestivalBanner(),
              
              // 2. Categories
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Text(
                  "Shop by Category", 
                  style: TextStyle(
                    fontSize: 18, 
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800
                  )
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 100,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: categories.length,
                  separatorBuilder: (_,__) => const SizedBox(width: 16),
                  itemBuilder: (ctx, index) {
                    return Column(
                      children: [
                         Container(
                           width: 64, 
                           height: 64,
                           decoration: BoxDecoration(
                             color: Colors.grey.shade100,
                             shape: BoxShape.circle,
                             border: Border.all(
                               color: theme.primaryColor.withOpacity(0.2)
                             )
                           ),
                           alignment: Alignment.center,
                           child: Text(
                             categories[index]['icon']!, 
                             style: const TextStyle(fontSize: 28)
                           ),
                         ),
                         const SizedBox(height: 8),
                         Text(
                           categories[index]['name']!, 
                           style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)
                         )
                      ],
                    );
                  },
                ),
              ),
              
              const SizedBox(height: 24),
              
              // 3. Featured Products Mock
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                     Text(
                        "Fresh & Fast", 
                        style: TextStyle(
                          fontSize: 18, 
                          fontWeight: FontWeight.bold,
                          color: Colors.grey.shade800
                        )
                      ),
                      Text("See all", style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold))
                  ],
                ),
              ),
              
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                itemCount: 3,
                itemBuilder: (ctx, index) {
                   return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                         color: theme.cardTheme.color,
                         borderRadius: BorderRadius.circular(12),
                         boxShadow: [
                            BoxShadow(color: Colors.grey.shade200, blurRadius: 4, offset: const Offset(0,2))
                         ]
                      ),
                      child: Row(
                         children: [
                            Container(width: 60, height: 60, color: Colors.grey.shade200, borderRadius: BorderRadius.circular(8)),
                            const SizedBox(width: 12),
                            Expanded(
                               child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                     Text("Fresh Spinach (Palak)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.grey.shade900)),
                                     Text("500g • Grade A", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                                  ],
                               )
                            ),
                            Column(
                               crossAxisAlignment: CrossAxisAlignment.end,
                               children: [
                                  Text("₹40", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.grey.shade900)),
                                  const SizedBox(height: 4),
                               ],
                            ),
                            const SizedBox(width: 8),
                            InkWell(
                              onTap: () {
                                Get.find<CartController>().addItem(
                                  "prod_$index", 
                                  "Fresh Spinach", 
                                  40.0, 
                                  "kg"
                                );
                                Get.snackbar("Added", "Fresh Spinach added to basket", 
                                  snackPosition: SnackPosition.BOTTOM,
                                  duration: const Duration(milliseconds: 800),
                                  margin: const EdgeInsets.all(16),
                                  backgroundColor: theme.primaryColor,
                                  colorText: Colors.white
                                );
                              },
                              child: Container(
                                 padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                 decoration: BoxDecoration(
                                    color: theme.primaryColor,
                                    borderRadius: BorderRadius.circular(6)
                                 ),
                                 child: const Text("ADD", style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            )
                               ],
                            )
                         ],
                      ),
                   );
                },
              )
            ],
          ),
        ),
      );
    });
  }
}
