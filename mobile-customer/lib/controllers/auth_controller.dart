import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthController extends GetxController {
  final SupabaseClient _supabase = Supabase.instance.client;
  
  var isLoading = false.obs;
  var currentUser = Rxn<User>();

  @override
  void onInit() {
    super.onInit();
    currentUser.value = _supabase.auth.currentUser;
    _supabase.auth.onAuthStateChange.listen((data) {
      currentUser.value = data.session?.user;
    });
  }

  // Send OTP via SMS or WhatsApp
  Future<bool> sendOtp({required String phone, required bool viaWhatsApp}) async {
    try {
      isLoading.value = true;
      
      // WhatsApp channel is supported by Supabase via Twilio/etc if configured
      // The 'channel' parameter in signInWithOtp is used for this
      await _supabase.auth.signInWithOtp(
        phone: '+91$phone',
        channel: viaWhatsApp ? OtpChannel.whatsapp : OtpChannel.sms,
      );
      
      return true;
    } catch (e) {
      Get.snackbar(
        "Error",
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Verify OTP
  Future<bool> verifyOtp({required String phone, required String token}) async {
    try {
      isLoading.value = true;
      
      final response = await _supabase.auth.verifyOTP(
        phone: '+91$phone',
        token: token,
        type: OtpType.sms, // Same type for WhatsApp usually
      );

      return response.user != null;
    } catch (e) {
      Get.snackbar(
        "Verification Failed",
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Login with Email/Password
  Future<bool> loginWithEmail({required String email, required String password}) async {
    try {
      isLoading.value = true;
      
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      return response.user != null;
    } catch (e) {
      Get.snackbar(
        "Login Failed",
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
      );
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // Sign Out
  Future<void> logout() async {
    await _supabase.auth.signOut();
  }
}
