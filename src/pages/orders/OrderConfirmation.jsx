import React from 'react';
import { Link } from 'react-router-dom';

export const OrderConfirmation = ({ order }) => {
  return (
    <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '30px' }}>
      <h1 style={{ color: 'var(--gold2)', fontFamily: 'Playfair Display, serif' }}>Thank You For Your Order</h1>
      <p style={{ color: 'var(--cream)', margin: '16px 0 24px' }}>
        Your heirloom order has been confirmed. Our artisans are preparing your luxury pieces.
      </p>
      <Link to="/orders" className="gbtn" style={{ textDecoration: 'none' }}>
        Track My Order
      </Link>
    </div>
  );
};

export default OrderConfirmation;

