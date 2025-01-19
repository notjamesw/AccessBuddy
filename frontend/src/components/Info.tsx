import React from 'react';

const Info = () => {
    return (
        <div className="flex flex-col items-center justify-center min-w-96 min-h-80 bg-slate-900 text-white p-6 pt-8">
            <div className="bg-slate-800 shadow-lg rounded-lg p-4 pt-5 max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-4 text-center text-yellow-400">Welcome to Access Buddy!</h1>
                <p className="text-lg mb-6 text-center">
                    An easy-to-use browser tool that lets you control websites just by speaking.
                </p>

                <h2 className="text-2xl font-semibold mb-2">How to Use</h2>
                <ol className="list-inside space-y-1 text-lg">
                    <li>
                        <span className="font-medium">Step 1:</span> Ensure a physical controller is connected to this extension.
                    </li>
                    <li>
                        <span className="font-medium">Step 2:</span> Click twice to open the extension.
                    </li>
                    <li>
                        <span className="font-medium">Step 3:</span> Click once again to start dictating.
                    </li>
                    <li>
                        <span className="font-medium">Step 4:</span> Say what you want to do and watch it happen in the browser window.
                    </li>
                </ol>

                <p className="mt-8 text-sm text-gray-400 text-center">
                    Need help? Contact us at <a href="mailto:dongjiayang123@gmail.com" className="text-blue-400 underline">dongjiayang123@gmail.com</a>.
                </p>
            </div>
        </div>
    );
};

export default Info;