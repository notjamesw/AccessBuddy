import React from 'react';

const info = ({ navigate }) => {
    return (
        <div>
            <h1 className='text-purple-60'>Info</h1>
            <button onClick={() => navigate('homepage')}>Go to Info</button>
        </div>
    );
}

export default info;