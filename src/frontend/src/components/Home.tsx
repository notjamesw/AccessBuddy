import React from 'react';
import VoiceRecorder from "./VoiceRecorder.tsx";

const Home = () => {
    return (
        <div className = "flex-rows text-xl min-w-80 min-h-80 bg-slate-900 text-white flex items-center justify-center">
            <VoiceRecorder />
        </div>
    );
};

export default Home;