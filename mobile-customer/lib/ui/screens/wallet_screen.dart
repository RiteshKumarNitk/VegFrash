import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text("Wallet", style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.w900)),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.account_balance_wallet_rounded, size: 80, color: Color(0xFF3C0B69)),
            const SizedBox(height: 16),
            Text(
              "VegFrash Wallet",
              style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              "Coming Soon!",
              style: GoogleFonts.outfit(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}
