import { memo, type PropsWithChildren } from 'react'

function Card({ children, className = '' }: PropsWithChildren<{className?: string}>) {
  return <div className={`${className} Card`}>
    {children}
  </div>
};

export default  memo(Card);
