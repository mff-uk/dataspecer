import React from "react";

const SyncDiaButton = ({ refresh }: { refresh: () => void }) => {
    return (
        <div className="absolute left-2 top-2">
            <button onClick={refresh} className="text-indigo-600 hover:text-lg hover:text-indigo-900">
                ↻
            </button>
        </div>
    );
};

export default SyncDiaButton;
