import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shimmer/shimmer.dart';
import '../../controllers/cart_controller.dart';
import 'cart_screen.dart';
import 'my_orders_screen.dart';
import 'add_address_screen.dart';
import 'login_screen.dart';
import 'product_details_screen.dart';
import '../widgets/festival_banner.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _supabase = Supabase.instance.client;
  final _cartCtrl = Get.find<CartController>();
  
  List<dynamic> categories = [];
  List<dynamic> products = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final responses = await Future.wait([
        _supabase.from('categories').select('*').order('name'),
        _supabase.from('products').select('*').eq('is_visible', true),
      ]);

      if (mounted) {
        setState(() {
          categories = responses[0] as List<dynamic>;
          products = responses[1] as List<dynamic>;
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("Error fetching home data: $e");
      if (mounted) setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      drawer: _buildDrawer(),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                FestivalBanner(),
                const SizedBox(height: 24),
                _buildSectionHeader("Shop by Category"),
                isLoading ? _buildCategoryShimmer() : _buildCategoryList(),
                const SizedBox(height: 32),
                _buildSectionHeader("Fresh Pickups"),
                isLoading ? _buildProductShimmer() : _buildProductList(),
                const SizedBox(height: 100), // Bottom padding for cart summary
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: _buildCartSummary(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
    );
  }

  Widget _buildDrawer() {
    final user = _supabase.auth.currentUser;
    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(color: Color(0xFF0C831F)),
            currentAccountPicture: const CircleAvatar(
              backgroundColor: Colors.white,
              child: Icon(Icons.person_rounded, color: Color(0xFF0C831F), size: 40),
            ),
            accountName: Text(
              "VegFrash Customer",
              style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 18),
            ),
            accountEmail: Text(
              user?.phone ?? "Welcome to VegFrash",
              style: GoogleFonts.outfit(fontWeight: FontWeight.w500),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.receipt_long_rounded, color: Color(0xFF1E293B)),
            title: Text("My Orders", style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
            onTap: () {
              Get.back();
              Get.to(() => MyOrdersScreen(), transition: Transition.cupertino);
            },
          ),
          ListTile(
            leading: const Icon(Icons.location_on_rounded, color: Color(0xFF1E293B)),
            title: Text("Saved Addresses", style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
            onTap: () {
              Get.back();
              Get.to(() => AddAddressScreen(), transition: Transition.cupertino);
            },
          ),
          const Spacer(),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
            title: Text("Logout", style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.redAccent)),
            onTap: () async {
              await _supabase.auth.signOut();
              Get.offAll(() => LoginScreen());
            },
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      floating: true,
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      leading: Builder(
        builder: (context) => IconButton(
          icon: const Icon(Icons.menu_rounded, color: Color(0xFF1E293B)),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "VegFrash",
            style: GoogleFonts.outfit(
              color: const Color(0xFF0C831F),
              fontWeight: FontWeight.w900,
              fontSize: 26,
            ),
          ),
          Row(
            children: [
              const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFF64748B)),
              const SizedBox(width: 4),
              Text(
                "Koramangala, Bangalore",
                style: GoogleFonts.outfit(
                  color: const Color(0xFF64748B),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Icon(Icons.keyboard_arrow_down_rounded, size: 16, color: Color(0xFF64748B)),
            ],
          ),
        ],
      ),
      actions: [
        CircleAvatar(
          backgroundColor: const Color(0xFFF1F5F9),
          child: IconButton(
            icon: const Icon(Icons.search_rounded, color: Color(0xFF1E293B)),
            onPressed: () {},
          ),
        ),
        const SizedBox(width: 12),
        CircleAvatar(
          backgroundColor: const Color(0xFFF1F5F9),
          child: IconButton(
            icon: const Icon(Icons.person_outline_rounded, color: Color(0xFF1E293B)),
            onPressed: () {},
          ),
        ),
        const SizedBox(width: 16),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF1E293B),
            ),
          ),
          Text(
            "See all",
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF0C831F),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryList() {
    return SizedBox(
      height: 120,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Container(
            width: 85,
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: Column(
              children: [
                Container(
                  width: 65,
                  height: 65,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFF1F5F9), width: 1.5),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    cat['image'] ?? '🥗',
                    style: const TextStyle(fontSize: 30),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  cat['name'],
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF334155),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 20),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final p = products[index];
        return GestureDetector(
          onTap: () => Get.to(() => ProductDetailsScreen(product: p), transition: Transition.fadeIn),
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFF1F5F9)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Row(
              children: [
                Hero(
                  tag: "product_image_${p['id']}",
                  child: Container(
                    width: 75,
                    height: 75,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    alignment: Alignment.center,
                    child: p['image_url'] != null
                        ? Image.network(p['image_url'], fit: BoxFit.cover)
                        : const Text("🥦", style: TextStyle(fontSize: 32)),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        p['name'],
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: const Color(0xFF1E293B),
                        ),
                      ),
                      Text(
                        "${p['weight'] ?? '1'} ${p['unit'] ?? 'kg'} • Fresh",
                        style: GoogleFonts.outfit(
                          color: const Color(0xFF64748B),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "₹${p['price']}",
                        style: GoogleFonts.outfit(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: const Color(0xFF0C831F),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  children: [
                    Obx(() {
                      bool isInCart = _cartCtrl.items.containsKey(p['id'].toString());
                      if (isInCart) {
                        final item = _cartCtrl.items[p['id'].toString()]!;
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0C831F),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                icon: const Icon(Icons.remove, color: Colors.white, size: 16),
                                onPressed: () => _cartCtrl.decrement(p['id'].toString()),
                              ),
                              Text(
                                item.quantity.value.toStringAsFixed(item.unit == 'kg' ? 1 : 0),
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              IconButton(
                                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                icon: const Icon(Icons.add, color: Colors.white, size: 16),
                                onPressed: () => _cartCtrl.increment(p['id'].toString()),
                              ),
                            ],
                          ),
                        );
                      }
                      return ElevatedButton(
                        onPressed: () {
                          _cartCtrl.addItem(
                            id: p['id'].toString(),
                            name: p['name'],
                            price: p['price'].toDouble(),
                            unit: p['unit'] ?? 'kg',
                            image: p['image_url'],
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF0C831F),
                          elevation: 0,
                          side: const BorderSide(color: Color(0xFF0C831F), width: 1.5),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: Text(
                          "ADD",
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 14),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCategoryShimmer() {
    return SizedBox(
      height: 120,
      child: Shimmer.fromColors(
        baseColor: Colors.grey[100]!,
        highlightColor: Colors.grey[50]!,
        child: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          scrollDirection: Axis.horizontal,
          itemCount: 5,
          itemBuilder: (_, __) => Padding(
            padding: const EdgeInsets.only(right: 20),
            child: Column(
              children: [
                Container(width: 65, height: 65, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                const SizedBox(height: 8),
                Container(width: 50, height: 10, color: Colors.white),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProductShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey[100]!,
      highlightColor: Colors.grey[50]!,
      child: ListView.builder(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: 3,
        itemBuilder: (_, __) => Container(
          height: 100,
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
        ),
      ),
    );
  }

  Widget _buildCartSummary() {
    return Obx(() {
      if (_cartCtrl.items.isEmpty) return const SizedBox.shrink();
      return GestureDetector(
        onTap: () => Get.to(() => const CartScreen(), transition: Transition.cupertino),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: BoxDecoration(
            color: const Color(0xFF0C831F),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0C831F).withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              )
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "${_cartCtrl.uniqueItemCount} ITEMS",
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    "₹${_cartCtrl.subtotal.toStringAsFixed(0)} plus taxes",
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    "View Cart",
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.shopping_basket_rounded, color: Colors.white, size: 20),
                ],
              ),
            ],
          ),
        ),
      );
    });
  }
}
