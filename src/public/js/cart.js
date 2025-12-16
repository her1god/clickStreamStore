// Simple Cart Logic using LocalStorage

// State
let isCartOpen = false;

// Logger Helper
async function logEvent(imgEvent, productId) {
    try {
        await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: imgEvent, productId })
        });
    } catch (e) { console.error("Logging failed", e); }
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if exists
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Log It!
    logEvent('ADD_TO_CART', product.id);

    // If cart is open, re-render
    if (isCartOpen) renderCart();
    
    // Optional: Visual Feedback
    alert(`Added ${product.name} to cart!`);
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart(); 
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.innerText = total;
        badge.classList.remove('hidden');
        if (total === 0) badge.classList.add('hidden');
    }
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    isCartOpen = !isCartOpen;
    
    if (isCartOpen) {
        renderCart();
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    
    container.innerHTML = '';
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100';
            div.innerHTML = `
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${item.name}</h4>
                    <p class="text-gray-500 text-xs">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="font-bold text-blue-600 text-sm">Rp ${itemTotal.toLocaleString('id-ID')}</span>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700 font-bold text-xl">&times;</button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    totalEl.innerText = 'Rp ' + totalPrice.toLocaleString('id-ID');
}

async function checkout() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return alert("Cart is empty!");

    if (confirm("Proceed to Checkout?")) {
        // Log Purchase for each item
        for (const item of cart) {
            // Log quantity times? Or just once per product per checkout?
            // Let's log once per item type for simplicity or loop quantity.
            // For analytics "Purchase Count", often quantity matters.
            // We'll just fire one PURCHASE event per product type in cart for now to keep traffic light,
            // or maybe fire generic 'PURCHASE' with metadata. 
            // Simple: Log 'PURCHASE' per product ID.
            await logEvent('PURCHASE', item.id);
        }

        alert("Checkout Successful! Thank you.");
        localStorage.removeItem('cart');
        updateCartBadge();
        toggleCart();
    }
}

// Init on load
document.addEventListener('DOMContentLoaded', updateCartBadge);
