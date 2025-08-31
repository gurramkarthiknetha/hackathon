import { useState, useEffect } from "react";

const TestVideoFeed = () => {
  const [message, setMessage] = useState("Component is loading...");

  useEffect(() => {
    console.log('TestVideoFeed mounted');
    setMessage("Component loaded successfully!");
  }, []);

  return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Test Video Feed</h1>
        <p className="text-gray-300">{message}</p>
        <div className="mt-4 p-4 bg-blue-600 rounded">
          <p className="text-white">If you can see this, React is working!</p>
        </div>
      </div>
    </div>
  );
};

export default TestVideoFeed;
