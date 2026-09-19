import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-6">
      <div className="max-w-md w-full text-center space-y-6 card-minimal p-8 sm:p-10 rounded-[10px]">
        
        {/* Display Heading */}
        <div className="space-y-2">
          <span className="font-editorial text-6xl text-[var(--text-primary)] block">
            404<span className="text-[var(--accent-coral)]">.</span>
          </span>
          <h1 className="font-editorial text-2xl text-[var(--text-primary)]">
            Page not found
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            The resource or examination module you requested could not be located.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
          <Link to="/" className="btn-primary">
            Return home
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            Go to dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
