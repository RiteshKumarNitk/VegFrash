import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AddressController extends GetxController {
  final _supabase = Supabase.instance.client;
  final isLoading = false.obs;

  // Form Fields
  final houseCtrl = TextEditingController();
  final floorCtrl = TextEditingController();
  final areaCtrl = TextEditingController();
  final landmarkCtrl = TextEditingController();
  final receiverNameCtrl = TextEditingController();
  final receiverPhoneCtrl = TextEditingController();
  
  // Metadata
  final selectedLabel = 'Home'.obs; // Home, Work, Other
  // Mock Lat/Long for now (Center of Bangalore)
  final selectedLocation = {'lat': 12.9716, 'long': 77.5946}.obs; 

  Future<void> saveAddress() async {
    isLoading.value = true;
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) {
        Get.snackbar('Error', 'User not logged in');
        return;
      }

      final point = 'POINT(${selectedLocation.value['long']} ${selectedLocation.value['lat']})';
      final fullText = "${houseCtrl.text}, ${areaCtrl.text}, Bangalore"; // Mock reverse geocoding

      await _supabase.from('customer_addresses').insert({
        'user_id': userId,
        'house_flat_no': houseCtrl.text,
        'floor_number': floorCtrl.text,
        'apartment_road_area': areaCtrl.text,
        'landmark': landmarkCtrl.text,
        'address_label': selectedLabel.value,
        'receiver_name': receiverNameCtrl.text.isNotEmpty ? receiverNameCtrl.text : null,
        'receiver_phone': receiverPhoneCtrl.text.isNotEmpty ? receiverPhoneCtrl.text : null,
        
        'lat_long': point,
        'full_address_text': fullText,
        'is_default': true // Set as default for now
      });

      Get.back(result: true); // Return success
      Get.snackbar('Success', 'Address Added Successfully');
      
    } catch (e) {
      Get.snackbar('Error', 'Failed to save address: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
