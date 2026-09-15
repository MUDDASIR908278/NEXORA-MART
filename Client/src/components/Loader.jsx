export default function Loader({ full = false }) {
  return (
    <div className="spinner-wrap" style={full ? { minHeight: '60vh' } : undefined}>
      <div className="spinner" role="status" aria-label="Loading" />
    </div>
  )
}