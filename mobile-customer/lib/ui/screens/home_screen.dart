import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shimmer/shimmer.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../../controllers/cart_controller.dart';
import 'cart_screen.dart';
import 'my_orders_screen.dart';
import 'add_address_screen.dart';
import 'login_screen.dart';
import 'product_details_screen.dart';
import '../../controllers/navigation_controller.dart';
import '../widgets/festival_banner.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _supabase = Supabase.instance.client;
  final _cartCtrl = Get.find<CartController>();
  final _navCtrl = Get.find<NavigationController>();
  
  List<dynamic> categories = [];
  List<dynamic> products = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      debugPrint("DEBUG: Fetching categories and products...");
      final catRes = await _supabase.from('categories').select('*').order('name');
      debugPrint("DEBUG: Categories response: ${catRes.length} items");
      
      final prodRes = await _supabase.from('products').select('*, image_url:image');
      debugPrint("DEBUG: Products raw response: ${prodRes.length} items");
      
      final prodList = List<dynamic>.from(prodRes);
      if (prodList.isNotEmpty) {
        debugPrint("DEBUG: First product keys: ${prodList[0].keys}");
      }

      if (mounted) {
        setState(() {
          categories = catRes as List<dynamic>;
          products = prodRes as List<dynamic>;
          isLoading = false;
        });
      }
    } catch (e) {
      debugPrint("DEBUG: Error fetching home data: $e");
      if (mounted) {
        setState(() {
          errorMessage = e.toString();
          isLoading = false;
        });
      }
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
          if (dotenv.env['SUPABASE_URL'] != null)
             SliverToBoxAdapter(
              child: Container(
                color: Colors.blue.withOpacity(0.05),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: Text(
                  "Connected: ${dotenv.env['SUPABASE_URL']}",
                  style: const TextStyle(color: Colors.blue, fontSize: 10),
                ),
              ),
            ),
          if (errorMessage != null)
            SliverToBoxAdapter(
              child: Container(
                color: Colors.redAccent.withOpacity(0.1),
                padding: const EdgeInsets.all(16),
                child: Text(
                  "Debug Error: $errorMessage",
                  style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                ),
              ),
            ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                _buildSectionHeader("Your Go-to Items"),
                isLoading ? _buildProductShimmer() : _buildProductList(),
                const SizedBox(height: 24),
                FestivalBanner(),
                const SizedBox(height: 32),
                _buildSectionHeader("Explore By Categories"),
                isLoading 
                  ? _buildCategoryShimmer() 
                  : errorMessage != null
                    ? Center(child: Text("Unable to load categories", style: GoogleFonts.outfit()))
                    : categories.isEmpty
                      ? Center(child: Text("No categories found", style: GoogleFonts.outfit()))
                      : _buildCategoryList(),
                const SizedBox(height: 20),
                _buildOfferPill(),
                const SizedBox(height: 100), // Bottom padding for cart summary
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: null,
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
              if (_checkAuth()) {
                Get.to(() => MyOrdersScreen(), transition: Transition.cupertino);
              }
            },
          ),
          ListTile(
            leading: const Icon(Icons.location_on_rounded, color: Color(0xFF1E293B)),
            title: Text("Saved Addresses", style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
            onTap: () {
              Get.back();
              if (_checkAuth()) {
                Get.to(() => AddAddressScreen(), transition: Transition.cupertino);
              }
            },
          ),
          const Spacer(),
          const Divider(),
          if (user != null)
            ListTile(
              leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
              title: Text("Logout", style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: Colors.redAccent)),
              onTap: () async {
                await _supabase.auth.signOut();
                Get.offAll(() => const LoginScreen());
              },
            )
          else
            ListTile(
              leading: const Icon(Icons.login_rounded, color: Color(0xFF0C831F)),
              title: Text("Login / Sign Up", style: GoogleFonts.outfit(fontWeight: FontWeight.w700, color: const Color(0xFF0C831F))),
              onTap: () => Get.to(() => const LoginScreen()),
            ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  bool _checkAuth() {
    if (_supabase.auth.currentUser == null) {
      Get.to(() => const LoginScreen());
      return false;
    }
    return true;
  }

  Widget _buildAppBar() {
    return SliverPadding(
      padding: EdgeInsets.zero,
      sliver: SliverAppBar(
        floating: true,
        pinned: true,
        backgroundColor: const Color(0xFF3C0B69), // Zepto Purple
        elevation: 0,
        scrolledUnderElevation: 0,
        automaticallyImplyLeading: false,
        titleSpacing: 0,
        toolbarHeight: 120,
        title: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              "HOME - Koramangala, Bangalore",
                              style: GoogleFonts.outfit(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: Colors.white),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person_outline_rounded, color: Colors.white, size: 22),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: [
                    const Icon(Icons.search_rounded, color: Colors.grey, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      "Search \"milk\"",
                      style: GoogleFonts.outfit(
                        color: Colors.grey,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.mic_none_rounded, color: Colors.grey, size: 20),
                  ],
                ),
              ),
            ],
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(40),
          child: Container(
            width: double.infinity,
            color: const Color(0xFFE91E63), // Pinkish Red from Zepto
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Text(
              "Zapping Delivery in 14 mins",
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(
                color: Colors.white,
                fontWeight: FontWeight.w900,
                fontSize: 12,
                letterSpacing: 0.5,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.w900,
              color: Colors.black,
            ),
          ),
          GestureDetector(
            onTap: () => _navCtrl.changeIndex(1), // Switch to Categories tab
            child: Row(
              children: [
                Text(
                  "See All",
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: const Color(0xFFE91E63),
                  ),
                ),
                const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFFE91E63)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryList() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: categories.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          childAspectRatio: 0.75,
          crossAxisSpacing: 12,
          mainAxisSpacing: 16,
        ),
        itemBuilder: (context, index) {
          final cat = categories[index];
          final List<Color> bgColors = [
            const Color(0xFFF5F3FF),
            const Color(0xFFFFF7ED),
            const Color(0xFFEFF6FF),
            const Color(0xFFECFDF5),
          ];
          final bgColor = bgColors[index % bgColors.length];

          return GestureDetector(
            onTap: () => _navCtrl.changeIndex(1), // Switch to Categories tab
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.black.withOpacity(0.02)),
                    ),
                    alignment: Alignment.center,
                    child: cat['image'] != null && cat['image'].toString().startsWith('http')
                        ? Padding(
                            padding: const EdgeInsets.all(12),
                            child: Image.network(
                              cat['image'],
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Text("🥗", style: TextStyle(fontSize: 32)),
                            ),
                          )
                        : Text(
                            cat['image'] ?? '🥗',
                            style: const TextStyle(fontSize: 32),
                          ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  cat['name'],
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1E293B),
                    height: 1.1,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOfferPill() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF9C27B0).withOpacity(0.9), // Purple offer bar
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const Icon(Icons.settings_suggest_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                "Get 10% Off on adding items worth ₹999 to cart!",
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductList() {
    return SizedBox(
      height: 250,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: products.length,
        itemBuilder: (context, index) {
          final p = products[index];
          return Container(
            width: 160,
            margin: const EdgeInsets.only(right: 16),
            child: GestureDetector(
              onTap: () => Get.to(() => ProductDetailsScreen(product: p), transition: Transition.fadeIn),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade100),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image & Discount Badge
                    Expanded(
                      flex: 3,
                      child: Stack(
                        children: [
                          Center(
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Hero(
                                tag: "product_image_${p['id']}",
                                child: p['image_url'] != null
                                    ? Image.network(p['image_url'], fit: BoxFit.contain)
                                    : const Text("🥦", style: TextStyle(fontSize: 40)),
                              ),
                            ),
                          ),
                          if (p['old_price'] != null && p['old_price'] > p['price'])
                            Positioned(
                              top: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                                decoration: const BoxDecoration(
                                  color: Color(0xFFE91E63),
                                  borderRadius: BorderRadius.only(
                                    bottomLeft: Radius.circular(8),
                                    topRight: Radius.circular(16),
                                  ),
                                ),
                                child: Text(
                                  "${(((p['old_price'] - p['price']) / p['old_price']) * 100).toStringAsFixed(0)}% off",
                                  style: GoogleFonts.outfit(
                                    color: Colors.white,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                    
                    // Product Info
                    Expanded(
                      flex: 2,
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              p['name'],
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: const Color(0xFF1E293B),
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              "${p['weight'] ?? '1'} ${p['unit'] ?? 'kg'}",
                              style: GoogleFonts.outfit(
                                color: const Color(0xFF94A3B8),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Spacer(),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (p['old_price'] != null)
                                      Text(
                                        "₹${p['old_price']}",
                                        style: GoogleFonts.outfit(
                                          decoration: TextDecoration.lineThrough,
                                          color: const Color(0xFF94A3B8),
                                          fontSize: 10,
                                        ),
                                      ),
                                    Text(
                                      "₹${p['price']}",
                                      style: GoogleFonts.outfit(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 15,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ],
                                ),
                                GestureDetector(
                                  onTap: () {
                                    _cartCtrl.addItem(
                                      id: p['id'].toString(),
                                      name: p['name'],
                                      price: p['price'].toDouble(),
                                      unit: p['unit'] ?? 'kg',
                                      image: p['image_url'],
                                    );
                                    Get.snackbar(
                                      "Added to Cart",
                                      "${p['name']} added to your basket",
                                      snackPosition: SnackPosition.BOTTOM,
                                      backgroundColor: const Color(0xFF3C0B69),
                                      colorText: Colors.white,
                                      duration: const Duration(seconds: 1),
                                      margin: const EdgeInsets.all(12),
                                    );
                                  },
                                  child: Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.grey.shade200),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.05),
                                          blurRadius: 4,
                                          offset: const Offset(0, 2),
                                        )
                                      ],
                                    ),
                                    child: const Icon(Icons.add, color: Color(0xFFE91E63), size: 20),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
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
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: GestureDetector(
          onTap: () => Get.to(() => const CartScreen(), transition: Transition.cupertino),
          child: Container(
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFF0C831F),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                )
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "${_cartCtrl.uniqueItemCount} ITEMS",
                      style: GoogleFonts.outfit(
                        color: Colors.white.withOpacity(0.8),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      "₹${_cartCtrl.subtotal.toStringAsFixed(0)}",
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Row(
                  children: [
                    Text(
                      "View Cart",
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.arrow_right_rounded, color: Colors.white, size: 28),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    });
  }
}
