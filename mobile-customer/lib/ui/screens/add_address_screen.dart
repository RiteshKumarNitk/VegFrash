import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../controllers/address_controller.dart';

class AddAddressScreen extends StatelessWidget {
  const AddAddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(AddressController());

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF1E293B), size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          "Set Delivery Location",
          style: GoogleFonts.outfit(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800, fontSize: 18),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Map Placeholder (Modern Visual)
          Expanded(
            flex: 3,
            child: Container(
              width: double.infinity,
              color: const Color(0xFFF1F5F9),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  const Icon(Icons.map_rounded, size: 80, color: Color(0xFFCBD5E1)),
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0C831F),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 5)],
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(Icons.location_pin, color: Colors.white, size: 18),
                  ),
                  Positioned(
                    bottom: 20,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)]),
                      child: Text("Pin your location on map", style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B))),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Form (Polished)
          Expanded(
            flex: 7,
            child: Container(
              padding: const EdgeInsets.fromLTRB(28, 32, 28, 0),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(36)),
              ),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Enter Address Details", style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B))),
                    const SizedBox(height: 24),
                    
                    Row(
                      children: [
                        Expanded(child: _buildField(ctrl.houseCtrl, "House/Flat No", Icons.home_filled)),
                        const SizedBox(width: 16),
                        Expanded(child: _buildField(ctrl.floorCtrl, "Floor No", Icons.layers_rounded)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildField(ctrl.areaCtrl, "Apartment / Area / Locality", Icons.business_rounded),
                    const SizedBox(height: 16),
                    _buildField(ctrl.landmarkCtrl, "Nearby Landmark (Optional)", Icons.flag_rounded),
                    const SizedBox(height: 32),
                    
                    Text("Save Address As", style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B))),
                    const SizedBox(height: 16),
                    Obx(() => Row(
                      children: ['Home', 'Work', 'Other'].map((label) {
                        final isSelected = ctrl.selectedLabel.value == label;
                        return Padding(
                          padding: const EdgeInsets.only(right: 12),
                          child: GestureDetector(
                            onTap: () => ctrl.selectedLabel.value = label,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF0C831F).withOpacity(0.05) : const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: isSelected ? const Color(0xFF0C831F) : const Color(0xFFE2E8F0), width: 1.5),
                              ),
                              child: Text(
                                label,
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800,
                                  color: isSelected ? const Color(0xFF0C831F) : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    )),
                    const SizedBox(height: 48),
                    _buildSaveButton(ctrl),
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildField(TextEditingController c, String hint, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
      ),
      child: TextField(
        controller: c,
        style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: const Color(0xFF1E293B)),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, size: 20, color: const Color(0xFF94A3B8)),
          hintText: hint,
          hintStyle: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w500, color: const Color(0xFF94A3B8)),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
        ),
      ),
    );
  }

  Widget _buildSaveButton(AddressController ctrl) {
    return Obx(() => Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0C831F).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: ElevatedButton(
        onPressed: ctrl.isLoading.value ? null : ctrl.saveAddress,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF0C831F),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
          elevation: 0,
        ),
        child: ctrl.isLoading.value 
          ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
          : Text("Save & Proceed", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
      ),
    ));
  }
}
