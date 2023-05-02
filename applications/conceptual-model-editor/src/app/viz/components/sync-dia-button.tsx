import React from "react";

const SyncDiaButton = ({ refresh }: { refresh: () => any }) => {
    return (
        <div className="absolute left-0 top-0 p-2">
            <button onClick={refresh} className="text-indigo-600 hover:text-lg hover:text-indigo-900">
                ↻
            </button>
        </div>
    );
};

export default SyncDiaButton;
