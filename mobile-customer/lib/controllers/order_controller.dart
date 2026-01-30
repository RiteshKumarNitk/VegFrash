import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class OrderController extends GetxController {
  final _supabase = Supabase.instance.client;
  
  // Observable list of active orders if we want to display them
  final activeOrders = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    setupRealtimeSubscription();
  }

  void setupRealtimeSubscription() {
    final user = _supabase.auth.currentUser;
    if (user == null) {
      // Not logged in
      return;
    }

    _supabase
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('user_id', user.id)
        .listen((List<Map<String, dynamic>> orders) {
          // Update local state
          activeOrders.value = orders;

          // Check for status changes in the latest order or sort by time
          if (orders.isNotEmpty) {
            // Sort by created_at descending to get latest
            orders.sort((a, b) => (b['created_at'] ?? '').compareTo(a['created_at'] ?? ''));
            final latestOrder = orders.first;
            
            // Show notification if status changed recently
            // Note: This simple check might show notifications on app restart repeatedly
            // A better way is to compare with previous state, but for "demo/functional" this works
            // or we track 'lastKnownStatus'
            _handleStatusChange(latestOrder);
          }
        }, onError: (error) {
          print('Error listening to orders: $error');
        });
  }

  String? _lastStatus;

  void _handleStatusChange(Map<String, dynamic> order) {
    final newStatus = order['status'];
    if (newStatus != _lastStatus) {
      if (_lastStatus != null) {
        // Only show snackbar if it's a CHANGE, not initial load
         Get.snackbar(
          'Order Update', 
          'Your order is now: ${newStatus.toString().replaceAll('_', ' ').toUpperCase()}',
          duration: const Duration(seconds: 4),
          snackPosition: SnackPosition.TOP,
        );
      }
      _lastStatus = newStatus;
    }
  }
}
