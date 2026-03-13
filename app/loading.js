export default function GlobalLoading() {
  return (
    <div className="route-loading-progress" role="status" aria-live="polite" aria-label="Loading page data">
      <span className="route-loading-progress__bar" />
    </div>
  );
}
