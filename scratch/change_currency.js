const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const replacements = {
  'app/dashboard/products/page.js': [
    ['Price (USD)', 'Price (Rupees)'],
    ['Price: $', 'Price: ₹'],
    ['minPrice || 0} - $', 'minPrice || 0} - ₹'],
    ['<td className="price-cell">$', '<td className="price-cell">₹'],
    ['<div className="input-prefix">$</div>', '<div className="input-prefix">₹</div>']
  ],
  'app/dashboard/page.js': [
    ['<p className="stat-value">$', '<p className="stat-value">₹'],
    ['<h2>$', '<h2>₹'],
    ['tickFormatter={(val) => `$${val}`}', 'tickFormatter={(val) => `₹${val}`}'],
    ['${avgOrderValue > 0 ? `$${avgOrderValue.toLocaleString()}` : \'$0\'}', '${avgOrderValue > 0 ? `₹${avgOrderValue.toLocaleString()}` : \'₹0\'}'],
    ['${refunds > 0 ? `$${refunds.toLocaleString()}` : \'$0\'}', '${refunds > 0 ? `₹${refunds.toLocaleString()}` : \'₹0\'}'],
    ['<div className="order-total">$', '<div className="order-total">₹']
  ],
  'app/dashboard/orders/page.js': [
    ["filters.amount === '$0 - $100'", "filters.amount === '₹0 - ₹100'"],
    ["filters.amount === '$100 - $500'", "filters.amount === '₹100 - ₹500'"],
    ["filters.amount === '$500+'", "filters.amount === '₹500+'"],
    ['High Value ($500+)', 'High Value (₹500+)'],
    ["['All', '$0 - $100', '$100 - $500', '$500+']", "['All', '₹0 - ₹100', '₹100 - ₹500', '₹500+']"],
    ['<div className="col-total"><strong>$', '<div className="col-total"><strong>₹'],
    ['<div className="col-price">$', '<div className="col-price">₹'],
    ['<div className="total-val">$', '<div className="total-val">₹']
  ],
  'app/dashboard/payments/page.js': [
    ['Flat Shipping Fee ($)', 'Flat Shipping Fee (₹)'],
    ['flat shipping fee of $', 'flat shipping fee of ₹']
  ],
  'app/store/[slug]/cart/page.js': [
    ['<p className="price">$', '<p className="price">₹'],
    ['<span>Subtotal</span>\n                <span>$', '<span>Subtotal</span>\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\n                <span>$', '<span>Estimated Tax (8%)</span>\n                <span>₹'],
    ['<span>Total</span>\n                <span>$', '<span>Total</span>\n                <span>₹'],
    ['<span>Subtotal</span>\r\n                <span>$', '<span>Subtotal</span>\r\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\r\n                <span>$', '<span>Estimated Tax (8%)</span>\r\n                <span>₹'],
    ['<span>Total</span>\r\n                <span>$', '<span>Total</span>\r\n                <span>₹']
  ],
  'app/store/[slug]/checkout/page.js': [
    ['<span className="order-val">$', '<span className="order-val">₹'],
    ['<span className="qty-price">{item.quantity} × $', '<span className="qty-price">{item.quantity} × ₹'],
    ['<span className="preview-total">$', '<span className="preview-total">₹'],
    ['<span>Subtotal</span>\n                  <span>$', '<span>Subtotal</span>\n                  <span>₹'],
    ['<span>Tax (8%)</span>\n                  <span>$', '<span>Tax (8%)</span>\n                  <span>₹'],
    ['<span>Total</span>\n                  <span>$', '<span>Total</span>\n                  <span>₹'],
    ['<span>Subtotal</span>\r\n                  <span>$', '<span>Subtotal</span>\r\n                  <span>₹'],
    ['<span>Tax (8%)</span>\r\n                  <span>$', '<span>Tax (8%)</span>\r\n                  <span>₹'],
    ['<span>Total</span>\r\n                  <span>$', '<span>Total</span>\r\n                  <span>₹'],
    ['order-amt">$', 'order-amt">₹'],
    ['order-val">$', 'order-val">₹']
  ],
  'app/store/[slug]/product/[id]/page.js': [
    ['<p className="price">$', '<p className="price">₹']
  ],
  'components/ProductCard.js': [
    ['<span className="product-price">$', '<span className="product-price">₹']
  ],
  'app/demo-store/[slug]/cart/CartClientPage.js': [
    ['<p className="price">$', '<p className="price">₹'],
    ['<span>Subtotal</span>\n                <span>$', '<span>Subtotal</span>\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\n                <span>$', '<span>Estimated Tax (8%)</span>\n                <span>₹'],
    ['<span>Total</span>\n                <span>$', '<span>Total</span>\n                <span>₹'],
    ['<span>Subtotal</span>\r\n                <span>$', '<span>Subtotal</span>\r\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\r\n                <span>$', '<span>Estimated Tax (8%)</span>\r\n                <span>₹'],
    ['<span>Total</span>\r\n                <span>$', '<span>Total</span>\r\n                <span>₹']
  ],
  'app/demo-store/[slug]/checkout/CheckoutClientPage.js': [
    ['<span className="order-val">$', '<span className="order-val">₹'],
    ['<span className="qty-price">{item.quantity} × $', '<span className="qty-price">{item.quantity} × ₹'],
    ['<span className="preview-total">$', '<span className="preview-total">₹'],
    ['<span>Subtotal</span>\n                  <span>$', '<span>Subtotal</span>\n                  <span>₹'],
    ['<span>Tax (8%)</span>\n                  <span>$', '<span>Tax (8%)</span>\n                  <span>₹'],
    ['<span>Total</span>\n                  <span>$', '<span>Total</span>\n                  <span>₹'],
    ['<span>Subtotal</span>\r\n                  <span>$', '<span>Subtotal</span>\r\n                  <span>₹'],
    ['<span>Tax (8%)</span>\r\n                  <span>$', '<span>Tax (8%)</span>\r\n                  <span>₹'],
    ['<span>Total</span>\r\n                  <span>$', '<span>Total</span>\r\n                  <span>₹']
  ],
  'app/demo-store/[slug]/product/[id]/ProductDetailsClient.js': [
    ['<p className="price">$', '<p className="price">₹']
  ],
  'app/admin/(dashboard)/page.js': [
    ['value: `$${totalRevenue.toLocaleString()}`', 'value: `₹${totalRevenue.toLocaleString()}`'],
    ['subChange: `+$${revenueThisWeek.toLocaleString()} this week`', 'subChange: `+₹${revenueThisWeek.toLocaleString()} this week`'],
    ['render: (row) => `$${row.total.toLocaleString()}`', 'render: (row) => `₹${row.total.toLocaleString()}`']
  ],
  'app/admin/(dashboard)/creators/page.js': [
    ['render: (row) => `$${(row.revenue || 0).toLocaleString()}`', 'render: (row) => `₹${(row.revenue || 0).toLocaleString()}`'],
    ['<span>${(selectedCreator.revenue || 0).toLocaleString()}</span>', '<span>₹{(selectedCreator.revenue || 0).toLocaleString()}</span>']
  ],
  'app/admin/(dashboard)/customers/page.js': [
    ['<span>${selectedCustomer.totalSpent || \'0.00\'}</span>', '<span>₹{selectedCustomer.totalSpent || \'0.00\'}</span>']
  ],
  'app/admin/(dashboard)/orders/page.js': [
    ['render: (row) => `$${row.total.toLocaleString()}`', 'render: (row) => `₹${row.total.toLocaleString()}`'],
    ['Total:</strong> <span style={{ color: \'#8b5cf6\', fontSize: \'18px\' }}>$', 'Total:</strong> <span style={{ color: \'#8b5cf6\', fontSize: \'18px\' }}>₹']
  ],
  'app/admin/(dashboard)/products/page.js': [
    ['render: (row) => `$${(row.price || 0).toLocaleString()}`', 'render: (row) => `₹${(row.price || 0).toLocaleString()}`'],
    ['<p className="price-tag">$', '<p className="price-tag">₹']
  ],
  'components/Admin/AdminAnalytics.js': [
    ['<span className="value">$', '<span className="value">₹']
  ],
  'components/Admin/TopStores.js': [
    ['<td className="revenue">$', '<td className="revenue">₹']
  ],
  'app/cart/page.js': [
    ['<p className="price">$', '<p className="price">₹'],
    ['<span>Subtotal</span>\n                <span>$', '<span>Subtotal</span>\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\n                <span>$', '<span>Estimated Tax (8%)</span>\n                <span>₹'],
    ['<span>Total</span>\n                <span>$', '<span>Total</span>\n                <span>₹'],
    ['<span>Subtotal</span>\r\n                <span>$', '<span>Subtotal</span>\r\n                <span>₹'],
    ['<span>Estimated Tax (8%)</span>\r\n                <span>$', '<span>Estimated Tax (8%)</span>\r\n                <span>₹'],
    ['<span>Total</span>\r\n                <span>$', '<span>Total</span>\r\n                <span>₹']
  ],
  'app/checkout/page.js': [
    ['<span className="order-amt">$', '<span className="order-amt">₹'],
    ['<span className="qty-price">{item.quantity} × $', '<span className="qty-price">{item.quantity} × ₹'],
    ['<span className="preview-total">$', '<span className="preview-total">₹'],
    ['<span>Subtotal</span>\n                  <span>$', '<span>Subtotal</span>\n                  <span>₹'],
    ['<span>Tax (8%)</span>\n                  <span>$', '<span>Tax (8%)</span>\n                  <span>₹'],
    ['<span>Total</span>\n                  <span>$', '<span>Total</span>\n                  <span>₹'],
    ['<span>Subtotal</span>\r\n                  <span>$', '<span>Subtotal</span>\r\n                  <span>₹'],
    ['<span>Tax (8%)</span>\r\n                  <span>$', '<span>Tax (8%)</span>\r\n                  <span>₹'],
    ['<span>Total</span>\r\n                  <span>$', '<span>Total</span>\r\n                  <span>₹']
  ],
  'app/customer/orders/page.js': [
    ['<span className="order-amount">$', '<span className="order-amount">₹'],
    ['<span className="qty-price">{item.quantity} × $', '<span className="qty-price">{item.quantity} × ₹'],
    ['<span className="item-subtotal">$', '<span className="item-subtotal">₹'],
    ['<span>${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>', '<span>₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>']
  ],
  'app/account/orders/page.js': [
    ['<span className="order-total">$', '<span className="order-total">₹'],
    ['<span className="item-qty-price">{item.quantity} × $', '<span className="item-qty-price">{item.quantity} × ₹'],
    ['<span className="item-sub">$', '<span className="item-sub">₹']
  ]
};

// Also apply regex-based fixes to capture any stray item totals or price expressions in JS files
const regexReplacements = [
  {
    pattern: /item-total">\s*\$/g,
    replacement: 'item-total">\n                    ₹'
  },
  {
    pattern: /item-total">\s*\$/g,
    replacement: 'item-total">\r\n                    ₹'
  }
];

function processFile(relPath, rules) {
  const absPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`File not found: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(absPath, 'utf8');
  let original = content;

  // 1. Literal rules
  for (const [target, replacement] of rules) {
    if (content.includes(target)) {
      content = content.split(target).join(replacement);
      console.log(`  Replaced literal: "${target}" -> "${replacement}"`);
    }
  }

  // 2. Regex rules
  for (const { pattern, replacement } of regexReplacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      console.log(`  Replaced regex pattern`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(absPath, content, 'utf8');
    console.log(`✅ Updated: ${relPath}`);
  } else {
    console.log(`ℹ️ No changes needed in: ${relPath}`);
  }
}

console.log('Starting currency update to Rupees (₹)...');
for (const [relPath, rules] of Object.entries(replacements)) {
  processFile(relPath, rules);
}
console.log('Currency update completed successfully.');
