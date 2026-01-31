export const SITE_CONFIG = {
    name: 'VegFrash',
    currency: '₹',
    deliveryTime: '10 MINS',
    contactSupport: 'support@vegfrash.com',
};

export const CATEGORIES = [
    { name: 'Paan Corner', image: '🍃', color: '#dcfce7', slug: 'paan-corner' },
    { name: 'Dairy, Bread & Eggs', image: '🥛', color: '#f3e8ff', slug: 'dairy-bread-eggs' },
    { name: 'Vegetables', image: '🥦', color: '#dcfce7', slug: 'vegetables' },
    { name: 'Fruits', image: '🍎', color: '#fee2e2', slug: 'fruits' },
    { name: 'Cold Drinks & Juices', image: '🥤', color: '#e0f2fe', slug: 'cold-drinks-juices' },
    { name: 'Snacks & Munchies', image: '🍟', color: '#fef3c7', slug: 'snacks-munchies' },
    { name: 'Breakfast & Instant Food', image: '🥣', color: '#ffedd5', slug: 'breakfast-instant-food' },
    { name: 'Sweet Tooth', image: '🍫', color: '#fce7f3', slug: 'sweet-tooth' },
    { name: 'Bakery & Biscuits', image: '🍪', color: '#f1f5f9', slug: 'bakery-biscuits' },
    { name: 'Tea, Coffee & Health Drinks', image: '☕', color: '#fee2e2', slug: 'tea-coffee-health-drinks' },
    { name: 'Atta, Rice & Dal', image: '🍚', color: '#fae8ff', slug: 'atta-rice-dal' },
];

export const PRODUCTS = [
    {
        id: 'amul-taaza-500',
        name: 'Amul Taaza Toned Fresh Milk',
        weight: '500 ml',
        price: 27,
        oldPrice: 30,
        image: '🥛',
        category: 'dairy-bread-eggs',
        inStock: true,
        isAd: false
    },
    {
        id: 'nandini-goodlife-500',
        name: 'Nandini GoodLife Toned Milk',
        weight: '500 ml',
        price: 28,
        image: '🥛',
        category: 'dairy-bread-eggs',
        inStock: true,
        isAd: false
    },
    {
        id: 'tomato-hybrid-500',
        name: 'Farm Fresh Tomatoes (Hybrid)',
        weight: '500 g',
        price: 18,
        oldPrice: 24,
        image: '🍅',
        category: 'fruits-vegetables',
        inStock: true,
        isAd: true
    },
    {
        id: 'onion-medium-1kg',
        name: 'Onion (Medium Size)',
        weight: '1 kg',
        price: 45,
        oldPrice: 60,
        image: '🧅',
        category: 'fruits-vegetables',
        inStock: true,
        isAd: false
    },
    {
        id: 'potato-1kg',
        name: 'Potato (Aloo)',
        weight: '1 kg',
        price: 35,
        oldPrice: 40,
        image: '🥔',
        category: 'fruits-vegetables',
        inStock: true,
        isAd: false
    },
    {
        id: 'coriander-100g',
        name: 'Coriander (Dhaniya)',
        weight: '100 g',
        price: 15,
        oldPrice: 20,
        image: '🌿',
        category: 'fruits-vegetables',
        inStock: true,
        isAd: false
    },
    {
        id: 'lays-classic-salted',
        name: 'Lays Classic Salted Chips',
        weight: '52 g',
        price: 20,
        image: '🥔',
        category: 'snacks-munchies',
        inStock: true,
        isAd: false
    },
    {
        id: 'coke-750ml',
        name: 'Coca Cola Soft Drink',
        weight: '750 ml',
        price: 45,
        image: '🥤',
        category: 'cold-drinks-juices',
        inStock: true,
        isAd: false
    }
];

export const BANNERS = [
    {
        id: 'main-hero',
        title: 'Fast, Fresh & Festive',
        subtitle: 'Fresh produce delivered in 10 minutes.',
        ctaText: 'Shop Now',
        backgroundGradient: 'linear-gradient(135deg, #0C831F, #096317)',
        textColor: '#FFFFFF'
    }
];
