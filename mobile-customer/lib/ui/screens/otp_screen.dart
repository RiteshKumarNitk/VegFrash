import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'home_screen.dart';

class OtpScreen extends StatelessWidget {
  final String phone;
  final _otpController = TextEditingController();

  OtpScreen({super.key, required this.phone});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF1E293B), size: 20),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              
              Text(
                "Verify Number",
                style: GoogleFonts.outfit(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: const Color(0xFF1E293B),
                  letterSpacing: -0.5,
                ),
              ),
              
              const SizedBox(height: 12),
              
              RichText(
                text: TextSpan(
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    color: const Color(0xFF64748B),
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                  children: [
                    const TextSpan(text: "We've sent a 6-digit verification code to "),
                    TextSpan(
                      text: "+91 $phone",
                      style: const TextStyle(
                        color: Color(0xFF0C831F),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 48),
              
              // OTP Input Area
              Center(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: TextField(
                    controller: _otpController,
                    textAlign: TextAlign.center,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    style: GoogleFonts.outfit(
                      fontSize: 32,
                      letterSpacing: 18,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF1E293B),
                    ),
                    decoration: InputDecoration(
                      counterText: "",
                      hintText: "000000",
                      hintStyle: GoogleFonts.outfit(
                        color: const Color(0xFFCBD5E1),
                        letterSpacing: 18,
                      ),
                      filled: true,
                      fillColor: const Color(0xFFF8FAFC),
                      contentPadding: const EdgeInsets.symmetric(vertical: 24),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: const BorderSide(color: Color(0xFF0C831F), width: 2),
                      ),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              Center(
                child: Column(
                  children: [
                    Text(
                      "Didn't receive the code?",
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: Text(
                        "Resend Code",
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: const Color(0xFF0C831F),
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              
              const Spacer(),
              
              // Verify Button
              SizedBox(
                width: double.infinity,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0C831F).withOpacity(0.3),
                        blurRadius: 25,
                        offset: const Offset(0, 12),
                      )
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: () {
                      if (_otpController.text.length == 6) {
                        // Mock Success and navigate to Home
                        Get.offAll(
                          () => const HomeScreen(),
                          transition: Transition.fade,
                          duration: const Duration(milliseconds: 600),
                        );
                      } else {
                        Get.snackbar(
                          "Incomplete Code", 
                          "Please enter the 6-digit verification code",
                          snackPosition: SnackPosition.TOP,
                          backgroundColor: Colors.amber,
                          colorText: Colors.black,
                          margin: const EdgeInsets.all(20),
                          borderRadius: 15,
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0C831F),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                      elevation: 0,
                    ),
                    child: Text(
                      "Verify & Login",
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}
