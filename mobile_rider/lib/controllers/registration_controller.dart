import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../ui/screens/dashboard_screen.dart';

class RegistrationController extends GetxController {
  final _supabase = Supabase.instance.client;
  
  final currentStep = 0.obs;
  final isLoading = false.obs;
  
  // -- Form Controllers --
  // Step 1: Basic Info
  final nameCtrl = TextEditingController();
  final dobCtrl = TextEditingController();
  final bloodGroupCtrl = TextEditingController();

  // Step 2: Vehicle
  final vehicleModelCtrl = TextEditingController();
  final vehiclePlateCtrl = TextEditingController();
  final vehicleType = 'bike'.obs; // bike, scooter, ev

  // Step 3: KYC (Simple Text for now, would be File Upload URLs in real app)
  final aadharCtrl = TextEditingController();
  final panCtrl = TextEditingController();
  final licenseCtrl = TextEditingController();

  // Step 4: Banking
  final accountCtrl = TextEditingController();
  final ifscCtrl = TextEditingController();
  
  String? phone;

  void setPhone(String p) {
    phone = p;
  }
  
  void nextStep() {
    if (currentStep.value < 3) {
      currentStep.value++;
    } else {
      submitRegistration();
    }
  }

  void prevStep() {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  }

  Future<void> submitRegistration() async {
    if (phone == null) return;
    
    isLoading.value = true;
    try {
      final userId = _supabase.auth.currentUser?.id;
      
      // 1. Create Profile
      await _supabase.from('profiles').upsert({
         'id': userId,
         'full_name': nameCtrl.text,
         'phone': phone,
         'role': 'rider'
      });

      // 2. Create Delivery Partner Record
      await _supabase.from('delivery_partners').upsert({
        'user_id': userId,
        'phone': phone,
        'full_name': nameCtrl.text,
        'dob': dobCtrl.text.isNotEmpty ? dobCtrl.text : null, // ideally parse Date
        'blood_group': bloodGroupCtrl.text,
        
        'vehicle_type': vehicleType.value,
        'vehicle_model': vehicleModelCtrl.text,
        'vehicle_plate_number': vehiclePlateCtrl.text,
        
        'aadhar_number': aadharCtrl.text,
        'pan_number': panCtrl.text,
        'driving_license_number': licenseCtrl.text,
        
        'bank_account_number': accountCtrl.text,
        'ifsc_code': ifscCtrl.text,
        
        // Default Config
        'is_online': false,
        'is_kyc_verified': false, // Needs backend verification
      });
      
      Get.snackbar('Success', 'Registration Submitted! Waiting for Verification.');
      Get.offAll(() => const DashboardScreen(), arguments: phone);
      
    } catch (e) {
      print(e);
      Get.snackbar('Error', 'Registration Failed: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
