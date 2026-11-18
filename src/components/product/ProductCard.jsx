import React from 'react';
import { getSafeImageUrl } from '../../utils/imageUrl';

export const ProductCard = ({ product, onSelect, onQuickView }) => {
  const imgUrl = getSafeImageUrl(product?.image_url || product?.images?.[0]?.image_url);

  return (
    <article className="card" onClick={() => onSelect && onSelect(product)}>
      <div
        className="card-img"
        style={{
          backgroundImage: imgUrl.startsWith('var(') ? imgUrl : `url("${imgUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '240px'
        }}
      />
      <div className="card-body" style={{ padding: '14px' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--cream)', margin: '0 0 6px' }}>{product?.name}</h3>
        <p style={{ color: 'var(--gold2)', fontWeight: 600, margin: 0 }}>₹{product?.selling_price}</p>
      </div>
    </article>
  );
};

export default ProductCard;

