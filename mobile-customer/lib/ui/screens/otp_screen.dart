import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/theme_controller.dart';
import 'home_screen.dart';
import 'add_address_screen.dart';

class OtpScreen extends StatelessWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  Widget build(BuildContext context) {
    final themeCtrl = Get.find<ThemeController>();
    final theme = themeCtrl.currentTheme.value;

    // Auto-focus logic would go here
    
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.black),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             const Text(
                "Verify your number",
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 8),
              Text(
                "Enter the 6-digit code sent to +91 $phone",
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
              const SizedBox(height: 40),
              
              // Mock OTP Input (Just a text field for now)
              TextField(
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                maxLength: 6,
                style: const TextStyle(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
                decoration: InputDecoration(
                   counterText: "",
                   filled: true,
                   fillColor: Colors.grey.shade50,
                   border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade200)
                   ),
                   focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: theme.primaryColor, width: 2)
                   ),
                ),
              ),
              
              const SizedBox(height: 24),
              Center(
                 child: TextButton(
                    onPressed: () {}, 
                    child: Text("Resend Code in 24s", style: TextStyle(color: Colors.grey.shade500))
                 ),
              ),
              
              const Spacer(),
              
               SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Mock Success logic
                    // In real app: verify OTP -> get Session
                    
                    // For now, assume success and check flow:
                     Get.offAll(() => const AddAddressScreen()); 
                     // We redirect to Add Address first to ensure we capture location
                     // In real app, we would check: if(user.hasAddress) Home else AddAddress
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0
                  ),
                  child: const Text("Verify & Login", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
