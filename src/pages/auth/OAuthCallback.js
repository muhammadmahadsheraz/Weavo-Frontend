import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('calendar') || searchParams.get('status');
    if (window.opener) {
      window.opener.postMessage({ type: 'OAUTH_CALLBACK', status }, window.location.origin);
      window.close();
    } else {
      window.location.href = '/settings';
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#050709' }}>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Closing...</p>
    </div>
  );
};

export default OAuthCallback;
