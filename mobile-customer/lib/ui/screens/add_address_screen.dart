import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/address_controller.dart';

class AddAddressScreen extends StatelessWidget {
  const AddAddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(AddressController());

    return Scaffold(
      appBar: AppBar(title: const Text("Add Delivery Address")),
      body: Column(
        children: [
          // Map Placeholder (Top Half)
          Expanded(
            flex: 4,
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  color: Colors.grey[200],
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.map, size: 48, color: Colors.grey),
                        Text("Google Maps View\n(Pin Exact Location)", textAlign: TextAlign.center),
                      ],
                    ),
                  ),
                ),
                const Center(child: Icon(Icons.location_on, size: 40, color: Colors.red)),
              ],
            ),
          ),
          
          // Form (Bottom Half)
          Expanded(
            flex: 6,
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(blurRadius: 10, color: Colors.black12)]
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Enter Address Details", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    
                    Row(
                      children: [
                        Expanded(child: _buildTextField(ctrl.houseCtrl, "House / Flat No", icon: Icons.home)),
                        const SizedBox(width: 12),
                        Expanded(child: _buildTextField(ctrl.floorCtrl, "Floor No", icon: Icons.layers)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildTextField(ctrl.areaCtrl, "Apartment / Road / Area", icon: Icons.apartment),
                    const SizedBox(height: 12),
                    _buildTextField(ctrl.landmarkCtrl, "Nearby Landmark (Optional)", icon: Icons.flag),
                    const SizedBox(height: 20),
                    
                    const Text("Save Address As", style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),
                    Obx(() => Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: ['Home', 'Work', 'Other'].map((label) {
                        final isSelected = ctrl.selectedLabel.value == label;
                        return ChoiceChip(
                          label: Text(label), 
                          selected: isSelected,
                          onSelected: (val) => ctrl.selectedLabel.value = label,
                          selectedColor: Get.theme.primaryColor.withOpacity(0.2),
                          labelStyle: TextStyle(
                            color: isSelected ? Get.theme.primaryColor : Colors.black,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal
                          ),
                        );
                      }).toList(),
                    )),
                    
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: Obx(() => ElevatedButton(
                        onPressed: ctrl.isLoading.value ? null : ctrl.saveAddress,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Get.theme.primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))
                        ),
                        child: ctrl.isLoading.value 
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text("SAVE ADDRESS", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                      )),
                    )
                  ],
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildTextField(TextEditingController c, String hint, {IconData? icon}) {
    return TextField(
      controller: c,
      decoration: InputDecoration(
        prefixIcon: icon != null ? Icon(icon, size: 20, color: Colors.grey) : null,
        hintText: hint,
        filled: true,
        fillColor: Colors.grey[50],
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)
      ),
    );
  }
}
