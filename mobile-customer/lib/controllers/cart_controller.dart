import 'package:get/get.dart';

class CartItem {
  final String id;
  final String name;
  final double price;
  final String unit; // 'kg', 'unit', 'pc', etc.
  final String? image;
  RxDouble quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    this.image,
    double initialQty = 1.0,
  }) : quantity = initialQty.obs;

  double get total => price * quantity.value;
}

class CartController extends GetxController {
  var items = <String, CartItem>{}.obs;

  int get uniqueItemCount => items.length;
  
  double get subtotal {
    return items.values.fold(0.0, (sum, item) => sum + item.total);
  }

  void addItem({
    required String id, 
    required String name, 
    required double price, 
    required String unit,
    String? image,
  }) {
    if (items.containsKey(id)) {
      increment(id);
    } else {
      double startQty = _getStepSize(unit);
      items[id] = CartItem(
        id: id, 
        name: name, 
        price: price, 
        unit: unit,
        image: image,
        initialQty: startQty
      );
    }
  }

  void increment(String id) {
    if (items.containsKey(id)) {
      final item = items[id]!;
      item.quantity.value += _getStepSize(item.unit);
    }
  }

  void decrement(String id) {
    if (items.containsKey(id)) {
      final item = items[id]!;
      double step = _getStepSize(item.unit);
      if (item.quantity.value > step) {
        item.quantity.value -= step;
      } else {
        items.remove(id);
      }
    }
  }

  double _getStepSize(String unit) {
    final u = unit.toLowerCase();
    if (u.contains('kg') || u.contains('gram')) return 0.5; // 500g increments
    return 1.0; // Per piece increments
  }
  
  void clear() => items.clear();
}
