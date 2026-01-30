import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../controllers/dashboard_controller.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Get arguments passed from Login
    final phone = Get.arguments as String;
    final ctrl = Get.put(DashboardController(phone));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Rider Dashboard'),
        actions: [
          Obx(() => Switch(
            value: ctrl.isOnline.value, 
            onChanged: (_) => ctrl.toggleOnline(),
            activeColor: Colors.greenAccent,
          ))
        ],
      ),
      body: Obx(() {
        if (!ctrl.isOnline.value) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.offline_bolt, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text("You are Offline", style: TextStyle(fontSize: 20)),
                const SizedBox(height: 8),
                ElevatedButton(
                  onPressed: ctrl.toggleOnline, 
                  child: const Text("GO ONLINE")
                )
              ],
            ),
          );
        }

        if (ctrl.currentOrder.value == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text("Finding orders nearby...", style: TextStyle(fontSize: 18)),
                SizedBox(height: 8),
                Text("Stay within 2km of store", style: TextStyle(color: Colors.grey))
              ],
            ),
          );
        }

        // Active Order View
        final order = ctrl.currentOrder.value!;
        final status = order['status'];

        return Column(
          children: [
             // Map Placeholder (Real map in Phase 2)
             Expanded(
               flex: 2,
               child: Container(
                 color: Colors.grey[200],
                 child: const Center(
                   child: Text("Map View (Nav)", style: TextStyle(color: Colors.grey)),
                 ),
               ),
             ),
             
             // Order Details Card
             Expanded(
               flex: 3,
               child: Container(
                 padding: const EdgeInsets.all(24),
                 decoration: BoxDecoration(
                   color: Colors.white,
                   borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                   boxShadow: [
                     BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)
                   ]
                 ),
                 child: Column(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                         Text("Order #${order['id'].substring(0,8)}", 
                           style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)
                         ),
                         Container(
                           padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                           decoration: BoxDecoration(
                             color: Colors.orange[100],
                             borderRadius: BorderRadius.circular(20)
                           ),
                           child: Text(status.toUpperCase(), 
                             style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange[800])
                           ),
                         )
                       ],
                     ),
                     const SizedBox(height: 16),
                     const ListTile(
                       contentPadding: EdgeInsets.zero,
                       leading: CircleAvatar(child: Icon(Icons.store)),
                       title: Text("Dark Store #12"),
                       subtitle: Text("Koramangala 4th Block"),
                     ),
                      const ListTile(
                       contentPadding: EdgeInsets.zero,
                       leading: CircleAvatar(child: Icon(Icons.person)),
                       title: Text("Customer Location"),
                       subtitle: Text("Nearest Point (Map Pin)"),
                     ),
                     
                     const Spacer(),
                     
                     if (status == 'picked_up' || status == 'out_for_delivery') ...[
                        ElevatedButton.icon(
                         onPressed: () {
                           // Open Google Maps
                           launchUrl(Uri.parse('https://www.google.com/maps/search/?api=1&query=12.9716,77.5946'));
                         },
                         icon: const Icon(Icons.navigation),
                         label: const Text("NAVIGATE"),
                         style: ElevatedButton.styleFrom(
                           minimumSize: const Size(double.infinity, 50),
                           backgroundColor: Colors.blueAccent,
                           foregroundColor: Colors.white
                         ),
                       ),
                       const SizedBox(height: 12),
                     ],

                     if (status == 'out_for_delivery') 
                        SliderButton(
                          label: "Slide to Complete",
                          onSlide: () => ctrl.updateOrderStatus('delivered'),
                        )
                     else if (status == 'packed')
                        ElevatedButton(
                         onPressed: () => ctrl.updateOrderStatus('out_for_delivery'),
                         style: ElevatedButton.styleFrom(
                           minimumSize: const Size(double.infinity, 50),
                           backgroundColor: Colors.orange,
                           foregroundColor: Colors.white
                         ),
                         child: const Text("PICK UP ORDER"),
                       )
                   ],
                 ),
               ),
             )
          ],
        );
      }),
    );
  }
}

// Simple Slide Button Placeholder
class SliderButton extends StatelessWidget {
  final String label;
  final VoidCallback onSlide;
  const SliderButton({super.key, required this.label, required this.onSlide});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
       onPressed: onSlide, // Make it a click for now instead of complex slide
       style: ElevatedButton.styleFrom(
         minimumSize: const Size(double.infinity, 54),
         backgroundColor: Colors.green,
         foregroundColor: Colors.white,
         shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
       ),
       child: Text(label.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
    );
  }
}
