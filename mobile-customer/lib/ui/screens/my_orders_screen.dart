import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

class MyOrdersScreen extends StatefulWidget {
  const MyOrdersScreen({super.key});

  @override
  State<MyOrdersScreen> createState() => _MyOrdersScreenState();
}

class _MyOrdersScreenState extends State<MyOrdersScreen> {
  final _supabase = Supabase.instance.client;
  List<dynamic> orders = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
    _setupSubscription();
  }

  Future<void> _fetchOrders() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return;

      final res = await _supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      if (mounted) {
        setState(() {
          orders = res as List<dynamic>;
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching orders: $e");
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _setupSubscription() {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    _supabase
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('user_id', user.id)
        .listen((data) {
          _fetchOrders(); // Reload on change
        });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF1E293B), size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          "My Orders",
          style: GoogleFonts.outfit(color: const Color(0xFF1E293B), fontWeight: FontWeight.w800, fontSize: 20),
        ),
        centerTitle: true,
      ),
      body: isLoading
          ? _buildShimmer()
          : orders.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.all(20),
                  itemCount: orders.length,
                  itemBuilder: (context, index) {
                    final order = orders[index];
                    return _buildOrderCard(order);
                  },
                ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    final date = DateTime.parse(order['created_at']);
    final formattedDate = DateFormat('MMM dd, yyyy • hh:mm a').format(date);
    final status = order['status']?.toString() ?? 'pending';

    Color statusColor;
    IconData statusIcon;
    switch (status) {
      case 'delivered':
        statusColor = const Color(0xFF0C831F);
        statusIcon = Icons.check_circle_rounded;
        break;
      case 'out_for_delivery':
        statusColor = Colors.blue;
        statusIcon = Icons.delivery_dining_rounded;
        break;
      case 'packed':
        statusColor = Colors.amber.shade700;
        statusIcon = Icons.inventory_2_rounded;
        break;
      default:
        statusColor = const Color(0xFF64748B);
        statusIcon = Icons.access_time_filled_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 15, offset: const Offset(0, 5))
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Container(
                  width: 45, height: 45,
                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                  child: Icon(statusIcon, color: statusColor, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        status.toUpperCase().replaceAll('_', ' '),
                        style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: statusColor, letterSpacing: 1),
                      ),
                      Text(
                        "Order #${order['id'].toString().substring(0, 8).toUpperCase()}",
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B)),
                      ),
                    ],
                  ),
                ),
                Text(
                  "₹${order['total_amount']}",
                  style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: const Color(0xFF1E293B)),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  formattedDate,
                  style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w600),
                ),
                Text(
                  order['items']?.length.toString() ?? '0' + " Items",
                  style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF64748B), fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          if (status != 'delivered')
             Container(
               width: double.infinity,
               padding: const EdgeInsets.all(20),
               decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24))),
               child: Row(
                 children: [
                   const Icon(Icons.info_outline_rounded, size: 16, color: Color(0xFF0C831F)),
                   const SizedBox(width: 8),
                   Expanded(
                     child: Text(
                        "Track your fresh delivery real-time.",
                        style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF0C831F)),
                     ),
                   ),
                   Icon(Icons.arrow_forward_ios_rounded, size: 12, color: const Color(0xFF0C831F).withOpacity(0.5)),
                 ],
               ),
             ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
     return Center(
       child: Column(
         mainAxisAlignment: MainAxisAlignment.center,
         children: [
           Container(
             width: 120, height: 120,
             decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
             child: const Icon(Icons.receipt_long_rounded, size: 60, color: Color(0xFFCBD5E1)),
           ),
           const SizedBox(height: 24),
           Text("No orders yet", style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: const Color(0xFF1E293B))),
           const SizedBox(height: 8),
           Text("Your order history will appear here.", style: GoogleFonts.outfit(fontSize: 14, color: const Color(0xFF94A3B8), fontWeight: FontWeight.w500)),
         ],
       ),
     );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[100]!,
      highlightColor: Colors.grey[50]!,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: 4,
        itemBuilder: (_, __) => Container(
          height: 150,
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24)),
        ),
      ),
    );
  }
}
