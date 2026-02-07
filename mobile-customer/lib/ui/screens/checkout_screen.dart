import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../controllers/cart_controller.dart';
import 'home_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _supabase = Supabase.instance.client;
  final _cartCtrl = Get.find<CartController>();
  
  String selectedPayment = 'cod';
  String? selectedAddressId;
  String? selectedSlot;
  List<dynamic> deliverySlots = [];
  bool isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _fetchSlots();
  }

  Future<void> _fetchSlots() async {
    try {
      final res = await _supabase.from('site_settings').select('*').eq('key', 'delivery_slots').single();
      if (res['value'] != null) {
        setState(() {
          deliverySlots = (res['value'] as List).where((s) => s['active'] == true).toList();
          if (deliverySlots.isNotEmpty) {
            selectedSlot = "${deliverySlots[0]['label']} (${deliverySlots[0]['time']})";
          }
        });
      }
    } catch (e) {
      debugPrint("Error fetching slots: $e");
    }
  }

  Future<void> _placeOrder() async {
    if (selectedSlot == null) {
      Get.snackbar("Slot Required", "Please select a delivery slot", snackPosition: SnackPosition.TOP);
      return;
    }

    setState(() => isPlacingOrder = true);

    try {
      final user = _supabase.auth.currentUser;
      if (user == null) throw "Please login to place order";

      // 1. Create Order record
      final orderRes = await _supabase.from('orders').insert({
        'id': "ORD-${DateTime.now().millisecondsSinceEpoch}",
        'user_id': user.id,
        'total_amount': _cartCtrl.subtotal + 2 + 25,
        'status': 'pending',
        'items': _cartCtrl.items.values.map((e) => {
          'id': e.id,
          'name': e.name,
          'qty': e.quantity.value,
          'price': e.price,
        }).toList(),
        'delivery_slot': selectedSlot,
        'payment_method': selectedPayment,
      }).select().single();

      final orderId = orderRes['id'];

      // 2. Insert Order Items
      final orderItems = _cartCtrl.items.values.map((e) => {
        'order_id': orderId,
        'product_id': e.id,
        'quantity': e.quantity.value,
        'price_at_time': e.price,
        'unit': e.unit,
      }).toList();

      await _supabase.from('order_items').insert(orderItems);

      // 3. Success
      _cartCtrl.clear();
      Get.offAll(() => const OrderSuccessScreen());

    } catch (e) {
      Get.snackbar("Order Failed", e.toString(), backgroundColor: Colors.redAccent, colorText: Colors.white);
    } finally {
      setState(() => isPlacingOrder = false);
    }
  }

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
        title: Text(
          "Checkout",
          style: GoogleFonts.outfit(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800, fontSize: 20),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              _buildStepTitle("1. Delivery Slot"),
              _buildSlotSelection(),
              const SizedBox(height: 24),
              _buildStepTitle("2. Payment Method"),
              _buildPaymentSelection(),
              const SizedBox(height: 32),
              _buildOrderSummary(),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  Widget _buildStepTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B)),
      ),
    );
  }

  Widget _buildSlotSelection() {
    if (deliverySlots.isEmpty) return const SizedBox.shrink();
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: deliverySlots.map((slot) {
        String label = "${slot['label']} (${slot['time']})";
        bool isSelected = selectedSlot == label;
        return GestureDetector(
          onTap: () => setState(() => selectedSlot = label),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF0C831F).withOpacity(0.05) : Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: isSelected ? const Color(0xFF0C831F) : const Color(0xFFE2E8F0), width: 1.5),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  slot['label'],
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isSelected ? const Color(0xFF0C831F) : const Color(0xFF94A3B8),
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  slot['time'],
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentSelection() {
    final methods = [
      {'id': 'cod', 'name': 'Cash on Delivery', 'icon': Icons.money_rounded},
      {'id': 'upi', 'name': 'UPI / QR Code', 'icon': Icons.qr_code_2_rounded},
      {'id': 'card', 'name': 'Credit / Debit Card', 'icon': Icons.credit_card_rounded},
    ];

    return Column(
      children: methods.map((m) {
        bool isSelected = selectedPayment == m['id'];
        return GestureDetector(
          onTap: () => setState(() => selectedPayment = m['id'] as String),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isSelected ? const Color(0xFF0C831F).withOpacity(0.05) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isSelected ? const Color(0xFF0C831F) : const Color(0xFFE2E8F0), width: 1.5),
            ),
            child: Row(
              children: [
                Icon(m['icon'] as IconData, color: isSelected ? const Color(0xFF0C831F) : const Color(0xFF94A3B8)),
                const SizedBox(width: 16),
                Text(
                  m['name'] as String,
                  style: GoogleFonts.outfit(
                    fontSize: 16, 
                    fontWeight: FontWeight.w700,
                    color: isSelected ? const Color(0xFF1E293B) : const Color(0xFF64748B)
                  ),
                ),
                const Spacer(),
                if (isSelected) const Icon(Icons.check_circle_rounded, color: Color(0xFF0C831F)),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildOrderSummary() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          _buildSummaryRow("Total Amount", "₹${_cartCtrl.subtotal.toStringAsFixed(0)}"),
          _buildSummaryRow("Platform Fee", "₹2"),
          _buildSummaryRow("Delivery Fee", "₹25"),
          const Divider(height: 24),
          _buildSummaryRow("Payable Amount", "₹${(_cartCtrl.subtotal + 27).toStringAsFixed(0)}", isBold: true),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.outfit(fontWeight: isBold ? FontWeight.w800 : FontWeight.w500, color: const Color(0xFF64748B))),
          Text(value, style: GoogleFonts.outfit(fontWeight: FontWeight.w800, color: const Color(0xFF1E293B))),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: const Offset(0, -10))],
      ),
      child: SizedBox(
        width: double.infinity,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            boxShadow: [BoxShadow(color: const Color(0xFF0C831F).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
          ),
          child: ElevatedButton(
            onPressed: isPlacingOrder ? null : _placeOrder,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0C831F),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 20),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
              elevation: 0,
            ),
            child: isPlacingOrder 
              ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text("Place Order", style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800)),
          ),
        ),
      ),
    );
  }
}

class OrderSuccessScreen extends StatelessWidget {
  const OrderSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120, height: 120,
                decoration: const BoxDecoration(color: Color(0xFFECFDF5), shape: BoxShape.circle),
                child: const Icon(Icons.check_circle_rounded, size: 80, color: Color(0xFF0C831F)),
              ),
              const SizedBox(height: 32),
              Text(
                "Order Placed!",
                style: GoogleFonts.outfit(fontSize: 32, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
              ),
              const SizedBox(height: 12),
              Text(
                "Your fresh veggies are on their way. You can track your order in the My Orders section.",
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(fontSize: 16, color: const Color(0xFF64748B), fontWeight: FontWeight.w500, height: 1.5),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.offAll(() => const HomeScreen()),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0C831F),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 18),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  ),
                  child: Text("Continue Shopping", style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
