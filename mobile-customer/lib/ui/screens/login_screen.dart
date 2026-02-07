import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'otp_screen.dart';
import '../../controllers/auth_controller.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authCtrl = Get.put(AuthController());
  
  bool _isEmailLogin = false;
  bool _viaWhatsApp = true; // Default to WhatsApp as per request

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background Gradient subtle
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF0C831F).withOpacity(0.05),
              ),
            ),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 40),
                  
                  // Logo / Branding
                  Hero(
                    tag: 'logo',
                    child: Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0C831F), Color(0xFF14A42A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(22),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0C831F).withOpacity(0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          )
                        ],
                      ),
                      child: const Icon(Icons.eco_rounded, color: Colors.white, size: 38),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  
                  Text(
                    "Welcome to\nVegFrash Store",
                    style: GoogleFonts.outfit(
                      fontSize: 34,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF1E293B),
                      height: 1.1,
                      letterSpacing: -1,
                    ),
                  ),
                  
                  const SizedBox(height: 12),
                  
                  Text(
                    "Freshness at your doorstep. Login to get the finest veggies.",
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      color: const Color(0xFF64748B),
                      fontWeight: FontWeight.w500,
                      height: 1.4,
                    ),
                  ),
                  
                  const SizedBox(height: 40),

                  // Login Type Toggle
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _isEmailLogin = false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: !_isEmailLogin ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: !_isEmailLogin ? [
                                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)
                                ] : [],
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                "Phone OTP",
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w700,
                                  color: !_isEmailLogin ? const Color(0xFF0C831F) : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _isEmailLogin = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: _isEmailLogin ? Colors.white : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: _isEmailLogin ? [
                                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)
                                ] : [],
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                "Email/Gmail",
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.w700,
                                  color: _isEmailLogin ? const Color(0xFF0C831F) : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),
                  
                  if (!_isEmailLogin) ...[
                    // Phone Input Area
                    Text(
                      "MOBILE NUMBER",
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF94A3B8),
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      child: Row(
                        children: [
                          Text(
                            "🇮🇳 +91",
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                              color: const Color(0xFF1E293B),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              maxLength: 10,
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF1E293B),
                                letterSpacing: 2,
                              ),
                              decoration: InputDecoration(
                                border: InputBorder.none,
                                counterText: "",
                                hintText: "00000 00000",
                                hintStyle: GoogleFonts.outfit(
                                  color: const Color(0xFFCBD5E1),
                                  letterSpacing: 2,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // WhatsApp / SMS Selection
                    Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _viaWhatsApp = true),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: _viaWhatsApp ? const Color(0xFF0C831F) : const Color(0xFFE2E8F0),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                color: _viaWhatsApp ? const Color(0xFF0C831F).withOpacity(0.05) : Colors.transparent,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const FaIcon(FontAwesomeIcons.whatsapp, color: Color(0xFF25D366), size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    "WhatsApp",
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.w700,
                                      color: _viaWhatsApp ? const Color(0xFF0C831F) : const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _viaWhatsApp = false),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: !_viaWhatsApp ? const Color(0xFF0C831F) : const Color(0xFFE2E8F0),
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(16),
                                color: !_viaWhatsApp ? const Color(0xFF0C831F).withOpacity(0.05) : Colors.transparent,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.sms_outlined, color: Color(0xFF64748B), size: 20),
                                  const SizedBox(width: 8),
                                  Text(
                                    "SMS",
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.w700,
                                      color: !_viaWhatsApp ? const Color(0xFF0C831F) : const Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    // Email Login Area
                    Text(
                      "GMAIL / EMAIL",
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF94A3B8),
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                      child: TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: "example@gmail.com",
                          icon: Icon(Icons.email_outlined, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    Text(
                      "PASSWORD",
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF94A3B8),
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                      child: TextField(
                        controller: _passwordController,
                        obscureText: true,
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: "••••••••",
                          icon: Icon(Icons.lock_outline_rounded, color: Color(0xFF94A3B8)),
                        ),
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: 60),
                  
                  // CTA Button
                  Obx(() => SizedBox(
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
                        onPressed: _authCtrl.isLoading.value ? null : () async {
                          if (_isEmailLogin) {
                            if (_emailController.text.isNotEmpty && _passwordController.text.isNotEmpty) {
                              final success = await _authCtrl.loginWithEmail(
                                email: _emailController.text,
                                password: _passwordController.text,
                              );
                              if (success) {
                                // Handled by main.dart listener or direct navigate
                                Get.snackbar("Success", "Welcome back!");
                              }
                            } else {
                              Get.snackbar("Error", "Please fill all fields");
                            }
                          } else {
                            if (_phoneController.text.length == 10) {
                              final success = await _authCtrl.sendOtp(
                                phone: _phoneController.text,
                                viaWhatsApp: _viaWhatsApp,
                              );
                              if (success) {
                                Get.to(
                                  () => OtpScreen(phone: _phoneController.text),
                                  transition: Transition.rightToLeftWithFade,
                                  duration: const Duration(milliseconds: 400),
                                );
                              }
                            } else {
                              Get.snackbar("Invalid Number", "Please enter a valid 10-digit number");
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0C831F),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
                          elevation: 0,
                        ),
                        child: _authCtrl.isLoading.value 
                          ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : Text(
                              _isEmailLogin ? "Login Now" : "Send verification code",
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                      ),
                    ),
                  )),
                  
                  const SizedBox(height: 24),
                  Center(
                    child: Text(
                      "By continuing, you agree to our Terms & Privacy",
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: const Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
