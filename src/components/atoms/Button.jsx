import React from 'react'; 

export default function Button({ children, onClick, kind }){
const cls = 'btn' + (kind === 'primary' ? ' primary' : '');
return <button className={cls} onClick={onClick}>{children}</button>;
}