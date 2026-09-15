export default function Skeleton({
  width = '100%',
  height = '16px',
  radius = 'var(--radius-sm)',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="product-media">
        <Skeleton width="100%" height="100%" radius="0" />
      </div>
      <div className="product-body">
        <Skeleton width="40%" height="10px" />
        <Skeleton width="85%" height="14px" />
        <Skeleton width="55%" height="14px" />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: 8,
            gap: 10,
          }}
        >
          <Skeleton width="60px" height="18px" />
          <Skeleton width="64px" height="30px" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="order-card">
      <div className="order-head">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width="140px" height="14px" />
          <Skeleton width="90px" height="11px" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton width="70px" height="20px" radius="999px" />
          <Skeleton width="70px" height="16px" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton width="100%" height="12px" />
        <Skeleton width="80%" height="12px" />
      </div>
    </div>
  )
}