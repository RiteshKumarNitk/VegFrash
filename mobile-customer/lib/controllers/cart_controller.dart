import 'package:get/get.dart';

class CartItem {
  final String id;
  final String name;
  final double price;
  final String unit; // 'kg' or 'pc'
  RxDouble quantity; // Mutable for GetX reactive UI

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.unit,
    double initialQty = 1.0,
  }) : quantity = initialQty.obs;

  double get total => price * quantity.value;
}

class CartController extends GetxController {
  var items = <String, CartItem>{}.obs; // productId -> CartItem

  int get itemCount => items.length;
  
  double get totalAmount {
    return items.values.fold(0.0, (sum, item) => sum + item.total);
  }

  void addItem(String id, String name, double price, String unit) {
    if (items.containsKey(id)) {
      items[id]!.quantity.value += (unit == 'kg' ? 0.5 : 1);
    } else {
      items[id] = CartItem(
        id: id, 
        name: name, 
        price: price, 
        unit: unit,
        initialQty: unit == 'kg' ? 0.5 : 1 // Default start for kg is 500g
      );
    }
  }

  void removeItem(String id) {
     items.remove(id);
  }

  void increment(String id) {
    if (items.containsKey(id)) {
      final item = items[id]!;
      item.quantity.value += (item.unit == 'kg' ? 0.5 : 1);
    }
  }

  void decrement(String id) {
    if (items.containsKey(id)) {
      final item = items[id]!;
      if (item.quantity.value > (item.unit == 'kg' ? 0.5 : 1)) {
        item.quantity.value -= (item.unit == 'kg' ? 0.5 : 1);
      } else {
        items.remove(id);
      }
    }
  }
  
  void clear() {
    items.clear();
  }
}
