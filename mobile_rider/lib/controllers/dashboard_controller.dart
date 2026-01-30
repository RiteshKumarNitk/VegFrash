import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardController extends GetxController {
  final _supabase = Supabase.instance.client;
  final String phone;
  
  DashboardController(this.phone);

  final isOnline = false.obs;
  final currentOrder = Rxn<Map<String, dynamic>>();
  final earningsToday = 0.0.obs;
  
  StreamSubscription<Position>? _positionStream;
  RealtimeChannel? _orderChannel;

  @override
  void onInit() {
    super.onInit();
    _fetchRiderStatus();
  }

  @override
  void onClose() {
    _positionStream?.cancel();
    _supabase.removeChannel(_orderChannel!);
    super.onClose();
  }

  Future<void> _fetchRiderStatus() async {
    final data = await _supabase.from('delivery_partners')
      .select()
      .eq('phone', phone)
      .maybeSingle();
      
    if (data != null) {
      isOnline.value = data['is_online'] ?? false;
      earningsToday.value = (data['earnings_today'] ?? 0).toDouble();
      
      if (isOnline.value) {
        _startLocationTracking();
      }
      
      // Check for active order
      if (data['current_order_id'] != null) {
          _fetchOrderDetails(data['current_order_id']);
      }
    }
  }

  Future<void> toggleOnline() async {
    final newState = !isOnline.value;
    
    // Check permissions
    if (newState) {
       LocationPermission permission = await Geolocator.checkPermission();
       if (permission == LocationPermission.denied) {
         permission = await Geolocator.requestPermission();
         if (permission == LocationPermission.denied) {
           Get.snackbar('Error', 'Location permission needed');
           return;
         }
       }
    }

    try {
      await _supabase.from('delivery_partners')
        .update({'is_online': newState})
        .eq('phone', phone);
        
      isOnline.value = newState;
      
      if (newState) {
        _startLocationTracking();
        _listenForOrders();
      } else {
        _positionStream?.cancel();
        _supabase.removeChannel(_orderChannel!);
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to update status');
    }
  }

  void _startLocationTracking() {
    // Update location every 10 seconds or 100 meters
    _positionStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 50)
    ).listen((Position position) {
        _updateLocationDB(position);
    });
  }

  Future<void> _updateLocationDB(Position pos) async {
    // PostGIS format: POINT(long lat)
    final point = 'POINT(${pos.longitude} ${pos.latitude})';
    await _supabase.from('delivery_partners')
      .update({'current_location': point})
      .eq('phone', phone);
  }

  void _listenForOrders() {
    // Listen to MY row in delivery_partners to see if current_order_id changes
    _orderChannel = _supabase.channel('rider_updates_$phone')
      .on(
        RealtimeListenTypes.postgresChanges,
        ChannelFilter(event: 'UPDATE', schema: 'public', table: 'delivery_partners', filter: 'phone=eq.$phone'),
        (payload) {
           final newOrder = payload.newRecord['current_order_id'];
           if (newOrder != null && currentOrder.value == null) {
              // Assigned a new order!
              _fetchOrderDetails(newOrder);
              Get.snackbar('New Order!', 'You have been assigned an order', 
                duration: const Duration(seconds: 10),
                backgroundColor: Get.theme.colorScheme.primary,
                colorText: Get.theme.colorScheme.onPrimary
              );
           }
        }
      ).subscribe();
  }

  Future<void> _fetchOrderDetails(String orderId) async {
    final data = await _supabase.from('orders').select('*, locations(*)').eq('id', orderId).single();
    currentOrder.value = data;
  }
  
  Future<void> updateOrderStatus(String status) async {
      if (currentOrder.value == null) return;
      
      await _supabase.from('orders').update({'status': status}).eq('id', currentOrder.value!['id']);
      
      // Local update
      currentOrder.value = {...currentOrder.value!, 'status': status};
      currentOrder.refresh();
      
      if (status == 'delivered') {
          // Clear active order
          await _supabase.from('delivery_partners').update({'current_order_id': null}).eq('phone', phone);
          currentOrder.value = null;
          Get.snackbar('Success', 'Order Delivered!');
      }
  }
}
