import React from 'react'; 

export default function Price({ value }) {
  const clp = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(value || 0);

  return <span className="price">{clp}</span>;
}
