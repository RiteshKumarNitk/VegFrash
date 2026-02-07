import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../controllers/cart_controller.dart';
import 'product_details_screen.dart';

class CategoryBrowserScreen extends StatefulWidget {
  const CategoryBrowserScreen({super.key});

  @override
  State<CategoryBrowserScreen> createState() => _CategoryBrowserScreenState();
}

class _CategoryBrowserScreenState extends State<CategoryBrowserScreen> {
  final _supabase = Supabase.instance.client;
  final _cartCtrl = Get.find<CartController>();
  
  List<dynamic> categories = [];
  List<dynamic> products = [];
  int selectedCategoryIndex = 0;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final catRes = await _supabase.from('categories').select('*').order('name');
      final prodRes = await _supabase.from('products').select('*, image_url:image');
      
      if (mounted) {
        setState(() {
          categories = catRes as List<dynamic>;
          products = prodRes as List<dynamic>;
          isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => isLoading = false);
    }
  }

  List<dynamic> get filteredProducts {
    if (categories.isEmpty) return [];
    final selectedCatId = categories[selectedCategoryIndex]['id'];
    return products.where((p) => p['category_id'] == selectedCatId).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        title: Text(
          "Categories",
          style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 18),
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.search_rounded, color: Colors.black)),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF3C0B69)))
          : Row(
              children: [
                // Left Column: Categories
                Container(
                  width: 100,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    border: Border(right: BorderSide(color: Colors.grey.shade200, width: 0.5)),
                  ),
                  child: ListView.builder(
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final cat = categories[index];
                      final isSelected = selectedCategoryIndex == index;
                      return GestureDetector(
                        onTap: () => setState(() => selectedCategoryIndex = index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white : Colors.transparent,
                            border: Border(
                              left: BorderSide(
                                color: isSelected ? const Color(0xFF3C0B69) : Colors.transparent,
                                width: 4,
                              ),
                            ),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  boxShadow: isSelected ? [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4)] : [],
                                ),
                                child: Center(
                                  child: cat['image'] != null && cat['image'].toString().startsWith('http')
                                      ? Image.network(cat['image'], width: 30, height: 30)
                                      : Text(cat['image'] ?? '🥗', style: const TextStyle(fontSize: 20)),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                cat['name'],
                                textAlign: TextAlign.center,
                                style: GoogleFonts.outfit(
                                  fontSize: 10,
                                  fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                                  color: isSelected ? const Color(0xFF3C0B69) : Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Right Column: Products Grid
                Expanded(
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              categories[selectedCategoryIndex]['name'],
                              style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 16),
                            ),
                            const Icon(Icons.tune_rounded, size: 20),
                          ],
                        ),
                      ),
                      Expanded(
                        child: GridView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.65,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                          itemCount: filteredProducts.length,
                          itemBuilder: (context, index) {
                            final p = filteredProducts[index];
                            return _buildProductCard(p);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildProductCard(dynamic p) {
    return GestureDetector(
      onTap: () => Get.to(() => ProductDetailsScreen(product: p), transition: Transition.fadeIn),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade100),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: p['image_url'] != null
                          ? Image.network(p['image_url'], fit: BoxFit.contain)
                          : const Text("🥦", style: TextStyle(fontSize: 30)),
                    ),
                  ),
                  if (p['old_price'] != null && p['old_price'] > p['price'])
                    Positioned(
                      top: 0,
                      left: 0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: const BoxDecoration(
                          color: Color(0xFFE91E63),
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(12),
                            bottomRight: Radius.circular(8),
                          ),
                        ),
                        child: Text(
                          "${(((p['old_price'] - p['price']) / p['old_price']) * 100).toStringAsFixed(0)}% off",
                          style: GoogleFonts.outfit(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    p['name'],
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 12),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "${p['weight'] ?? '1'} ${p['unit'] ?? 'kg'}",
                    style: GoogleFonts.outfit(color: Colors.grey, fontSize: 10),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "₹${p['price']}",
                        style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 14),
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
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFFE91E63)),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            "ADD",
                            style: GoogleFonts.outfit(color: const Color(0xFFE91E63), fontWeight: FontWeight.bold, fontSize: 10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
