import { memo, type PropsWithChildren } from 'react'

function Info({ children, className = '' }: PropsWithChildren<{className?: string}>) {
  return <div className={`${className} Info`}>
    {children}
  </div>
};

export default  memo(Info);
