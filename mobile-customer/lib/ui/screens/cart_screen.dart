import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/cart_controller.dart';
import '../../controllers/theme_controller.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cartCtrl = Get.put(CartController());
    final themeCtrl = Get.find<ThemeController>();

    return Obx(() {
       final theme = themeCtrl.currentTheme.value;
       
       return Scaffold(
         backgroundColor: theme.scaffoldBackgroundColor,
         appBar: AppBar(
            title: Text("Your Basket", style: TextStyle(color: theme.primaryColor, fontWeight: FontWeight.bold)),
            backgroundColor: theme.scaffoldBackgroundColor,
            elevation: 0,
            iconTheme: IconThemeData(color: Colors.black),
         ),
         body: cartCtrl.items.isEmpty 
           ? Center(
               child: Column(
                 mainAxisAlignment: MainAxisAlignment.center,
                 children: [
                   Icon(Icons.shopping_basket_outlined, size: 64, color: Colors.grey.shade300),
                   const SizedBox(height: 16),
                   Text("Your basket is empty", style: TextStyle(color: Colors.grey.shade500)),
                   const SizedBox(height: 24),
                   ElevatedButton(
                     onPressed: () => Get.back(),
                     style: ElevatedButton.styleFrom(
                       backgroundColor: theme.primaryColor,
                       foregroundColor: Colors.white
                     ),
                     child: const Text("Start Shopping"),
                   )
                 ],
               ),
             )
           : Column(
             children: [
               Expanded(
                 child: ListView.separated(
                   padding: const EdgeInsets.all(16),
                   itemCount: cartCtrl.items.length,
                   separatorBuilder: (_,__) => const SizedBox(height: 12),
                   itemBuilder: (ctx, index) {
                     final item = cartCtrl.items.values.elementAt(index);
                     return Obx(() => Container(
                       padding: const EdgeInsets.all(12),
                       decoration: BoxDecoration(
                         color: Colors.white,
                         borderRadius: BorderRadius.circular(12),
                         boxShadow: [BoxShadow(color: Colors.grey.shade100, blurRadius: 4)]
                       ),
                       child: Row(
                         children: [
                            // Veg Icon Placeholder
                           Container(
                             width: 40, height: 40, 
                             decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                             alignment: Alignment.center,
                             child: const Text("🥦", style: TextStyle(fontSize: 20)),
                           ),
                           const SizedBox(width: 12),
                           Expanded(
                             child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                 Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                 Text(
                                   "₹${item.price} / ${item.unit}", 
                                   style: TextStyle(color: Colors.grey.shade500, fontSize: 12)
                                 ),
                               ],
                             ),
                           ),
                           // Qty Control
                           Container(
                             decoration: BoxDecoration(
                               border: Border.all(color: Colors.grey.shade300),
                               borderRadius: BorderRadius.circular(8)
                             ),
                             child: Row(
                               children: [
                                 InkWell(
                                   onTap: () => cartCtrl.decrement(item.id),
                                   child: const Padding(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), child: Icon(Icons.remove, size: 16)),
                                 ),
                                 Text(
                                   "${item.quantity.value} ${item.unit}",
                                   style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)
                                 ),
                                 InkWell(
                                   onTap: () => cartCtrl.increment(item.id),
                                   child: const Padding(padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4), child: Icon(Icons.add, size: 16, color: Colors.green)),
                                 ),
                               ],
                             ),
                           ),
                           const SizedBox(width: 12),
                           Text(
                             "₹${item.total}", 
                             style: const TextStyle(fontWeight: FontWeight.bold)
                           ),
                         ],
                       ),
                     ));
                   },
                 ),
               ),
               
               // Bill Summary
               Container(
                 padding: const EdgeInsets.all(20),
                 decoration: BoxDecoration(
                   color: Colors.white,
                   borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                   boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0,-4))]
                 ),
                 child: Column(
                   children: [
                     Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                       const Text("Item Total"),
                       Text("₹${cartCtrl.totalAmount}")
                     ]),
                     const SizedBox(height: 8),
                     Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                       const Text("Delivery Fee"),
                       const Text("₹15", style: TextStyle(fontWeight: FontWeight.bold))
                     ]),
                     const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider()),
                     Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                       const Text("To Pay", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                       Text("₹${cartCtrl.totalAmount + 15}", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold))
                     ]),
                     const SizedBox(height: 16),
                     SizedBox(
                       width: double.infinity,
                       child: ElevatedButton(
                         onPressed: () {
                           // Navigate to Checkout
                         },
                         style: ElevatedButton.styleFrom(
                           backgroundColor: theme.primaryColor,
                           foregroundColor: Colors.white,
                           padding: const EdgeInsets.symmetric(vertical: 16),
                           shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                         ),
                         child: const Text("Proceed to Pay", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                       ),
                     )
                   ],
                 ),
               )
             ],
           ),
       );
    });
  }
}
