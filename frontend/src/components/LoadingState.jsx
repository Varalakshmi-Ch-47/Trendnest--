import './Common.css';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-state" role="status">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
}

export default LoadingState;