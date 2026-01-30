import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../controllers/registration_controller.dart';

class RegistrationScreen extends StatelessWidget {
  final String phone;
  const RegistrationScreen({super.key, required this.phone});

  @override
  Widget build(BuildContext context) {
    final ctrl = Get.put(RegistrationController());
    ctrl.setPhone(phone);

    return Scaffold(
      appBar: AppBar(title: const Text("Partner Registration")),
      body: Obx(() {
        if (ctrl.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return Stepper(
          currentStep: ctrl.currentStep.value,
          onStepContinue: ctrl.nextStep,
          onStepCancel: ctrl.prevStep,
          
          controlsBuilder: (context, details) {
             return Padding(
               padding: const EdgeInsets.only(top: 20),
               child: Row(
                 children: [
                   Expanded(
                     child: ElevatedButton(
                       onPressed: details.onStepContinue,
                       style: ElevatedButton.styleFrom(
                         backgroundColor: Colors.greenAccent,
                         foregroundColor: Colors.black,
                         padding: const EdgeInsets.symmetric(vertical: 16)
                       ),
                       child: Text(ctrl.currentStep.value == 3 ? "SUBMIT" : "NEXT"),
                     ),
                   ),
                   if (ctrl.currentStep.value > 0) ...[
                     const SizedBox(width: 12),
                     TextButton(
                       onPressed: details.onStepCancel, 
                       child: const Text("Back")
                     )
                   ]
                 ],
               ),
             );
          },
          
          steps: [
            Step(
              title: const Text("Basic Info"),
              isActive: ctrl.currentStep.value >= 0,
              content: Column(
                children: [
                   TextField(controller: ctrl.nameCtrl, decoration: const InputDecoration(labelText: "Full Name")),
                   TextField(controller: ctrl.dobCtrl, decoration: const InputDecoration(labelText: "Date of Birth (YYYY-MM-DD)")),
                   TextField(controller: ctrl.bloodGroupCtrl, decoration: const InputDecoration(labelText: "Blood Group")),
                ],
              ),
            ),
            Step(
              title: const Text("Vehicle Details"),
              isActive: ctrl.currentStep.value >= 1,
              content: Column(
                children: [
                  Obx(() => DropdownButton<String>(
                    value: ctrl.vehicleType.value,
                    isExpanded: true,
                    items: ['bike', 'scooter', 'ev', 'cycle'].map((e) => DropdownMenuItem(value: e, child: Text(e.toUpperCase()))).toList(), 
                    onChanged: (v) => ctrl.vehicleType.value = v!,
                  )),
                  TextField(controller: ctrl.vehicleModelCtrl, decoration: const InputDecoration(labelText: "Vehicle Model (e.g. Activa 6G)")),
                  TextField(controller: ctrl.vehiclePlateCtrl, decoration: const InputDecoration(labelText: "Plate Number (KA 01 AB 1234)")),
                ],
              ),
            ),
            Step(
              title: const Text("KYC Documents"),
              isActive: ctrl.currentStep.value >= 2,
              content: Column(
                children: [
                   const Text("Enter Identity Numbers (Photos in next update)", style: TextStyle(fontSize: 12, color: Colors.grey)),
                   TextField(controller: ctrl.aadharCtrl, decoration: const InputDecoration(labelText: "Aadhar Number")),
                   TextField(controller: ctrl.panCtrl, decoration: const InputDecoration(labelText: "PAN Number")),
                   TextField(controller: ctrl.licenseCtrl, decoration: const InputDecoration(labelText: "Driving License Number")),
                ],
              ),
            ),
            Step(
              title: const Text("Banking Info"),
              isActive: ctrl.currentStep.value >= 3,
              content: Column(
                children: [
                   const Text("For weekly payouts", style: TextStyle(fontSize: 12, color: Colors.grey)),
                   TextField(controller: ctrl.accountCtrl, decoration: const InputDecoration(labelText: "Bank Account Number")),
                   TextField(controller: ctrl.ifscCtrl, decoration: const InputDecoration(labelText: "IFSC Code")),
                ],
              ),
            ),
          ],
        );
      }),
    );
  }
}
