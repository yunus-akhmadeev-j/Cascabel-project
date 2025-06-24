export class OrderView {
  constructor() {}

setupOrderForm(onSubmit) {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Submit button clicked');
                onSubmit();
            });
        } else {
            console.error('Submit button not found in order form');
        }
    } else {
        console.error('Order form not found');
    }
}

  getOrderData() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return null;
    const requirements = document.getElementById('requirements');
    const size = document.getElementById('size');
    const price = document.getElementById('price');
    return {
      requirements: requirements ? requirements.value : '',
      size: size ? size.value : '',
      price: price ? parseInt(price.value) || 0 : 0
    };
  }
  clearForm() {
    const requirements = document.getElementById('requirements');
    const size = document.getElementById('size');
    const price = document.getElementById('price');
    if (requirements) requirements.value = '';
    if (size) size.value = '';
    if (price) price.value = '';
  }
}